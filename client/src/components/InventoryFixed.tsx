import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: number;
  userId: string;
  itemType: string;
  itemName: string;
  quantity: number;
  rarity?: string;
  itemDescription?: string;
}

interface GameState {
  coins: number;
  gems: number;
}

export default function InventoryFixed() {
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
    return icons[itemType.toLowerCase()] || 'fas fa-cube';
  };

  const getRarityColor = (rarity: string) => {
    if (!rarity) return 'text-gray-400';
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
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const coins = gameState?.coins || 0;
  const inventoryArray = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-pixel text-lg text-white">Inventory</h3>
        
        {/* Currency Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <i className="fas fa-coins text-yellow-400"></i>
            <span className="text-sm text-white">{coins.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Inventory Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {inventoryArray.slice(0, 9).map((item) => (
          <div
            key={item.id}
            className="bg-black/30 border border-white/10 rounded-lg p-3 text-center hover:border-game-accent/50 transition-colors cursor-pointer group"
            title={item.itemDescription || item.itemName}
          >
            <i className={`${getItemIcon(item.itemType)} ${getRarityColor(item.rarity || 'common')} text-lg mb-1 group-hover:scale-110 transition-transform`}></i>
            <div className="text-xs truncate text-white">{item.itemName}</div>
            <div className="text-xs text-gray-400">x{item.quantity}</div>
          </div>
        ))}
        
        {/* Empty slots */}
        {[...Array(Math.max(0, 9 - inventoryArray.length))].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-black/30 border border-white/10 rounded-lg p-3 text-center border-dashed opacity-50"
          >
            <i className="fas fa-plus text-white/30 text-lg mb-1"></i>
            <div className="text-xs text-white/30">Empty</div>
          </div>
        ))}
      </div>
      
      {/* View All Button */}
      {inventoryArray.length > 9 && (
        <div className="text-center">
          <button className="text-xs text-game-accent hover:text-game-accent/80 transition-colors">
            View All ({inventoryArray.length} items)
          </button>
        </div>
      )}
    </div>
  );
}