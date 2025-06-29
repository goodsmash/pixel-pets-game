import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ExplorationResult {
  type: string;
  data: any;
  result: any;
  experienceGained: number;
}

const ENVIRONMENTS = [
  "Enchanted Forest", "Crystal Caves", "Floating Islands", "Fire Realm", 
  "Ice Kingdom", "Shadow Dimension", "Light Sanctuary", "Ocean Depths",
  "Sky Temple", "Underground Ruins", "Mystic Gardens", "Volcanic Peaks"
];

export default function EnhancedExplorationPanel() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("Enchanted Forest");
  const [explorationResult, setExplorationResult] = useState<ExplorationResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get active pet
  const { data: activePet } = useQuery({
    queryKey: ["/api/pets/active"],
    retry: false,
  });

  // Get user's exploration history
  const { data: explorationHistory } = useQuery({
    queryKey: ["/api/exploration/history"],
    retry: false,
  });

  const exploreMutation = useMutation({
    mutationFn: async (environment: string) => {
      const response = await apiRequest("POST", "/api/exploration/enhanced", {
        environment,
        petId: (activePet as any)?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setExplorationResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exploration/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      toast({
        title: "Epic Exploration Complete!",
        description: `Your pet discovered something amazing in the selected environment!`,
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
        title: "Exploration Failed",
        description: error.message || "Your pet couldn't explore right now",
        variant: "destructive",
      });
    },
  });

  const canExplore = () => {
    if (!activePet) return { canExplore: false, reason: "No active pet selected" };
    if (!activePet.energy || (activePet as any).energy < 10) return { canExplore: false, reason: "Pet needs more energy" };
    if (exploreMutation.isPending) return { canExplore: false, reason: "Currently exploring..." };
    return { canExplore: true, reason: "" };
  };

  const handleExplore = () => {
    const { canExplore: canExp, reason } = canExplore();
    if (!canExp) {
      toast({
        title: "Cannot Explore",
        description: reason,
        variant: "destructive",
      });
      return;
    }
    
    setExplorationResult(null);
    exploreMutation.mutate(selectedEnvironment);
  };

  const renderEnhancedExplorationResult = () => {
    if (!explorationResult) return null;

    const encounter = explorationResult.data || explorationResult;
    
    return (
      <div className="space-y-6">
        {/* Epic Story Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/60 shadow-2xl">
          <div className="text-center mb-4">
            <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400 mb-2">
              {encounter.title || "Epic Adventure Unfolds"}
            </h3>
            {encounter.complexity && (
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-full text-sm text-white font-bold border border-purple-400/50">
                {encounter.complexity.toUpperCase()} COMPLEXITY STORY
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <i className="fas fa-book-open text-white text-lg"></i>
              </div>
              <div>
                <div className="text-white font-medium">Story Experience</div>
                <div className="text-purple-300 text-sm">Multi-Chapter Adventure</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">+{encounter.experienceGained} XP</div>
              {encounter.result?.coinsEarned && (
                <div className="text-lg text-yellow-300">+{encounter.result.coinsEarned} coins</div>
              )}
            </div>
          </div>
        </div>

        {/* Chapter 1 - Discovery */}
        {encounter.opening_discovery && (
          <div className="p-5 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/40">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600/50 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h4 className="font-bold text-lg text-blue-300">Chapter 1: The Discovery</h4>
            </div>
            <div className="text-blue-100 leading-relaxed italic">
              {encounter.opening_discovery}
            </div>
          </div>
        )}

        {/* Chapter 2 - Main Story */}
        {encounter.main_story && (
          <div className="p-5 bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg border border-green-500/40">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-600/50 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h4 className="font-bold text-lg text-green-300">Chapter 2: The Encounter</h4>
            </div>
            <div className="text-green-100 leading-relaxed">
              {encounter.main_story}
            </div>
          </div>
        )}

        {/* Creature Character Profile */}
        {encounter.creature && (
          <div className="p-5 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/40">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-600/50 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-dragon text-white"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-amber-300">
                  {encounter.creature.name || "Mysterious Being"}
                </h4>
                <div className="text-amber-200 text-sm">
                  {encounter.creature.archetype} • {encounter.creature.rarity || "Rare"} Encounter
                </div>
              </div>
            </div>
            
            {encounter.creature.backstory && (
              <div className="mb-4">
                <h5 className="font-medium text-amber-300 mb-2">Backstory:</h5>
                <div className="text-amber-100 text-sm leading-relaxed">
                  {encounter.creature.backstory}
                </div>
              </div>
            )}
            
            {encounter.creature.dialogue_samples && encounter.creature.dialogue_samples.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-amber-300 mb-2">Creature Communication:</h5>
                <div className="space-y-2">
                  {encounter.creature.dialogue_samples.map((dialogue: string, index: number) => (
                    <div key={index} className="p-3 bg-amber-800/20 rounded border-l-4 border-amber-400/50">
                      <div className="text-amber-100 italic">"{dialogue}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chapter 3 - Story Choices */}
        {encounter.story_choices && encounter.story_choices.length > 0 && (
          <div className="p-5 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-lg border border-purple-500/40">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-600/50 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h4 className="font-bold text-lg text-purple-300">Chapter 3: Critical Choices</h4>
            </div>
            
            <div className="space-y-4">
              {encounter.story_choices.map((choice: any, index: number) => (
                <div key={index} className="border border-purple-400/30 rounded-lg p-4">
                  <h5 className="font-medium text-purple-300 mb-3">{choice.choice_point}</h5>
                  <div className="space-y-3">
                    {choice.options?.map((option: any, optIndex: number) => (
                      <div key={optIndex} className="p-3 bg-purple-800/20 rounded border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-purple-200">{option.action}</div>
                          <div className="text-xs px-2 py-1 bg-purple-600/30 rounded text-purple-200">
                            {option.difficulty?.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-purple-100 text-sm mb-2">{option.story_outcome}</div>
                        {option.character_impact && (
                          <div className="text-purple-300 text-xs">
                            <strong>Character Growth:</strong> {option.character_impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Moments */}
        {encounter.emotional_moments && encounter.emotional_moments.length > 0 && (
          <div className="p-5 bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/40">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-pink-600/50 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-heart text-white"></i>
              </div>
              <h4 className="font-bold text-lg text-pink-300">Emotional Journey</h4>
            </div>
            
            <div className="space-y-3">
              {encounter.emotional_moments.map((moment: any, index: number) => (
                <div key={index} className="p-3 bg-pink-800/20 rounded border border-pink-500/30">
                  <div className="flex items-center mb-2">
                    <div className="text-xs px-2 py-1 bg-pink-600/40 rounded text-pink-200 mr-2">
                      {moment.moment_type?.toUpperCase()}
                    </div>
                    <div className="text-pink-200 font-medium">Character Development</div>
                  </div>
                  <div className="text-pink-100 text-sm mb-2">{moment.description}</div>
                  <div className="text-pink-300 text-xs">
                    <strong>Pet Growth:</strong> {moment.pet_growth}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* World Lore & Discoveries */}
        {encounter.world_lore && (
          <div className="p-5 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-500/40">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-cyan-600/50 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-globe text-white"></i>
              </div>
              <h4 className="font-bold text-lg text-cyan-300">World Lore Revealed</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {encounter.world_lore.ancient_history && (
                <div className="p-3 bg-cyan-800/20 rounded">
                  <h5 className="font-medium text-cyan-300 mb-2">Ancient History</h5>
                  <div className="text-cyan-100 text-sm">{encounter.world_lore.ancient_history}</div>
                </div>
              )}
              {encounter.world_lore.mythological_significance && (
                <div className="p-3 bg-cyan-800/20 rounded">
                  <h5 className="font-medium text-cyan-300 mb-2">Mythological Significance</h5>
                  <div className="text-cyan-100 text-sm">{encounter.world_lore.mythological_significance}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Story Rewards */}
        {encounter.rewards && (
          <div className="p-5 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg border border-emerald-500/40">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-emerald-600/50 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-treasure-chest text-white"></i>
              </div>
              <h4 className="font-bold text-lg text-emerald-300">Story Rewards</h4>
            </div>
            
            {encounter.rewards.story_items && encounter.rewards.story_items.length > 0 && (
              <div className="space-y-3">
                {encounter.rewards.story_items.map((item: any, index: number) => (
                  <div key={index} className="p-4 bg-emerald-800/20 rounded border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-emerald-200">{item.name}</div>
                      <div className="text-xs px-2 py-1 bg-emerald-600/40 rounded text-emerald-200">
                        {item.rarity?.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-emerald-100 text-sm">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-game-card border-game-border">
      <CardHeader>
        <CardTitle className="text-game-text flex items-center">
          <i className="fas fa-compass mr-2 text-game-accent"></i>
          Enhanced Exploration
        </CardTitle>
        <CardDescription className="text-game-muted">
          Epic story-driven adventures with complex narratives
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Environment Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-game-text">Choose Environment:</label>
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="bg-game-input border-game-border text-game-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-game-card border-game-border">
              {['Enchanted Forest', 'Crystal Caves', 'Floating Islands', 'Fire Realm', 'Ice Kingdom', 'Shadow Dimension', 'Light Sanctuary'].map((env) => (
                <SelectItem key={env} value={env} className="text-game-text hover:bg-game-hover">
                  {env}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pet Status Display */}
        {activePet && (
          <div className="p-3 bg-game-surface rounded-lg border border-game-border">
            <div className="flex items-center space-x-3">
              {(activePet as any).imageUrl && !(activePet as any).imageUrl.includes('data:image/svg') ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-game-accent">
                  <img src={(activePet as any).imageUrl.includes('oaidalleapi') ? `/api/image-proxy?url=${encodeURIComponent((activePet as any).imageUrl)}` : (activePet as any).imageUrl} alt={activePet.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{activePet.name?.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-game-text">{activePet.name}</div>
                <div className="text-sm text-game-muted">Level {(activePet as any).level || 1} • {(activePet as any).rarity}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-game-accent">Energy: {(activePet as any).energy || 0}/100</div>
                <div className="text-xs text-game-muted">XP: {(activePet as any).experience || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Exploration Button */}
        <Button
          onClick={handleExplore}
          disabled={!canExplore().canExplore}
          className="w-full bg-game-accent hover:bg-game-accent/80 text-white font-bold py-3"
        >
          {exploreMutation.isPending ? (
            <>
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Exploring {selectedEnvironment}...
            </>
          ) : (
            <>
              <i className="fas fa-map-marked-alt mr-2"></i>
              Begin Epic Adventure in {selectedEnvironment}
            </>
          )}
        </Button>

        {!canExplore().canExplore && (
          <div className="text-sm text-yellow-600 text-center">
            {canExplore().reason}
          </div>
        )}

        {/* Enhanced Exploration Results */}
        {renderEnhancedExplorationResult()}
      </CardContent>
    </Card>
  );
}