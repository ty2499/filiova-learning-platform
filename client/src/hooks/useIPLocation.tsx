import { useState, useEffect } from 'react';

interface IPLocationData {
  country: string;
  countryCode: string;
  currency: string;
  loading: boolean;
  error: string | null;
}

export function useIPLocation() {
  const [locationData, setLocationData] = useState<IPLocationData>({
    country: '',
    countryCode: '',
    currency: 'USD',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Use ipapi.co for IP-based geolocation (free tier available)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.error) {
          throw new Error(data.reason || 'Failed to detect location');
        }

        setLocationData({
          country: data.country_name || '',
          countryCode: data.country_code || '',
          currency: data.currency || 'USD',
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('IP location detection error:', error);
        setLocationData({
          country: '',
          countryCode: '',
          currency: 'USD',
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to detect location',
        });
      }
    };

    detectLocation();
  }, []);

  const isSouthAfrican = locationData.countryCode === 'ZA';

  return {
    ...locationData,
    isSouthAfrican,
  };
}
