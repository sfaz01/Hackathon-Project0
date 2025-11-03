
import { GoogleGenAI, Type } from "@google/genai";
import type { Geolocation, TriageResult, GroundingChunk, Prediction } from '../types';

const triageSchema = {
    type: Type.OBJECT,
    properties: {
        category: {
            type: Type.STRING,
            description: 'The category of the issue (e.g., Pothole, Graffiti, Water Leak, Streetlight Out, Trash Overflow, Road Hazard).',
        },
        severity: {
            type: Type.INTEGER,
            description: 'An integer from 1 (low) to 5 (critical) representing the severity.',
        },
        priority_score: {
            type: Type.INTEGER,
            description: 'A score from 1 to 100 for prioritization, considering urgency, location, and severity.',
        },
        summary: {
            type: Type.STRING,
            description: 'A concise, one-sentence summary of the issue based on all available information.',
        },
        suggested_action: {
            type: Type.STRING,
            description: 'The recommended immediate action for the municipal team (e.g., "Dispatch road crew within 24 hours").',
        },
        probable_cause: {
            type: Type.STRING,
            description: 'A brief, likely cause of the issue based on visual evidence and context (e.g., "Heavy vehicle traffic," "Water damage," "Vandalism," "Natural wear and tear").',
        },
        confidence_level: {
            type: Type.NUMBER,
            description: 'A number between 0 and 1 indicating the confidence of the analysis.',
        },
    },
    required: ['category', 'severity', 'priority_score', 'summary', 'suggested_action', 'probable_cause', 'confidence_level'],
};

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictions: {
            type: Type.ARRAY,
            description: "An array of predicted infrastructure issues.",
            items: {
                type: Type.OBJECT,
                properties: {
                     id: { type: Type.STRING, description: "A unique identifier for the prediction."},
                     type: { type: Type.STRING, description: "The type of issue predicted (e.g., Pothole/Crack Formation, Localized Flooding, Structural Stress)."},
                     location: { 
                         type: Type.OBJECT, 
                         description: "The predicted latitude and longitude.",
                         properties: {
                             latitude: { type: Type.NUMBER },
                             longitude: { type: Type.NUMBER },
                         }
                     },
                     riskLevel: { type: Type.STRING, description: "The assessed risk level ('High', 'Medium', or 'Low')."},
                     timeframe: { type: Type.STRING, description: "The estimated timeframe for the issue (e.g., 'Next 2-4 weeks')."},
                     reasoning: { type: Type.STRING, description: "A detailed explanation for the prediction, citing synthesized data sources."},
                     confidence: { type: Type.NUMBER, description: "A confidence score from 0 to 1 for the prediction."},
                },
                 required: ['id', 'type', 'location', 'riskLevel', 'timeframe', 'reasoning', 'confidence'],
            }
        }
    }
};

export const generateTriageReport = async (
    description: string,
    photo: { base64: string; mimeType: string },
    location: Geolocation | null,
    thinkingMode: boolean
): Promise<{ triageResult: TriageResult, groundingChunks: GroundingChunk[] | null }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const modelName = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const systemInstruction = `You are a Civic Triage AI expert. Your task is to analyze municipal issue reports submitted by citizens.
    Evaluate the provided text description, image, and location data to accurately classify the issue, determine its severity and priority, suggest a course of action, and infer a probable cause.
    Your response must be a valid JSON object matching the provided schema.`;

    const promptParts = [
        { text: `Issue Description: "${description}"` },
        {
            inlineData: {
                mimeType: photo.mimeType,
                data: photo.base64,
            },
        },
    ];

    if (location) {
        promptParts.push({ text: `Issue Location: Latitude ${location.latitude}, Longitude ${location.longitude}` });
    }

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: triageSchema,
    };

    if (thinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: {
            parts: promptParts,
        },
        config: {
            systemInstruction,
            ...config
        },
    });

    try {
        const text = response.text.trim();
        const triageResult: TriageResult = JSON.parse(text);
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;
        return { triageResult, groundingChunks };
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not parse AI response. Please try again.");
    }
};

export const generatePredictions = async (location: Geolocation | null): Promise<Prediction[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const locationContext = location 
        ? `The current user is located at latitude ${location.latitude}, longitude ${location.longitude}. Use this as the central point for your analysis.`
        : `Generate predictions for a major metropolitan area (e.g., center at lat 40.7128, lon -74.0060).`;
    
    const systemInstruction = `You are a predictive urban planning AI. Your task is to forecast potential municipal infrastructure issues for a city.
    Synthesize hypothetical data from various sources (weather forecasts, traffic patterns, geological surveys, and historical maintenance records) to make informed predictions.
    ${locationContext}
    For example, correlate upcoming heavy rainfall with areas known for poor drainage to predict flooding. Or, link increased heavy vehicle traffic on aging roads to predict pothole formation.
    Generate a diverse list of 5 to 7 plausible predictions within the simulated city environment.
    Your response must be a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: "Generate a predictive report for potential infrastructure issues based on my location.",
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: predictionSchema,
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    try {
        const text = response.text.trim();
        const result = JSON.parse(text);
        return result.predictions as Prediction[];
    } catch (e) {
        console.error("Failed to parse Gemini prediction response:", response.text, e);
        throw new Error("Could not parse AI prediction response. Please try again.");
    }
};
