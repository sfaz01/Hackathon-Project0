
import React, { useState, useCallback, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { fileToBase64 } from '../utils/fileUtils';
import { CameraIcon, MapPinIcon, BrainCircuitIcon, XMarkIcon } from './icons';

interface ReportFormProps {
    onSubmit: (description: string, photo: { base64: string, mimeType: string, url: string }, location: { latitude: number, longitude: number } | null, thinkingMode: boolean) => void;
    onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onCancel }) => {
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
    const [thinkingMode, setThinkingMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { location, status: geoStatus, error: geoError, getLocation } = useGeolocation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto({ file, url: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !photo) {
            alert("Please provide a description and a photo.");
            return;
        }
        setIsSubmitting(true);
        try {
            const base64 = await fileToBase64(photo.file);
            onSubmit(description, { base64, mimeType: photo.file.type, url: photo.url }, location, thinkingMode);
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to process photo. Please try again.");
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (photo?.url) {
                URL.revokeObjectURL(photo.url);
            }
        };
    }, [photo]);

    return (
        <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Report a New Issue</h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon className="h-7 w-7" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Issue Description</label>
                    <textarea
                        id="description"
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="e.g., Large pothole on the corner of Main St and 1st Ave."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Photo of Issue</label>
                    {photo ? (
                        <div className="relative">
                            <img src={photo.url} alt="Issue preview" className="w-full h-auto max-h-64 object-cover rounded-md" />
                            <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <CameraIcon className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                            </div>
                            <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <button type="button" onClick={getLocation} disabled={geoStatus === 'loading'} className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/10">
                        <MapPinIcon className="h-5 w-5" />
                        {geoStatus === 'loading' && 'Fetching location...'}
                        {geoStatus === 'idle' && 'Get Current Location'}
                        {geoStatus === 'success' && location && `Location Acquired: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                        {geoStatus === 'error' && 'Could not get location'}
                    </button>
                    {geoError && <p className="text-red-400 text-sm mt-2">{geoError.message}</p>}
                </div>

                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="thinking-mode"
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-600 bg-gray-900 rounded"
                            checked={thinkingMode}
                            onChange={(e) => setThinkingMode(e.target.checked)}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="thinking-mode" className="font-medium text-gray-200 flex items-center gap-2">
                           <BrainCircuitIcon className="h-5 w-5 text-indigo-400" /> Advanced AI Analysis (Thinking Mode)
                        </label>
                        <p className="text-gray-400">Uses a more powerful model for complex issues. May take longer.</p>
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-4">
                    <button type="button" onClick={onCancel} className="text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || !photo || !description} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-200 shadow-lg shadow-indigo-500/50 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed">
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};