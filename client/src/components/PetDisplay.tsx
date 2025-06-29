import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pet } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PetDisplay() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: activePet, isLoading } = useQuery<Pet>({
    queryKey: ["/api/pets/active"],
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: gameState } = useQuery({
    queryKey: ["/api/game-state"],
    retry: false,
  });

  const generatePetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pets/generate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      setIsGenerating(false);
      toast({
        title: "New Pet Generated!",
        description: "Your unique pixel pet has been created.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const petActionMutation = useMutation({
    mutationFn: async ({ petId, action }: { petId: number; action: string }) => {
      const response = await apiRequest("POST", `/api/pets/${petId}/${action}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      const actionMessages = {
        feed: "Pet fed successfully!",
        play: `Had fun playing! +${data.experienceGained || 0} XP`,
        train: `Training completed! +${data.experienceGained || 0} XP`,
        rest: "Pet is well rested!"
      };
      toast({
        title: "Success",
        description: actionMessages[variables.action as keyof typeof actionMessages] || "Action completed!",
      });
    },
    onError: (error, variables) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Action failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePet = () => {
    setIsGenerating(true);
    toast({
      title: "Generating Pet...",
      description: "Creating your unique pixel pet with OpenAI DALL-E",
    });
    generatePetMutation.mutate();
  };

  const handlePetAction = (action: string) => {
    if (!activePet?.id) return;
    petActionMutation.mutate({ petId: activePet.id, action });
  };

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-2xl text-game-secondary"></i>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-lg text-game-secondary">YOUR PIXEL PET</h2>
          <Button 
            onClick={handleGeneratePet}
            disabled={isGenerating}
            className="bg-game-accent hover:bg-game-accent/80 text-black font-medium transition-all duration-200 hover:scale-105"
          >
            <i className="fas fa-dice mr-2"></i>
            Generate New Pet
          </Button>
        </div>
        
        {activePet ? (
          <>
            {/* Pet Image Display */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-game-primary/20 to-game-secondary/20 rounded-2xl border-4 border-white/30 flex items-center justify-center animate-float overflow-hidden">
                  {activePet.imageUrl && !activePet.imageUrl.includes('data:image/svg') ? (
                    <img 
                      src={activePet.imageUrl.includes('oaidalleapi') ? `/api/image-proxy?url=${encodeURIComponent(activePet.imageUrl)}` : activePet.imageUrl} 
                      alt={activePet.name}
                      className="w-full h-full object-cover rounded-xl"
                      onLoad={() => console.log("Pet image loaded successfully:", activePet.imageUrl)}
                      onError={(e) => {
                        console.error("Pet image failed to load:", activePet.imageUrl);
                        // Show placeholder instead of fallback image
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-dragon text-4xl text-game-primary mb-2"></i>
                      <p className="text-sm text-white/70">
                        {activePet.sha256Hash ? "Ready for image generation" : "Generating image..."}
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        Hash: {activePet.sha256Hash?.slice(0, 8)}...
                      </p>
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 bg-game-success text-xs px-2 py-1 rounded-full font-pixel">
                  LVL {activePet.level}
                </div>
              </div>
              
              {/* Image Generation Button */}
              {(!activePet.imageUrl || activePet.imageUrl.includes('data:image/svg')) && (
                <button
                  onClick={async () => {
                    try {
                      console.log("Attempting to generate image for pet:", activePet.id);
                      const response = await fetch(`/api/pets/${activePet.id}/generate-image`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log("Image generation result:", result);
                        // Refresh pet data
                        queryClient.invalidateQueries({ queryKey: ['/api/pets/active'] });
                      } else {
                        const error = await response.text();
                        console.error("Image generation failed:", error);
                      }
                    } catch (error) {
                      console.error("Image generation error:", error);
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-game-primary hover:bg-game-primary/80 text-white rounded-lg font-pixel text-sm transition-colors"
                >
                  Generate Image
                </button>
              )}
              
              {/* Pet Name and Basic Info */}
              <div className="text-center mt-4">
                <h3 className="font-pixel text-xl text-white mb-2">{activePet.name}</h3>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className="bg-game-primary/30 px-3 py-1 rounded-full">
                    <i className="fas fa-heart text-game-danger mr-1"></i>
                    {activePet.happiness}%
                  </span>
                  <span className="bg-game-success/30 px-3 py-1 rounded-full">
                    <i className="fas fa-battery-three-quarters text-game-success mr-1"></i>
                    {activePet.energy}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Pet Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button 
                onClick={() => handlePetAction('feed')}
                disabled={petActionMutation.isPending}
                className="bg-game-danger/20 hover:bg-game-danger/30 border border-game-danger/50 text-white h-auto py-3 flex flex-col items-center transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-utensils mb-1 text-lg"></i>
                Feed
              </Button>
              <Button 
                onClick={() => handlePetAction('play')}
                disabled={petActionMutation.isPending || activePet.energy < 10}
                className="bg-game-success/20 hover:bg-game-success/30 border border-game-success/50 text-white h-auto py-3 flex flex-col items-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                <i className="fas fa-gamepad mb-1 text-lg"></i>
                Play
              </Button>
              <Button 
                onClick={() => handlePetAction('train')}
                disabled={petActionMutation.isPending || activePet.energy < 20}
                className="bg-game-secondary/20 hover:bg-game-secondary/30 border border-game-secondary/50 text-white h-auto py-3 flex flex-col items-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                <i className="fas fa-dumbbell mb-1 text-lg"></i>
                Train
              </Button>
              <Button 
                onClick={() => handlePetAction('rest')}
                disabled={petActionMutation.isPending}
                className="bg-game-accent/20 hover:bg-game-accent/30 border border-game-accent/50 text-black h-auto py-3 flex flex-col items-center transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-bed mb-1 text-lg"></i>
                Rest
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-plus-circle text-4xl text-game-accent mb-4"></i>
            <p className="text-lg mb-4">No pet found. Generate your first pixel pet!</p>
            <Button 
              onClick={handleGeneratePet}
              disabled={isGenerating}
              className="bg-game-primary hover:bg-game-primary/80 text-white font-medium"
            >
              <i className="fas fa-sparkles mr-2"></i>
              Create Your First Pet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
