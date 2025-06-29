import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Hammer, 
  Package, 
  Clock, 
  Star, 
  Sparkles, 
  Shield, 
  Sword, 
  Zap,
  Crown,
  Gem,
  CheckCircle,
  XCircle,
  Timer
} from "lucide-react";

interface CraftingRecipe {
  id: number;
  name: string;
  category: string;
  type: string;
  rarity: string;
  description: string;
  materials: { material: string; quantity: number }[];
  craftingTime: number;
  levelRequired: number;
  effects: Record<string, number>;
  bonuses: string[];
}

interface CraftedItem {
  id: number;
  userId: string;
  recipeId: number;
  name: string;
  category: string;
  type: string;
  rarity: string;
  effects: Record<string, number>;
  bonuses: string[];
  durability: number;
  maxDurability: number;
  equippedToPetId?: number;
  createdAt: string;
}

interface CraftingQueue {
  id: number;
  userId: string;
  recipeId: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  craftingTime: number;
}

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  rarity: string;
  description: string;
}

export default function CraftingSystem() {
  const [activeCategory, setActiveCategory] = useState("accessories");
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<CraftingRecipe[]>({
    queryKey: ["/api/crafting/recipes"],
  });

  const { data: craftedItems = [], isLoading: itemsLoading } = useQuery<CraftedItem[]>({
    queryKey: ["/api/crafting/items"],
  });

  const { data: craftingQueue = [], isLoading: queueLoading } = useQuery<CraftingQueue[]>({
    queryKey: ["/api/crafting/queue"],
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const craftMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      return await apiRequest(`/api/crafting/craft`, "POST", { recipeId });
    },
    onSuccess: () => {
      toast({
        title: "Crafting Started",
        description: "Your item has been added to the crafting queue.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crafting/queue"] });
    },
    onError: (error: any) => {
      toast({
        title: "Crafting Failed",
        description: error.message || "Failed to start crafting",
        variant: "destructive",
      });
    },
  });

  const completeCraftMutation = useMutation({
    mutationFn: async (queueId: number) => {
      return await apiRequest(`/api/crafting/complete/${queueId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Crafting Complete",
        description: "Your item has been crafted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crafting/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crafting/items"] });
    },
    onError: (error: any) => {
      toast({
        title: "Completion Failed",
        description: error.message || "Failed to complete crafting",
        variant: "destructive",
      });
    },
  });

  const equipMutation = useMutation({
    mutationFn: async ({ itemId, petId }: { itemId: number; petId: number }) => {
      return await apiRequest(`/api/crafting/equip/${itemId}/${petId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Item Equipped",
        description: "Item has been equipped to your pet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crafting/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Equipment Failed",
        description: error.message || "Failed to equip item",
        variant: "destructive",
      });
    },
  });

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

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: Star,
      uncommon: Sparkles,
      rare: Gem,
      epic: Crown,
      legendary: Zap,
      mythic: Shield,
      transcendent: Sword
    };
    const Icon = icons[rarity as keyof typeof icons] || Star;
    return <Icon className="w-4 h-4" />;
  };

  const canCraftRecipe = (recipe: CraftingRecipe) => {
    if (!recipe?.materials || !Array.isArray(recipe.materials)) return false;
    return recipe.materials.every(material => {
      const inventoryItem = Array.isArray(inventory) ? inventory.find((item: InventoryItem) => 
        item.itemName === material.material
      ) : undefined;
      return inventoryItem && inventoryItem.quantity >= material.quantity;
    });
  };

  const filteredRecipes = Array.isArray(recipes) ? recipes.filter((recipe: CraftingRecipe) => 
    recipe.category === activeCategory
  ) : [];

  const isQueueItemReady = (queueItem: CraftingQueue) => {
    const startTime = new Date(queueItem.startedAt).getTime();
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    return elapsed >= queueItem.craftingTime * 1000;
  };

  const getQueueProgress = (queueItem: CraftingQueue) => {
    const startTime = new Date(queueItem.startedAt).getTime();
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const totalTime = queueItem.craftingTime * 1000;
    return Math.min((elapsed / totalTime) * 100, 100);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Hammer className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Crafting Workshop</h2>
      </div>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="queue">Queue ({Array.isArray(craftingQueue) ? craftingQueue.length : 0})</TabsTrigger>
          <TabsTrigger value="items">My Items ({Array.isArray(craftedItems) ? craftedItems.length : 0})</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {["accessories", "consumables", "tools"].map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe: CraftingRecipe) => (
              <Card 
                key={recipe.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRecipe?.id === recipe.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getRarityIcon(recipe.rarity)}
                      {recipe.name}
                    </CardTitle>
                    <Badge className={getRarityColor(recipe.rarity)}>
                      {recipe.rarity}
                    </Badge>
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Materials Required:</h4>
                      <div className="space-y-1">
                        {(recipe.materials || []).map((material, index) => {
                          const inventoryItem = Array.isArray(inventory) ? inventory.find((item: InventoryItem) => 
                            item.itemName === material.material
                          ) : undefined;
                          const hasEnough = inventoryItem && inventoryItem.quantity >= material.quantity;
                          
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span className={hasEnough ? "text-green-600" : "text-red-600"}>
                                {material.material}
                              </span>
                              <span className={hasEnough ? "text-green-600" : "text-red-600"}>
                                {inventoryItem?.quantity || 0}/{material.quantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(recipe.craftingTime)}
                    </div>

                    {Object.keys(recipe.effects).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Effects:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(recipe.effects).map(([effect, value]) => (
                            <Badge key={effect} variant="secondary" className="text-xs">
                              +{value} {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        craftMutation.mutate(recipe.id);
                      }}
                      disabled={!canCraftRecipe(recipe) || craftMutation.isPending}
                      className="w-full"
                    >
                      {craftMutation.isPending ? "Starting..." : "Craft Item"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(craftingQueue) ? craftingQueue.map((queueItem: CraftingQueue) => {
              const recipe = Array.isArray(recipes) ? recipes.find((r: CraftingRecipe) => r.id === queueItem.recipeId) : undefined;
              const isReady = isQueueItemReady(queueItem);
              const progress = getQueueProgress(queueItem);
              
              return (
                <Card key={queueItem.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          queueItem.status === "completed" ? "bg-green-500" :
                          isReady ? "bg-yellow-500" : "bg-blue-500"
                        }`} />
                        <div>
                          <h3 className="font-semibold">{recipe?.name || "Unknown Recipe"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {queueItem.status === "completed" ? "Completed" :
                             isReady ? "Ready to collect" : "In progress"}
                          </p>
                        </div>
                      </div>
                      
                      {isReady && queueItem.status !== "completed" && (
                        <Button
                          onClick={() => completeCraftMutation.mutate(queueItem.id)}
                          disabled={completeCraftMutation.isPending}
                          size="sm"
                        >
                          {completeCraftMutation.isPending ? "Collecting..." : "Collect"}
                        </Button>
                      )}
                    </div>
                    
                    {queueItem.status !== "completed" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }) : null}
            
            {(!Array.isArray(craftingQueue) || craftingQueue.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items in crafting queue</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(craftedItems) ? craftedItems.map((item: CraftedItem) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getRarityIcon(item.rarity)}
                      {item.name}
                    </CardTitle>
                    <Badge className={getRarityColor(item.rarity)}>
                      {item.rarity}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">
                    {item.category} • {item.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Durability</span>
                      <span className={item.durability < item.maxDurability * 0.3 ? "text-red-500" : ""}>
                        {item.durability}/{item.maxDurability}
                      </span>
                    </div>
                    
                    <Progress value={(item.durability / item.maxDurability) * 100} />

                    {Object.keys(item.effects).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Effects:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.effects).map(([effect, value]) => (
                            <Badge key={effect} variant="secondary" className="text-xs">
                              +{value} {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.bonuses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Bonuses:</h4>
                        <div className="space-y-1">
                          {item.bonuses.map((bonus, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {bonus}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        {item.equippedToPetId ? "Equipped" : "Equip"}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Repair
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>
          
          {(!Array.isArray(craftedItems) || craftedItems.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No crafted items yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(inventory) ? inventory.map((item: InventoryItem) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <Badge className={getRarityColor(item.rarity)} variant="secondary">
                        {item.rarity}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{item.quantity}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>
          
          {(!Array.isArray(inventory) || inventory.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No materials in inventory</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}