import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pet } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BreedingSession {
  id: number;
  parentOneId: number;
  parentTwoId: number;
  offspringId?: number;
  breedingStatus: string;
  breedingStartedAt: string;
  breedingCompletedAt?: string;
  successRate: number;
  breedingCost: number;
}

export default function PetBreeding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedParentOne, setSelectedParentOne] = useState<Pet | null>(null);
  const [selectedParentTwo, setSelectedParentTwo] = useState<Pet | null>(null);

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    retry: false,
  });

  const { data: gameState } = useQuery({
    queryKey: ["/api/game-state"],
    retry: false,
  });

  const { data: breedingSessions = [] } = useQuery<BreedingSession[]>({
    queryKey: ["/api/breeding/sessions"],
    retry: false,
  });

  const breedPetsMutation = useMutation({
    mutationFn: async ({ parentOneId, parentTwoId }: { parentOneId: number; parentTwoId: number }) => {
      const response = await apiRequest("POST", "/api/breeding/breed", {
        parentOneId,
        parentTwoId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breeding/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
      setSelectedParentOne(null);
      setSelectedParentTwo(null);
      toast({
        title: "Breeding Started",
        description: "Your pets are now breeding! Check back later for results.",
      });
    },
    onError: (error) => {
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
        title: "Breeding Failed",
        description: "Failed to start breeding. Check your coin balance and pet eligibility.",
        variant: "destructive",
      });
    },
  });

  const claimOffspringMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("POST", `/api/breeding/claim/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breeding/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Offspring Claimed",
        description: "Your new pet has been added to your collection!",
      });
    },
    onError: (error) => {
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
        title: "Claim Failed",
        description: "Failed to claim offspring. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getBreedingEligiblePets = () => {
    return pets.filter(pet => 
      pet.level >= 5 && 
      pet.breedingCount < pet.maxBreedingCount &&
      pet.health > 50
    );
  };

  const calculateBreedingCost = () => {
    if (!selectedParentOne || !selectedParentTwo) return 0;
    const baseCost = 100;
    const rarityMultiplier = {
      'common': 1,
      'uncommon': 1.5,
      'rare': 2,
      'epic': 3,
      'legendary': 5,
      'mythic': 8,
      'transcendent': 12
    };
    
    const parentOneCost = baseCost * (rarityMultiplier[selectedParentOne.rarity as keyof typeof rarityMultiplier] || 1);
    const parentTwoCost = baseCost * (rarityMultiplier[selectedParentTwo.rarity as keyof typeof rarityMultiplier] || 1);
    
    return Math.floor((parentOneCost + parentTwoCost) / 2);
  };

  const calculateSuccessRate = () => {
    if (!selectedParentOne || !selectedParentTwo) return 0;
    
    let baseRate = 75;
    
    // Same element bonus
    if (selectedParentOne.element === selectedParentTwo.element) {
      baseRate += 10;
    }
    
    // Compatible personality bonus
    const compatiblePersonalities = [
      ['brave', 'loyal'], ['calm', 'wise'], ['playful', 'energetic'],
      ['mysterious', 'ancient'], ['fierce', 'wild']
    ];
    
    for (const pair of compatiblePersonalities) {
      if ((pair.includes(selectedParentOne.personality.toLowerCase()) && 
           pair.includes(selectedParentTwo.personality.toLowerCase())) ||
          selectedParentOne.personality === selectedParentTwo.personality) {
        baseRate += 5;
        break;
      }
    }
    
    // Level bonus
    const avgLevel = (selectedParentOne.level + selectedParentTwo.level) / 2;
    baseRate += Math.floor(avgLevel / 10) * 2;
    
    return Math.min(95, Math.max(25, baseRate));
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-500",
      uncommon: "bg-green-500",
      rare: "bg-blue-500",
      epic: "bg-purple-500",
      legendary: "bg-orange-500",
      mythic: "bg-red-500",
      transcendent: "bg-gradient-to-r from-purple-500 to-pink-500"
    };
    return colors[rarity as keyof typeof colors] || "bg-gray-500";
  };

  const eligiblePets = getBreedingEligiblePets();
  const breedingCost = calculateBreedingCost();
  const successRate = calculateSuccessRate();

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="font-pixel text-xl text-center">Pet Breeding Laboratory</CardTitle>
          <p className="text-center text-white/70 text-sm">
            Combine two pets to create unique offspring with mixed traits
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Breeding Setup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Parent One Selection */}
            <div className="space-y-3">
              <h3 className="font-pixel text-lg text-game-primary">Parent One</h3>
              {selectedParentOne ? (
                <div className="p-4 rounded-lg border-2 border-game-primary bg-game-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm">{selectedParentOne.name}</span>
                    <Button
                      onClick={() => setSelectedParentOne(null)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </Button>
                  </div>
                  <Badge className={`${getRarityColor(selectedParentOne.rarity)} text-white text-xs mb-1`}>
                    {selectedParentOne.rarity}
                  </Badge>
                  <p className="text-xs text-white/70">
                    LVL {selectedParentOne.level} • {selectedParentOne.element} • {selectedParentOne.type}
                  </p>
                  <p className="text-xs text-white/60">
                    Bred: {selectedParentOne.breedingCount}/{selectedParentOne.maxBreedingCount}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg border-2 border-dashed border-white/30 text-center">
                  <p className="text-white/50 text-sm">Select Parent One</p>
                </div>
              )}
            </div>

            {/* Breeding Preview */}
            <div className="space-y-3">
              <h3 className="font-pixel text-lg text-game-accent text-center">Offspring Preview</h3>
              <div className="p-4 rounded-lg border-2 border-game-accent bg-game-accent/10 text-center">
                {selectedParentOne && selectedParentTwo ? (
                  <div className="space-y-2">
                    <div className="text-2xl">🥚</div>
                    <p className="text-sm text-white/80">Generation {Math.max(selectedParentOne.generation, selectedParentTwo.generation) + 1}</p>
                    <p className="text-xs text-white/60">
                      Mixed traits from {selectedParentOne.element} & {selectedParentTwo.element}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-game-success">Success Rate: {successRate}%</p>
                      <p className="text-xs text-game-warning">Cost: {breedingCost} coins</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">Select both parents</p>
                )}
              </div>
            </div>

            {/* Parent Two Selection */}
            <div className="space-y-3">
              <h3 className="font-pixel text-lg text-game-secondary">Parent Two</h3>
              {selectedParentTwo ? (
                <div className="p-4 rounded-lg border-2 border-game-secondary bg-game-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm">{selectedParentTwo.name}</span>
                    <Button
                      onClick={() => setSelectedParentTwo(null)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </Button>
                  </div>
                  <Badge className={`${getRarityColor(selectedParentTwo.rarity)} text-white text-xs mb-1`}>
                    {selectedParentTwo.rarity}
                  </Badge>
                  <p className="text-xs text-white/70">
                    LVL {selectedParentTwo.level} • {selectedParentTwo.element} • {selectedParentTwo.type}
                  </p>
                  <p className="text-xs text-white/60">
                    Bred: {selectedParentTwo.breedingCount}/{selectedParentTwo.maxBreedingCount}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg border-2 border-dashed border-white/30 text-center">
                  <p className="text-white/50 text-sm">Select Parent Two</p>
                </div>
              )}
            </div>
          </div>

          {/* Breeding Action */}
          {selectedParentOne && selectedParentTwo && (
            <div className="text-center mb-6">
              <Button
                onClick={() => breedPetsMutation.mutate({
                  parentOneId: selectedParentOne.id,
                  parentTwoId: selectedParentTwo.id
                })}
                disabled={breedPetsMutation.isPending || (gameState?.coins || 0) < breedingCost}
                className="bg-game-accent hover:bg-game-accent/80 text-white px-8 py-3 text-lg font-pixel"
              >
                {breedPetsMutation.isPending ? "Starting Breeding..." : `Breed Pets (${breedingCost} coins)`}
              </Button>
              {(gameState?.coins || 0) < breedingCost && (
                <p className="text-red-400 text-sm mt-2">Insufficient coins</p>
              )}
            </div>
          )}

          {/* Eligible Pets Grid */}
          <div className="space-y-3">
            <h3 className="font-pixel text-lg text-white">Eligible Breeding Pets</h3>
            {eligiblePets.length === 0 ? (
              <p className="text-white/60 text-center py-4">
                No pets eligible for breeding. Pets must be level 5+, healthy, and not at breeding limit.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {eligiblePets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      if (selectedParentOne?.id === pet.id || selectedParentTwo?.id === pet.id) return;
                      
                      if (!selectedParentOne) {
                        setSelectedParentOne(pet);
                      } else if (!selectedParentTwo) {
                        setSelectedParentTwo(pet);
                      }
                    }}
                    disabled={selectedParentOne?.id === pet.id || selectedParentTwo?.id === pet.id}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedParentOne?.id === pet.id || selectedParentTwo?.id === pet.id
                        ? "border-game-success bg-game-success/20 opacity-50"
                        : "border-white/20 hover:border-white/40 bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-pixel text-xs text-white truncate">{pet.name}</p>
                      <Badge className={`${getRarityColor(pet.rarity)} text-white text-xs`}>
                        {pet.rarity}
                      </Badge>
                      <p className="text-xs text-white/60">LVL {pet.level}</p>
                      <p className="text-xs text-white/50">{pet.element}</p>
                      <div className="text-xs text-white/40">
                        {pet.breedingCount}/{pet.maxBreedingCount} breeds
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Breeding Sessions */}
      {breedingSessions.length > 0 && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="font-pixel text-lg">Active Breeding Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {breedingSessions.map((session) => {
                const parentOne = pets.find(p => p.id === session.parentOneId);
                const parentTwo = pets.find(p => p.id === session.parentTwoId);
                const isComplete = session.breedingStatus === 'completed';
                const timeElapsed = Date.now() - new Date(session.breedingStartedAt).getTime();
                const breedingTime = 24 * 60 * 60 * 1000; // 24 hours
                const progress = Math.min(100, (timeElapsed / breedingTime) * 100);
                
                return (
                  <div key={session.id} className="p-4 rounded-lg border border-white/20 bg-black/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-pixel">
                          {parentOne?.name} × {parentTwo?.name}
                        </span>
                        <Badge className={isComplete ? "bg-green-500" : "bg-blue-500"}>
                          {isComplete ? "Ready" : "Breeding"}
                        </Badge>
                      </div>
                      {isComplete && (
                        <Button
                          onClick={() => claimOffspringMutation.mutate(session.id)}
                          disabled={claimOffspringMutation.isPending}
                          className="bg-game-success hover:bg-game-success/80 text-white"
                        >
                          {claimOffspringMutation.isPending ? "Claiming..." : "Claim Offspring"}
                        </Button>
                      )}
                    </div>
                    
                    {!isComplete && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Progress</span>
                          <span className="text-white/70">{Math.floor(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-white/50">
                          Time remaining: {Math.max(0, Math.floor((breedingTime - timeElapsed) / (1000 * 60 * 60)))} hours
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}