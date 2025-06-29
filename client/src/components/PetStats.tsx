import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PetStats() {
  const { data: activePet, isLoading } = useQuery({
    queryKey: ["/api/pets/active"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-white/20 rounded"></div>
              <div className="h-3 bg-white/20 rounded"></div>
              <div className="h-3 bg-white/20 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activePet) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-6">
          <h3 className="font-pixel text-lg text-game-secondary mb-4">PET STATS</h3>
          <p className="text-center text-white/70">No active pet</p>
        </CardContent>
      </Card>
    );
  }

  const getXPToNextLevel = (level: number) => level * 1000;
  const xpToNext = getXPToNextLevel(activePet.level + 1);
  const xpProgress = (activePet.experience / xpToNext) * 100;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardContent className="p-6">
        <h3 className="font-pixel text-lg text-game-secondary mb-4">PET STATS</h3>
        
        {/* Basic Stats */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Health</span>
              <span>{activePet.health}/{activePet.maxHealth}</span>
            </div>
            <Progress 
              value={(activePet.health / activePet.maxHealth) * 100} 
              className="h-2 bg-gray-700"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Experience</span>
              <span>{activePet.experience}/{xpToNext}</span>
            </div>
            <Progress 
              value={xpProgress} 
              className="h-2 bg-gray-700"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Hunger</span>
              <span>{activePet.hunger}/100</span>
            </div>
            <Progress 
              value={activePet.hunger} 
              className="h-2 bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Energy</span>
              <span>{activePet.energy}/100</span>
            </div>
            <Progress 
              value={activePet.energy} 
              className="h-2 bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Happiness</span>
              <span>{activePet.happiness}/100</span>
            </div>
            <Progress 
              value={activePet.happiness} 
              className="h-2 bg-gray-700"
            />
          </div>
        </div>
        
        {/* Pet Attributes */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="font-pixel text-xs text-game-accent mb-3">ATTRIBUTES</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/30 p-2 rounded">
              <div className="text-game-secondary text-xs">Rarity</div>
              <div className="font-medium">{activePet.rarity}</div>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <div className="text-game-secondary text-xs">Type</div>
              <div className="font-medium">{activePet.type}</div>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <div className="text-game-secondary text-xs">Size</div>
              <div className="font-medium">{activePet.size}</div>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <div className="text-game-secondary text-xs">Element</div>
              <div className="font-medium">{activePet.element}</div>
            </div>
          </div>

          {/* Special Features */}
          {activePet.specialFeatures && activePet.specialFeatures.length > 0 && (
            <div className="mt-4">
              <div className="text-game-secondary text-xs mb-2">Special Features</div>
              <div className="space-y-1">
                {activePet.specialFeatures.map((feature, index) => (
                  <div key={index} className="bg-black/30 p-2 rounded text-xs">
                    <i className="fas fa-star text-game-accent mr-1"></i>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-white/50">
            <div>Pet ID: #{activePet.id}</div>
            <div>Hash: {activePet.sha256Hash.substring(0, 8)}...</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
