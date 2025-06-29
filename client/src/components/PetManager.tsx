import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pet } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PetManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterElement, setFilterElement] = useState("all");
  const [filterGeneration, setFilterGeneration] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const { data: pets = [], isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: activePet } = useQuery<Pet>({
    queryKey: ["/api/pets/active"],
    retry: false,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ petId, isFavorite }: { petId: number; isFavorite: boolean }) => {
      const response = await apiRequest("POST", `/api/pets/${petId}/favorite`, { isFavorite });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Updated",
        description: "Pet favorite status updated successfully!",
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
        title: "Error",
        description: "Failed to update pet favorite status.",
        variant: "destructive",
      });
    },
  });

  const activatePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await apiRequest("PUT", `/api/pets/${petId}/activate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      toast({
        title: "Pet Activated",
        description: "Your pet is now active!",
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
        title: "Error",
        description: "Failed to activate pet.",
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await apiRequest("POST", `/api/pets/${petId}/generate-image`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Image Generated",
        description: "OpenAI DALL-E image created successfully!",
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
        title: "Error",
        description: "Failed to generate image.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedPets = useMemo(() => {
    let filtered = pets.filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.element.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRarity = filterRarity === "all" || pet.rarity === filterRarity;
      const matchesElement = filterElement === "all" || pet.element === filterElement;
      const matchesGeneration = filterGeneration === "all" || 
                               (filterGeneration === "1" && pet.generation === 1) ||
                               (filterGeneration === "2+" && pet.generation > 1);
      
      return matchesSearch && matchesRarity && matchesElement && matchesGeneration;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "level":
          aValue = a.level;
          bValue = b.level;
          break;
        case "rarity":
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6, transcendent: 7 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        case "generation":
          aValue = a.generation;
          bValue = b.generation;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "battles":
          aValue = a.totalBattlesWon;
          bValue = b.totalBattlesWon;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [pets, searchTerm, sortBy, sortOrder, filterRarity, filterElement, filterGeneration]);

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

  const getAcquisitionIcon = (method: string) => {
    switch (method) {
      case "generated": return "🎲";
      case "bred": return "🥚";
      case "traded": return "🤝";
      case "gifted": return "🎁";
      default: return "❓";
    }
  };

  const uniqueElements = [...new Set(pets.map(pet => pet.element))];
  const uniqueRarities = [...new Set(pets.map(pet => pet.rarity))];

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
      <CardHeader>
        <CardTitle className="font-pixel text-xl text-center">Pet Collection Manager</CardTitle>
        <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
          <span>{pets.length} Total Pets</span>
          <span>•</span>
          <span>{pets.filter(p => p.isFavorite).length} Favorites</span>
          <span>•</span>
          <span>{pets.filter(p => p.imageUrl && !p.imageUrl.includes('data:image/svg')).length} with OpenAI Images</span>
          <span>•</span>
          <span>{pets.filter(p => p.generation > 1).length} Bred</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
            />
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {uniqueRarities.map(rarity => (
                  <SelectItem key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterElement} onValueChange={setFilterElement}>
              <SelectTrigger className="bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Filter by element" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elements</SelectItem>
                {uniqueElements.map(element => (
                  <SelectItem key={element} value={element}>
                    {element.charAt(0).toUpperCase() + element.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterGeneration} onValueChange={setFilterGeneration}>
              <SelectTrigger className="bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Filter by generation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Generations</SelectItem>
                <SelectItem value="1">Generation 1</SelectItem>
                <SelectItem value="2+">Generation 2+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/70">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-black/20 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="generation">Generation</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="battles">Battle Wins</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Pet Display */}
        {filteredAndSortedPets.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-search text-4xl text-white/30 mb-4"></i>
            <p className="text-white/70">No pets match your current filters.</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">All ({filteredAndSortedPets.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({filteredAndSortedPets.filter(p => p.isFavorite).length})</TabsTrigger>
              <TabsTrigger value="bred">Bred ({filteredAndSortedPets.filter(p => p.generation > 1).length})</TabsTrigger>
              <TabsTrigger value="no-image">No Image ({filteredAndSortedPets.filter(p => !p.imageUrl || p.imageUrl.includes('data:image/svg')).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <PetGrid
                pets={filteredAndSortedPets}
                viewMode={viewMode}
                activePet={activePet}
                onFavorite={(petId, isFavorite) => favoriteMutation.mutate({ petId, isFavorite })}
                onActivate={(petId) => activatePetMutation.mutate(petId)}
                onGenerateImage={(petId) => generateImageMutation.mutate(petId)}
                getRarityColor={getRarityColor}
                getAcquisitionIcon={getAcquisitionIcon}
              />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <PetGrid
                pets={filteredAndSortedPets.filter(p => p.isFavorite)}
                viewMode={viewMode}
                activePet={activePet}
                onFavorite={(petId, isFavorite) => favoriteMutation.mutate({ petId, isFavorite })}
                onActivate={(petId) => activatePetMutation.mutate(petId)}
                onGenerateImage={(petId) => generateImageMutation.mutate(petId)}
                getRarityColor={getRarityColor}
                getAcquisitionIcon={getAcquisitionIcon}
              />
            </TabsContent>

            <TabsContent value="bred" className="space-y-4">
              <PetGrid
                pets={filteredAndSortedPets.filter(p => p.generation > 1)}
                viewMode={viewMode}
                activePet={activePet}
                onFavorite={(petId, isFavorite) => favoriteMutation.mutate({ petId, isFavorite })}
                onActivate={(petId) => activatePetMutation.mutate(petId)}
                onGenerateImage={(petId) => generateImageMutation.mutate(petId)}
                getRarityColor={getRarityColor}
                getAcquisitionIcon={getAcquisitionIcon}
              />
            </TabsContent>

            <TabsContent value="no-image" className="space-y-4">
              <PetGrid
                pets={filteredAndSortedPets.filter(p => !p.imageUrl || p.imageUrl.includes('data:image/svg'))}
                viewMode={viewMode}
                activePet={activePet}
                onFavorite={(petId, isFavorite) => favoriteMutation.mutate({ petId, isFavorite })}
                onActivate={(petId) => activatePetMutation.mutate(petId)}
                onGenerateImage={(petId) => generateImageMutation.mutate(petId)}
                getRarityColor={getRarityColor}
                getAcquisitionIcon={getAcquisitionIcon}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

interface PetGridProps {
  pets: Pet[];
  viewMode: string;
  activePet: Pet | undefined;
  onFavorite: (petId: number, isFavorite: boolean) => void;
  onActivate: (petId: number) => void;
  onGenerateImage: (petId: number) => void;
  getRarityColor: (rarity: string) => string;
  getAcquisitionIcon: (method: string) => string;
}

function PetGrid({ pets, viewMode, activePet, onFavorite, onActivate, onGenerateImage, getRarityColor, getAcquisitionIcon }: PetGridProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className={`flex items-center p-3 rounded-lg border transition-all ${
              activePet?.id === pet.id
                ? "border-game-primary bg-game-primary/10"
                : "border-white/20 bg-black/10 hover:border-white/40"
            }`}
          >
            {/* Pet Image */}
            <div className="w-16 h-16 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden mr-4">
              {pet.imageUrl && !pet.imageUrl.includes('data:image/svg') ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-dragon text-game-primary"></i>
              )}
            </div>

            {/* Pet Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-pixel text-sm text-white truncate">{pet.name}</h3>
                <span className="text-lg">{getAcquisitionIcon(pet.acquisitionMethod)}</span>
                {pet.isFavorite && <span className="text-yellow-400">⭐</span>}
                {pet.generation > 1 && (
                  <Badge variant="outline" className="text-xs border-game-accent text-game-accent">
                    Gen {pet.generation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-xs text-white/70">
                <span>LVL {pet.level}</span>
                <span>{pet.element}</span>
                <span>{pet.type}</span>
                <Badge className={`${getRarityColor(pet.rarity)} text-white text-xs`}>
                  {pet.rarity}
                </Badge>
                <span>{pet.totalBattlesWon}W/{pet.totalBattlesLost}L</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onFavorite(pet.id, !pet.isFavorite)}
                variant="ghost"
                size="sm"
                className={`text-yellow-400 hover:text-yellow-300 ${pet.isFavorite ? 'text-yellow-400' : 'text-white/40'}`}
              >
                ⭐
              </Button>
              
              {(!pet.imageUrl || pet.imageUrl.includes('data:image/svg')) && (
                <Button
                  onClick={() => onGenerateImage(pet.id)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 text-xs"
                >
                  Generate Image
                </Button>
              )}
              
              {activePet?.id !== pet.id && (
                <Button
                  onClick={() => onActivate(pet.id)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 text-xs"
                >
                  Activate
                </Button>
              )}
              
              {activePet?.id === pet.id && (
                <Badge className="bg-game-primary text-white">Active</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            activePet?.id === pet.id
              ? "border-game-primary bg-game-primary/10"
              : "border-white/20 bg-black/10 hover:border-white/40"
          }`}
        >
          {/* Favorite Button */}
          <button
            onClick={() => onFavorite(pet.id, !pet.isFavorite)}
            className={`absolute top-2 right-2 text-lg ${
              pet.isFavorite ? 'text-yellow-400' : 'text-white/40 hover:text-yellow-400'
            } transition-colors`}
          >
            ⭐
          </button>

          {/* Generation Badge */}
          {pet.generation > 1 && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="text-xs border-game-accent text-game-accent">
                Gen {pet.generation}
              </Badge>
            </div>
          )}

          {/* Pet Image */}
          <div className="w-full h-32 bg-gradient-to-br from-game-primary/20 to-game-secondary/20 rounded-lg border-2 border-white/20 flex items-center justify-center mb-3 overflow-hidden">
            {pet.imageUrl && !pet.imageUrl.includes('data:image/svg') ? (
              <img
                src={pet.imageUrl.includes('oaidalleapi') ? `/api/image-proxy?url=${encodeURIComponent(pet.imageUrl)}` : pet.imageUrl}
                alt={pet.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="text-center">
                <i className="fas fa-dragon text-2xl text-game-primary mb-1"></i>
                <p className="text-xs text-white/50">Ready for OpenAI generation</p>
              </div>
            )}
          </div>

          {/* Pet Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-sm text-white truncate flex items-center space-x-1">
                <span>{pet.name}</span>
                <span className="text-xs">{getAcquisitionIcon(pet.acquisitionMethod)}</span>
              </h3>
              <Badge className={`${getRarityColor(pet.rarity)} text-white text-xs`}>
                {pet.rarity}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>LVL {pet.level}</span>
              <span>{pet.type}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-game-element">{pet.element}</span>
              <span className="text-white/60">{pet.personality}</span>
            </div>

            {pet.totalBattlesWon > 0 && (
              <div className="text-xs text-white/50">
                Battles: {pet.totalBattlesWon}W/{pet.totalBattlesLost}L
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 space-y-2">
            {(!pet.imageUrl || pet.imageUrl.includes('data:image/svg')) && (
              <Button
                onClick={() => onGenerateImage(pet.id)}
                className="w-full bg-game-accent hover:bg-game-accent/80 text-white text-xs py-2"
              >
                Generate OpenAI Image
              </Button>
            )}
            
            {activePet?.id !== pet.id && (
              <Button
                onClick={() => onActivate(pet.id)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 text-xs py-2"
              >
                Set Active
              </Button>
            )}
            
            {activePet?.id === pet.id && (
              <div className="text-center text-xs text-game-primary font-pixel">
                ★ ACTIVE PET ★
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}