import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Environment, ExplorationResult } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ExplorationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>('forest');
  const [explorationResult, setExplorationResult] = useState<ExplorationResult | null>(null);
  const [isExploring, setIsExploring] = useState(false);

  const { data: gameState } = useQuery({
    queryKey: ["/api/game-state"],
    retry: false,
  });

  const { data: activePet } = useQuery({
    queryKey: ["/api/pets/active"],
    retry: false,
  });

  const exploreMutation = useMutation({
    mutationFn: async (environment: Environment) => {
      const response = await apiRequest("POST", "/api/explore", { environment });
      return response.json();
    },
    onSuccess: (data) => {
      setExplorationResult(data);
      setIsExploring(false);
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      const { encounter } = data;
      let message = `Exploration complete! +${encounter.experienceGained} XP`;
      
      if (encounter.type === 'loot' && encounter.result.itemFound) {
        message = `Found ${encounter.result.itemFound.name}! +${encounter.experienceGained} XP`;
      } else if (encounter.type === 'battle') {
        message = `Encountered ${encounter.data.name}! +${encounter.experienceGained} XP`;
      }
      
      toast({
        title: "Exploration Success",
        description: message,
      });
    },
    onError: (error) => {
      setIsExploring(false);
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
        title: "Exploration Failed",
        description: error.message || "Failed to explore. Please try again.",
        variant: "destructive",
      });
    },
  });

  const environments = [
    { id: 'forest' as Environment, name: 'Forest', icon: 'fas fa-tree', color: 'green' },
    { id: 'beach' as Environment, name: 'Beach', icon: 'fas fa-umbrella-beach', color: 'blue' },
    { id: 'city' as Environment, name: 'City', icon: 'fas fa-city', color: 'gray' },
    { id: 'mountain' as Environment, name: 'Mountain', icon: 'fas fa-mountain', color: 'purple' },
  ];

  const handleExplore = () => {
    if (!activePet) {
      toast({
        title: "No Pet",
        description: "You need an active pet to explore!",
        variant: "destructive",
      });
      return;
    }

    if (activePet.energy < 15) {
      toast({
        title: "Pet Too Tired",
        description: "Your pet needs to rest before exploring.",
        variant: "destructive",
      });
      return;
    }

    setIsExploring(true);
    setExplorationResult(null);
    exploreMutation.mutate(selectedEnvironment);
  };

  const renderExplorationResult = () => {
    if (!explorationResult) return null;

    const { encounter } = explorationResult;
    
    switch (encounter.type) {
      case 'loot':
        return (
          <div className="flex items-center justify-between p-3 bg-game-success/20 rounded-lg border border-game-success/50">
            <div className="flex items-center">
              <i className="fas fa-gem text-game-success mr-3"></i>
              <div>
                <div className="font-medium">Found {encounter.data.name}!</div>
                <div className="text-xs text-game-success">Rarity: {encounter.data.rarity}</div>
              </div>
            </div>
            <div className="text-sm text-game-success">+{encounter.experienceGained} XP</div>
          </div>
        );
        
      case 'battle':
        return (
          <div className="flex items-center justify-between p-3 bg-game-danger/20 rounded-lg border border-game-danger/50">
            <div className="flex items-center">
              <i className="fas fa-sword text-game-danger mr-3"></i>
              <div>
                <div className="font-medium">Encountered {encounter.data.name}!</div>
                <div className="text-xs text-game-danger">Difficulty: {encounter.data.difficulty}</div>
              </div>
            </div>
            <div className="text-sm text-game-danger">+{encounter.experienceGained} XP</div>
          </div>
        );
        
      default:
        return (
          <div className="p-3 bg-game-primary/20 rounded-lg border border-game-primary/50">
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-game-primary mr-3"></i>
              <div>
                <div className="font-medium">{encounter.data.description}</div>
                <div className="text-xs text-game-primary">+{encounter.experienceGained} XP</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardContent className="p-6">
        <h2 className="font-pixel text-lg text-game-secondary mb-6">EXPLORATION</h2>
        
        {/* Environment Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {environments.map((env) => (
            <Button
              key={env.id}
              onClick={() => setSelectedEnvironment(env.id)}
              className={`
                p-4 h-auto flex flex-col items-center transition-all duration-200 hover:scale-105 border
                ${selectedEnvironment === env.id 
                  ? `bg-${env.color}-600/30 border-${env.color}-600/50 ring-2 ring-game-accent` 
                  : `bg-${env.color}-600/20 hover:bg-${env.color}-600/30 border-${env.color}-600/50`
                }
              `}
            >
              <i className={`${env.icon} text-2xl mb-2 text-${env.color}-400`}></i>
              <span className="text-sm font-medium">{env.name}</span>
            </Button>
          ))}
        </div>
        
        {/* Exploration Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={handleExplore}
            disabled={isExploring || !activePet || (activePet && activePet.energy < 15)}
            className="flex-1 bg-game-primary hover:bg-game-primary/80 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            <i className="fas fa-compass mr-2"></i>
            {isExploring ? 'Exploring...' : 'Start Exploration'}
          </Button>
        </div>
        
        {/* Exploration Results */}
        {(isExploring || explorationResult) && (
          <div className="p-4 bg-black/30 rounded-lg border border-white/10">
            <h4 className="font-pixel text-sm text-game-accent mb-3">EXPLORATION RESULTS</h4>
            <div>
              {isExploring ? (
                <div className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2 text-game-secondary"></i>
                  <span>Exploring {selectedEnvironment}...</span>
                </div>
              ) : (
                renderExplorationResult()
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
