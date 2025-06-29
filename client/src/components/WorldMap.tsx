import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Lock, Star, Zap, Globe } from 'lucide-react';

interface WorldRegion {
  id: string;
  name: string;
  type: string;
  difficulty: number;
  unlocked: boolean;
  encounters: string[];
  specialFeatures: string[];
  coordinates: { x: number; y: number };
  description?: string;
  requiredLevel?: number;
}

interface WorldMapProps {
  onRegionSelect: (regionId: string) => void;
  selectedRegion?: string;
}

export default function WorldMap({ onRegionSelect, selectedRegion }: WorldMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const { data: regions = [], isLoading } = useQuery<WorldRegion[]>({
    queryKey: ['/api/world/regions'],
  });

  const { data: userLevel } = useQuery<{ level: number; experience: number }>({
    queryKey: ['/api/user/level'],
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500';
    if (difficulty <= 4) return 'bg-yellow-500';
    if (difficulty <= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'forest': return '🌲';
      case 'mountain': return '⛰️';
      case 'desert': return '🏜️';
      case 'ocean': return '🌊';
      case 'sky': return '☁️';
      case 'fire': return '🔥';
      case 'ice': return '❄️';
      case 'shadow': return '🌑';
      case 'crystal': return '💎';
      case 'time': return '⏰';
      default: return '🗺️';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            World Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg p-4 min-h-[400px] overflow-hidden">
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Regions */}
            {regions.map((region: WorldRegion) => (
              <div
                key={region.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  hoveredRegion === region.id ? 'scale-110 z-10' : 'z-0'
                } ${selectedRegion === region.id ? 'ring-2 ring-primary' : ''}`}
                style={{
                  left: `${Math.min(90, Math.max(10, region.coordinates.x))}%`,
                  top: `${Math.min(90, Math.max(10, region.coordinates.y))}%`,
                }}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <Button
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRegionSelect(region.id)}
                  disabled={!region.unlocked}
                  className={`relative w-16 h-16 rounded-full text-2xl ${
                    !region.unlocked ? 'opacity-50' : ''
                  } ${getDifficultyColor(region.difficulty)} border-2 border-white shadow-lg`}
                >
                  {region.unlocked ? getTypeIcon(region.type) : <Lock className="h-4 w-4" />}
                  
                  {/* Difficulty indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-black">
                    {region.difficulty}
                  </div>
                </Button>

                {/* Region tooltip */}
                {hoveredRegion === region.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 z-20">
                    <div className="text-sm font-semibold mb-1">{region.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {region.description || `A ${region.type} region with ${region.encounters.length} unique encounters`}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Difficulty {region.difficulty}
                      </Badge>
                      {region.requiredLevel && (
                        <Badge variant={(userLevel?.level || 0) >= region.requiredLevel ? "default" : "destructive"} className="text-xs">
                          Level {region.requiredLevel}+
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-medium">Encounters:</div>
                      <div className="flex flex-wrap gap-1">
                        {region.encounters.slice(0, 3).map((encounter, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {encounter}
                          </Badge>
                        ))}
                        {region.encounters.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{region.encounters.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {region.specialFeatures.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Special Features:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {region.specialFeatures.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Connection lines between regions */}
            <svg className="absolute inset-0 pointer-events-none opacity-30">
              {regions.map((region: WorldRegion, index: number) => {
                const nextRegion = regions[index + 1];
                if (!nextRegion || !region.unlocked || !nextRegion.unlocked) return null;
                
                return (
                  <line
                    key={`${region.id}-${nextRegion.id}`}
                    x1={`${region.coordinates.x}%`}
                    y1={`${region.coordinates.y}%`}
                    x2={`${nextRegion.coordinates.x}%`}
                    y2={`${nextRegion.coordinates.y}%`}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Easy (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Medium (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Hard (5-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Expert (7+)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Region Details */}
      {selectedRegion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {regions.find((r: WorldRegion) => r.id === selectedRegion)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const region = regions.find((r: WorldRegion) => r.id === selectedRegion);
              if (!region) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getTypeIcon(region.type)}</div>
                      <div className="text-sm font-medium">Type</div>
                      <div className="text-xs text-muted-foreground capitalize">{region.type}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚔️</div>
                      <div className="text-sm font-medium">Difficulty</div>
                      <div className="text-xs text-muted-foreground">{region.difficulty}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">👾</div>
                      <div className="text-sm font-medium">Encounters</div>
                      <div className="text-xs text-muted-foreground">{region.encounters.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">✨</div>
                      <div className="text-sm font-medium">Features</div>
                      <div className="text-xs text-muted-foreground">{region.specialFeatures.length}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Available Encounters:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {region.encounters.map((encounter: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm">{encounter}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {region.specialFeatures.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">Special Features:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {region.specialFeatures.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}