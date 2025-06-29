import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Backpack, Sword, Shield, Gem, Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Pet, InventoryItem, CraftedItem } from '@shared/schema';

interface PetEquipmentProps {
  pet: Pet | null;
  onStatsUpdate?: () => void;
}

interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  rarity: string;
  effects: any;
  description: string;
  isEquipped: boolean;
}

export function PetEquipment({ pet, onStatsUpdate }: PetEquipmentProps) {
  const [selectedTab, setSelectedTab] = useState<'inventory' | 'equipment'>('inventory');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: !!pet
  });

  // Fetch crafted items (equipment)
  const { data: craftedItems = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/crafted-items'],
    enabled: !!pet
  });

  // Equip item mutation
  const equipMutation = useMutation({
    mutationFn: async ({ itemId, petId }: { itemId: number; petId: number }) => {
      return await fetch(`/api/crafted-items/${itemId}/equip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      onStatsUpdate?.();
      toast({
        title: "Equipment Updated",
        description: "Item equipped successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Equipment Failed",
        description: "Failed to equip item.",
        variant: "destructive"
      });
    }
  });

  // Unequip item mutation
  const unequipMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await fetch(`/api/crafted-items/${itemId}/unequip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      onStatsUpdate?.();
      toast({
        title: "Equipment Updated", 
        description: "Item unequipped successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Equipment Failed",
        description: "Failed to unequip item.",
        variant: "destructive"
      });
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffectDescription = (effects: any) => {
    if (!effects) return 'No special effects';
    
    if (typeof effects === 'string') return effects;
    
    if (effects.statBoosts) {
      const boosts = Object.entries(effects.statBoosts)
        .map(([stat, value]) => `+${value} ${stat}`)
        .join(', ');
      return boosts;
    }
    
    return 'Special effects';
  };

  const handleEquip = (itemId: number) => {
    if (!pet) return;
    equipMutation.mutate({ itemId, petId: pet.id });
  };

  const handleUnequip = (itemId: number) => {
    unequipMutation.mutate(itemId);
  };

  if (!pet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select a pet to view equipment</p>
        </CardContent>
      </Card>
    );
  }

  const equippedItems = (craftedItems as CraftedItem[]).filter((item: CraftedItem) => item.equippedToPetId === pet.id);
  const availableItems = (craftedItems as CraftedItem[]).filter((item: CraftedItem) => !item.equippedToPetId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Backpack className="h-5 w-5" />
          Equipment & Inventory
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={selectedTab === 'inventory' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('inventory')}
            className="flex items-center gap-2"
          >
            <Backpack className="h-4 w-4" />
            Inventory ({inventory.length})
          </Button>
          <Button
            variant={selectedTab === 'equipment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('equipment')}
            className="flex items-center gap-2"
          >
            <Sword className="h-4 w-4" />
            Equipment ({availableItems.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Equipped Items Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Currently Equipped
          </h3>
          
          {equippedItems.length > 0 ? (
            <div className="space-y-2">
              {equippedItems.map((item: CraftedItem) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Gem className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getEffectDescription(item.effects)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnequip(item.id)}
                    disabled={unequipMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No equipment equipped</p>
              <p className="text-sm">Craft or find items to equip</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Inventory/Equipment Tabs */}
        {selectedTab === 'inventory' && (
          <div>
            <h3 className="font-semibold mb-3">Raw Materials & Items</h3>
            {inventoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (inventory as InventoryItem[]).length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {(inventory as InventoryItem[]).map((item: InventoryItem) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded">
                          <Gem className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.itemName || item.itemId}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity || 1}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Item details
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{item.itemType}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Backpack className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items in inventory</p>
                <p className="text-sm">Explore to find materials</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'equipment' && (
          <div>
            <h3 className="font-semibold mb-3">Available Equipment</h3>
            {equipmentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableItems.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {availableItems.map((item: CraftedItem) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded">
                          <Sword className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.name}</p>
                            <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                              {item.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getEffectDescription(item.effects)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enhanced effects active
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEquip(item.id)}
                        disabled={equipMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sword className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No equipment available</p>
                <p className="text-sm">Craft items to equip them</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}