export interface Pet {
  id: number;
  userId: string;
  name: string;
  sha256Hash: string;
  imageUrl?: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  happiness: number;
  energy: number;
  hunger: number;
  color: string;
  size: string;
  type: string;
  element: string;
  rarity: string;
  personality: string;
  specialFeatures: string[];
  abilities: string[];
  isActive: boolean;
  isFavorite: boolean;
  generation: number;
  parentOneId?: number;
  parentTwoId?: number;
  breedingCount: number;
  maxBreedingCount: number;
  lastBredAt?: string;
  tags: string[];
  notes?: string;
  acquisitionMethod: string;
  acquisitionDate: string;
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalExplorations: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  userId: string;
  itemType: string;
  itemName: string;
  itemDescription?: string;
  quantity: number;
  rarity: string;
  obtainedAt: string;
}

export interface GameState {
  id: number;
  userId: string;
  coins: number;
  activePetId?: number;
  currentEnvironment: string;
  unlockedEnvironments: string[];
  achievements: string[];
  settings: Record<string, any>;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationResult {
  encounter: {
    type: string;
    data: any;
    result: any;
    experienceGained: number;
  };
}

export interface BattleResult {
  result: string;
  damageDealt: number;
  damageTaken: number;
  experienceGained: number;
}

export type Environment = 'forest' | 'beach' | 'city' | 'mountain';
