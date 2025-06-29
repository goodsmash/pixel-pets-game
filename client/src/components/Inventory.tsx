import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface InventoryItem {
  id: number;
  userId: string;
  itemType: string;
  itemId: string;
  itemName?: string;
  quantity: number;
  rarity?: string;
  itemDescription?: string;
  metadata?: any;
  acquiredAt?: Date;
  obtainedAt?: Date;
}

interface GameState {
  coins: number;
  gems: number;
}

export default function Inventory() {
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    retry: false,
  });

  const { data: gameState = {} as GameState } = useQuery<GameState>({
    queryKey: ["/api/game-state"],
    retry: false,
  });

  const getItemIcon = (itemType: string) => {
    if (!itemType) return 'fas fa-cube';
    const icons: Record<string, string> = {
      gem: 'fas fa-gem',
      consumable: 'fas fa-apple-alt',
      equipment: 'fas fa-shield-alt',
      currency: 'fas fa-coins',
      item: 'fas fa-scroll',
      trophy: 'fas fa-trophy',
    };
    return icons[itemType?.toLowerCase() || ''] || 'fas fa-cube';
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-orange-400',
      mythic: 'text-red-400',
    };
    return colors[rarity.toLowerCase()] || 'text-gray-400';
  };

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-6">
          <h3 className="font-pixel text-lg text-game-secondary mb-4">INVENTORY</h3>
          <div className="animate-pulse">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/20 h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const inventoryItems = inventory || [];
  const coins = (gameState as any)?.coins || 0;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-pixel text-lg text-game-secondary">INVENTORY</h3>
          <div className="bg-game-dark/50 px-3 py-1 rounded-lg border border-white/20">
            <i className="fas fa-coins text-game-accent mr-1"></i>
            <span className="text-sm">{coins.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Inventory Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.isArray(inventory) ? inventory.slice(0, 9).map((item: any) => (
            <div
              key={item.id}
              className="bg-black/30 border border-white/10 rounded-lg p-3 text-center hover:border-game-accent/50 transition-colors cursor-pointer group"
              title={item.itemDescription || item.itemName}
            >
              <i className={`${getItemIcon(item.itemType)} ${getRarityColor(item.rarity)} text-lg mb-1 group-hover:scale-110 transition-transform`}></i>
              <div className="text-xs truncate">{item.itemName}</div>
              <div className="text-xs text-game-secondary">x{item.quantity}</div>
            </div>
          )) : null}
          
          {/* Empty slots */}
          {[...Array(Math.max(0, 9 - (Array.isArray(inventory) ? inventory.length : 0)))].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-black/30 border border-white/10 rounded-lg p-3 text-center border-dashed opacity-50"
            >
              <i className="fas fa-plus text-gray-500 text-lg mb-1"></i>
              <div className="text-xs text-gray-500">Empty</div>
            </div>
          ))}
        </div>
        
        {/* Recent Loot */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="font-pixel text-xs text-game-accent mb-3">RECENT LOOT</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {inventoryItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm bg-black/30 p-2 rounded"
              >
                <div className="flex items-center">
                  <i className={`${getItemIcon(item.itemType)} ${getRarityColor(item.rarity || 'common')} mr-2`}></i>
                  <span className="truncate">{item.itemName || item.itemId || 'Unknown Item'}</span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      x{item.quantity}
                    </Badge>
                  )}
                </div>
                <span className="text-game-secondary text-xs">
                  Recently
                </span>
              </div>
            ))}
            
            {inventoryItems.length === 0 && (
              <div className="text-center text-white/50 py-4">
                <i className="fas fa-box-open text-2xl mb-2"></i>
                <p className="text-sm">No items yet. Start exploring!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
