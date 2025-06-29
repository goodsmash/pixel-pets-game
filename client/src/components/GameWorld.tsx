import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WorldMap from "./WorldMap";
import { 
  Store, 
  Home, 
  Gamepad2, 
  Heart, 
  School, 
  TreePine, 
  Sparkles,
  Crown,
  Gift,
  Users,
  ShoppingCart,
  Coins,
  MapPin,
  Zap
} from "lucide-react";

interface WorldLocation {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlockLevel: number;
  features: string[];
}

const WORLD_LOCATIONS: WorldLocation[] = [
  {
    id: "home",
    name: "Your Home",
    description: "Care for your pets and manage your collection",
    icon: Home,
    unlockLevel: 1,
    features: ["Pet Care", "Inventory", "Pet Customization"]
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, and trade with other players",
    icon: Store,
    unlockLevel: 1,
    features: ["Trading", "Auction House", "Player Shops"]
  },
  {
    id: "exploration",
    name: "Wild Areas",
    description: "Explore and discover new pets and treasures",
    icon: TreePine,
    unlockLevel: 1,
    features: ["Pet Discovery", "Resource Gathering", "Adventures"]
  },
  {
    id: "academy",
    name: "Pet Academy",
    description: "Train and educate your pets",
    icon: School,
    unlockLevel: 5,
    features: ["Training", "Skill Development", "Classes"]
  },
  {
    id: "arena",
    name: "Battle Arena",
    description: "Compete in battles and tournaments",
    icon: Zap,
    unlockLevel: 10,
    features: ["PvP Battles", "Tournaments", "Rankings"]
  },
  {
    id: "arcade",
    name: "Game Arcade",
    description: "Play mini-games and earn rewards",
    icon: Gamepad2,
    unlockLevel: 3,
    features: ["Mini Games", "Daily Challenges", "Prizes"]
  },
  {
    id: "hospital",
    name: "Pet Hospital",
    description: "Heal and care for sick pets",
    icon: Heart,
    unlockLevel: 2,
    features: ["Pet Healing", "Health Check", "Medicine"]
  },
  {
    id: "magic-shop",
    name: "Magic Shop",
    description: "Purchase magical items and spells",
    icon: Sparkles,
    unlockLevel: 8,
    features: ["Magic Items", "Spells", "Enchantments"]
  },
  {
    id: "royal-castle",
    name: "Royal Castle",
    description: "Visit the kingdom's royal court",
    icon: Crown,
    unlockLevel: 20,
    features: ["Royal Quests", "Noble Pets", "Castle Events"]
  },
  {
    id: "gift-shop",
    name: "Gift Shop",
    description: "Special seasonal items and gifts",
    icon: Gift,
    unlockLevel: 1,
    features: ["Seasonal Items", "Gift Cards", "Special Offers"]
  }
];

export default function GameWorld() {
  const [selectedLocation, setSelectedLocation] = useState<string>("home");
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameState = {} } = useQuery({
    queryKey: ["/api/game-state"],
  });

  const { data: userLevelData = { level: 1, experience: 0 } } = useQuery({
    queryKey: ["/api/user/level"],
  });
  
  const userLevel = (userLevelData && typeof userLevelData === 'object' && 'level' in userLevelData) 
    ? (userLevelData as any).level || 1 
    : 1;

  const visitLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      return await apiRequest(`/api/world/visit`, "POST", { locationId });
    },
    onSuccess: (data) => {
      toast({
        title: "Location Visited",
        description: `Welcome to ${selectedLocation}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
    onError: (error: any) => {
      toast({
        title: "Visit Failed",
        description: error.message || "Failed to visit location",
        variant: "destructive",
      });
    },
  });

  const getLocationIcon = (location: WorldLocation) => {
    const Icon = location.icon;
    return <Icon className="w-8 h-8" />;
  };

  const isLocationUnlocked = (location: WorldLocation) => {
    return userLevel >= location.unlockLevel;
  };

  const selectedLocationData = WORLD_LOCATIONS.find(loc => loc.id === selectedLocation);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Game World</h2>
        <Badge variant="secondary" className="ml-auto">
          Level {userLevel}
        </Badge>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="exploration">Exploration</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* World Map */}
            <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>World Map</CardTitle>
              <CardDescription>
                Click on any location to visit and explore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WORLD_LOCATIONS.map((location) => {
                  const isUnlocked = isLocationUnlocked(location);
                  
                  return (
                    <Card
                      key={location.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedLocation === location.id ? "ring-2 ring-blue-500" : ""
                      } ${!isUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedLocation(location.id);
                        } else {
                          toast({
                            title: "Location Locked",
                            description: `Reach level ${location.unlockLevel} to unlock ${location.name}`,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-3 rounded-full ${
                            isUnlocked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                          }`}>
                            {getLocationIcon(location)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{location.name}</h3>
                            {!isUnlocked && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Level {location.unlockLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Details */}
        <div className="space-y-4 lg:col-span-1">
          {selectedLocationData && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    {getLocationIcon(selectedLocationData)}
                  </div>
                  <div>
                    <CardTitle>{selectedLocationData.name}</CardTitle>
                    <CardDescription>
                      {selectedLocationData.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Available Features:</h4>
                  <div className="space-y-1">
                    {selectedLocationData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => visitLocationMutation.mutate(selectedLocation)}
                  disabled={visitLocationMutation.isPending || !isLocationUnlocked(selectedLocationData)}
                  className="w-full"
                >
                  {visitLocationMutation.isPending ? "Visiting..." : "Visit Location"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Coins</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{(gameState as any)?.coins || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gems</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold">{(gameState as any)?.gems || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Pets</span>
                <span className="font-semibold">{(gameState as any)?.activePets || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Friends</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">{(gameState as any)?.friendsCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Gift className="w-4 h-4 mr-2" />
                Claim Daily Reward
              </Button>
            </CardContent>
          </Card>
        </div>
          </div>
        </TabsContent>

        <TabsContent value="exploration" className="space-y-6">
          <WorldMap 
            onRegionSelect={setSelectedRegion}
            selectedRegion={selectedRegion}
          />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activities</CardTitle>
              <CardDescription>
                Complete activities to earn rewards and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <TreePine className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Explore Forest</div>
                      <div className="text-sm text-muted-foreground">Find new creatures</div>
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium">Pet Care</div>
                      <div className="text-sm text-muted-foreground">Feed and play with pets</div>
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Visit Marketplace</div>
                      <div className="text-sm text-muted-foreground">Trade with other players</div>
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}