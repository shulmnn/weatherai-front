'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon, SendIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function WeatherPage() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [message, setMessage] = useState<any>('');
  const [loading, setLoading] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        (error) => {
          toast.error(`Error getting your location: ${error}`);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleSendData = async () => {
    if (!location) {
      toast.error('Location is needed to process your data.');
    }

    toast.loading('Fetching data...');
    setLoading(true);

    const response = await fetch(`${process.env.BACKEND_URL}/weather`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location?.latitude.toString(),
        longitude: location?.longitude.toString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch error:', errorData);
      toast.error(
        `Error fetching data: ${errorData.message || 'Unknown error'}`
      );
      setLoading(false);
      return;
    }

    const data = await response.json();
    setMessage(data.response);
    toast.dismiss();
    toast.success('Successfully fetched data!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Weather App
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Button onClick={handleShareLocation} disabled={loading}>
              <MapPinIcon className="mr-2 h-4 w-4" />
              Share Location
            </Button>
          </div>

          {location && (
            <p className="text-center text-sm text-gray-500">
              Location: {location.latitude.toFixed(4)},{' '}
              {location.longitude.toFixed(4)}
            </p>
          )}

          <div className="flex justify-center">
            <Button onClick={handleSendData} disabled={!location || loading}>
              <SendIcon className="mr-2 h-4 w-4" />
              Send Data
            </Button>
          </div>

          {message && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
