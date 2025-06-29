import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DalleTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDalle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test DALL-E');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>DALL-E 2 & 3 Test Interface</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testDalle} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Testing DALL-E..." : "Test DALL-E Generation"}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">Success!</h3>
              <p className="text-green-700">{result.message}</p>
            </div>
            
            {result.imageUrl && (
              <div className="space-y-2">
                <h4 className="font-semibold">Generated Image:</h4>
                <img 
                  src={result.imageUrl} 
                  alt={result.petData?.name || "Generated Pet"} 
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}
            
            {result.petData && (
              <div className="space-y-2">
                <h4 className="font-semibold">Pet Data:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {result.petData.name}</p>
                  <p><strong>Type:</strong> {result.petData.type}</p>
                  <p><strong>Color:</strong> {result.petData.color}</p>
                  <p><strong>Element:</strong> {result.petData.element}</p>
                  <p><strong>Rarity:</strong> {result.petData.rarity}</p>
                  <p><strong>Features:</strong> {result.petData.specialFeatures?.join(", ")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}