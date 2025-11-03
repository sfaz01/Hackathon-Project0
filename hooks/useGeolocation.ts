
import { useState, useCallback } from 'react';
import type { Geolocation } from '../types';

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface GeolocationState {
  status: GeolocationStatus;
  location: Geolocation | null;
  error: GeolocationPositionError | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    location: null,
    error: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', location: null, error: { message: "Geolocation is not supported by your browser." } as GeolocationPositionError });
      return;
    }

    setState({ status: 'loading', location: null, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        setState({
          status: 'error',
          location: null,
          error: error,
        });
      }
    );
  }, []);

  return { ...state, getLocation };
};
