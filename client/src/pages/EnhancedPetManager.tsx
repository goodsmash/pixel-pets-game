import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Pet3DViewer } from '@/components/Pet3DViewer';
import { Pet3DGallery } from '@/components/Pet3DGallery';
import { AdvancedBattleArena } from '@/components/AdvancedBattleArena';
import { PetEquipment } from '@/components/PetEquipment';
import CraftingSystem from '@/components/CraftingSystem';
import { 
  Sparkles, 
  Sword, 
  Backpack, 
  Hammer, 
  Users, 
  Eye, 
  Heart,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import type { Pet } from '@shared/schema';

export default function EnhancedPetManager() {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active pet
  const { data: activePet } = useQuery({
    queryKey: ['/api/pets/active']
  });

  // Fetch all pets
  const { data: pets = [] } = useQuery({
    queryKey: ['/api/pets']
  });

  // Set active pet mutation
  const setActivePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await fetch(`/api/pets/${petId}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      toast({
        title: "Pet Activated",
        description: "Pet is now your active companion!"
      });
    }
  });

  useEffect(() => {
    if (activePet && !selectedPet) {
      setSelectedPet(activePet as Pet);
    }
  }, [activePet, selectedPet]);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    if (pet.id !== (activePet as any)?.id) {
      setActivePetMutation.mutate(pet.id);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffectiveStats = (pet: Pet) => ({
    health: pet.health || 100,
    attack: pet.attack || 10,
    defense: pet.defense || 10,
    speed: pet.speed || 10,
    intelligence: pet.intelligence || 10,
    luck: pet.luck || 10
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Advanced Pet Manager
          </h1>
          <p className="text-gray-600">
            Manage your 3D pixel pets with enhanced visualization and battle systems
          </p>
        </div>

        {/* Active Pet Display */}
        {selectedPet && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {selectedPet.name}
                </span>
                <div className="flex gap-2">
                  <Badge className={`text-white ${getRarityColor(selectedPet.rarity || 'common')}`}>
                    {selectedPet.rarity}
                  </Badge>
                  <Badge variant="outline">{selectedPet.element}</Badge>
                  {selectedPet.isShiny && (
                    <Badge variant="outline" className="text-yellow-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Shiny
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Pet3DViewer 
                    petHash={selectedPet.sha256Hash}
                    width={300}
                    height={250}
                    className="mx-auto"
                  />
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Level {selectedPet.level} • Generation {selectedPet.generation}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary">{selectedPet.type}</Badge>
                      <Badge variant="secondary">{selectedPet.size}</Badge>
                      <Badge variant="secondary">{selectedPet.color}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(getEffectiveStats(selectedPet)).map(([stat, value]) => (
                        <div key={stat} className="flex items-center gap-2">
                          {stat === 'health' && <Heart className="h-4 w-4 text-red-500" />}
                          {stat === 'attack' && <Sword className="h-4 w-4 text-orange-500" />}
                          {stat === 'defense' && <Shield className="h-4 w-4 text-blue-500" />}
                          {stat === 'speed' && <Zap className="h-4 w-4 text-yellow-500" />}
                          {stat === 'intelligence' && <Eye className="h-4 w-4 text-purple-500" />}
                          {stat === 'luck' && <Star className="h-4 w-4 text-green-500" />}
                          <span className="text-sm capitalize">{stat}:</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Attributes</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Mood:</span> {selectedPet.mood}</p>
                      <p><span className="font-medium">Happiness:</span> {selectedPet.happiness}/100</p>
                      <p><span className="font-medium">Energy:</span> {selectedPet.energy}/100</p>
                      <p><span className="font-medium">Hunger:</span> {selectedPet.hunger}/100</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              3D Gallery
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Battle Arena
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Backpack className="h-4 w-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="crafting" className="flex items-center gap-2">
              <Hammer className="h-4 w-4" />
              Crafting
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            <Pet3DGallery 
              selectedPet={selectedPet}
              onPetSelect={handlePetSelect}
            />
          </TabsContent>

          <TabsContent value="battle" className="space-y-6">
            <AdvancedBattleArena 
              playerPet={selectedPet}
              onBattleComplete={(victory, loot) => {
                if (victory && loot) {
                  toast({
                    title: "Victory!",
                    description: `You won and found: ${loot.name}!`
                  });
                  queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <PetEquipment 
              pet={selectedPet}
              onStatsUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
              }}
            />
          </TabsContent>

          <TabsContent value="crafting" className="space-y-6">
            <CraftingSystem />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Social features coming soon!</p>
                  <p className="text-sm">Trade pets, challenge friends, and join guilds</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pet Collection Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{(pets as Pet[]).length}</p>
                <p className="text-sm text-muted-foreground">Total Pets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {(pets as Pet[]).filter((p: Pet) => p.rarity === 'legendary').length}
                </p>
                <p className="text-sm text-muted-foreground">Legendary</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {(pets as Pet[]).filter((p: Pet) => p.isShiny).length}
                </p>
                <p className="text-sm text-muted-foreground">Shiny</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {(pets as Pet[]).length > 0 ? Math.max(...(pets as Pet[]).map((p: Pet) => p.level || 1)) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Highest Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}