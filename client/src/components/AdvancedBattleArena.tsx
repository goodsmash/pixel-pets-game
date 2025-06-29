import { useState, useEffect } from 'react';
import { Pet3DViewer } from './Pet3DViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Shield, Heart, Zap } from 'lucide-react';
import type { Pet } from '@shared/schema';

interface BattleState {
  playerHp: number;
  opponentHp: number;
  turn: number;
  isActive: boolean;
  log: string[];
}

interface AdvancedBattleArenaProps {
  playerPet: Pet | null;
  onBattleComplete?: (victory: boolean, loot?: any) => void;
}

export function AdvancedBattleArena({ playerPet, onBattleComplete }: AdvancedBattleArenaProps) {
  const [opponentPet, setOpponentPet] = useState<Pet | null>(null);
  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: 0,
    opponentHp: 0,
    turn: 0,
    isActive: false,
    log: []
  });
  const [challengeHash, setChallengeHash] = useState('');

  // Element advantages system
  const elementalAdvantages: Record<string, string> = {
    'Fire': 'Earth',
    'Water': 'Fire', 
    'Earth': 'Air',
    'Air': 'Water',
    'Light': 'Dark',
    'Dark': 'Light'
  };

  const generateWildOpponent = async () => {
    if (!playerPet) return;

    const opponentSeed = `wild-${Date.now()}-${Math.random()}`;
    const hash = await sha256(opponentSeed);
    
    // Create a balanced opponent based on player's level
    const baseStats = {
      hp: Math.max(50, (playerPet.health || 80) - 20 + Math.floor(Math.random() * 40)),
      attack: Math.max(5, (playerPet.attack || 10) - 3 + Math.floor(Math.random() * 6)),
      defense: Math.max(3, (playerPet.defense || 8) - 2 + Math.floor(Math.random() * 4)),
      speed: Math.max(5, (playerPet.speed || 10) - 3 + Math.floor(Math.random() * 6)),
      intelligence: Math.max(5, (playerPet.intelligence || 10) - 3 + Math.floor(Math.random() * 6)),
      luck: Math.max(1, (playerPet.luck || 5) - 2 + Math.floor(Math.random() * 4))
    };

    const wildPet: Pet = {
      id: -1,
      userId: 'wild',
      name: `Wild ${getRandomElement(['Flame', 'Shadow', 'Crystal', 'Storm', 'Mystic'])} Beast`,
      sha256Hash: hash,
      color: getRandomElement(['Red', 'Blue', 'Green', 'Purple', 'Orange']),
      size: getRandomElement(['Medium', 'Large', 'Small']),
      type: getRandomElement(['Dragon', 'Beast', 'Spirit', 'Elemental']),
      element: getRandomElement(['Fire', 'Water', 'Earth', 'Air', 'Light', 'Dark']),
      rarity: getRandomElement(['Common', 'Uncommon', 'Rare']),
      personality: JSON.stringify({ type: getRandomElement(['Aggressive', 'Defensive', 'Balanced']) }),
      imageUrl: null,
      isActive: false,
      experience: 0,
      level: Math.max(1, (playerPet.level || 1) - 2 + Math.floor(Math.random() * 4)),
      attack: baseStats.attack,
      defense: baseStats.defense,
      speed: baseStats.speed,
      intelligence: baseStats.intelligence,
      luck: baseStats.luck,
      health: baseStats.hp,
      maxHealth: baseStats.hp,
      happiness: 80,
      hunger: 100,
      energy: 100,
      mood: 'aggressive',
      traits: JSON.stringify([]),
      memories: JSON.stringify([]),
      abilities: JSON.stringify([]),
      specialFeatures: JSON.stringify([]),
      tags: JSON.stringify([]),
      habitat: null,
      pattern: null,
      aura: null,
      birthmark: null,
      eyeType: null,
      wingType: null,
      tailType: null,
      furTexture: null,
      scale: null,
      horn: null,
      lastInteraction: null,
      isForTrade: false,
      tradeValue: 0,
      birthDate: new Date(),
      evolutionStage: 1,
      isShiny: false,
      generation: 1,
      breedingCount: 0,
      maxBreedingCount: 3,
      parentOneId: null,
      parentTwoId: null,
      isFavorite: false,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setOpponentPet(wildPet);
    return wildPet;
  };

  const startBattle = async () => {
    if (!playerPet || !opponentPet) return;

    const playerStats = getEffectiveStats(playerPet);
    const opponentStats = getEffectiveStats(opponentPet);

    setBattleState({
      playerHp: playerStats.hp,
      opponentHp: opponentStats.hp,
      turn: 1,
      isActive: true,
      log: [`Battle begins! ${playerPet.name} vs ${opponentPet.name}`]
    });

    // Auto-battle simulation
    simulateBattle(playerStats, opponentStats);
  };

  const simulateBattle = async (playerStats: any, opponentStats: any) => {
    let playerHp = playerStats.hp;
    let opponentHp = opponentStats.hp;
    let turn = 1;
    const log: string[] = [`Battle begins! ${playerPet!.name} vs ${opponentPet!.name}`];

    while (playerHp > 0 && opponentHp > 0 && turn < 20) {
      // Player turn
      const playerDamage = calculateDamage(playerStats, opponentStats, playerPet!.element, opponentPet!.element);
      opponentHp = Math.max(0, opponentHp - playerDamage);
      
      log.push(`Turn ${turn}: ${playerPet!.name} deals ${playerDamage} damage!`);
      
      if (opponentHp <= 0) {
        log.push(`${playerPet!.name} wins!`);
        break;
      }

      // Opponent turn
      const opponentDamage = calculateDamage(opponentStats, playerStats, opponentPet!.element, playerPet!.element);
      playerHp = Math.max(0, playerHp - opponentDamage);
      
      log.push(`${opponentPet!.name} deals ${opponentDamage} damage!`);
      
      if (playerHp <= 0) {
        log.push(`${opponentPet!.name} wins!`);
        break;
      }

      turn++;

      // Update state progressively for animation effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBattleState(prev => ({
        ...prev,
        playerHp,
        opponentHp,
        turn,
        log: [...log]
      }));
    }

    // Battle conclusion
    const victory = playerHp > 0;
    setBattleState(prev => ({ ...prev, isActive: false }));
    
    if (victory && onBattleComplete) {
      const loot = generateLoot();
      onBattleComplete(true, loot);
    } else if (onBattleComplete) {
      onBattleComplete(false);
    }
  };

  const calculateDamage = (attacker: any, defender: any, attackerElement: string, defenderElement: string): number => {
    const baseDamage = Math.max(1, attacker.attack - defender.defense / 2);
    const elementMultiplier = elementalAdvantages[attackerElement] === defenderElement ? 1.5 : 1;
    const critChance = attacker.luck / 100;
    const isCrit = Math.random() < critChance;
    
    return Math.floor(baseDamage * elementMultiplier * (isCrit ? 1.5 : 1));
  };

  const getEffectiveStats = (pet: Pet) => {
    // Base stats with equipment bonuses
    let stats = {
      hp: pet.health || 100,
      attack: pet.attack || 10,
      defense: pet.defense || 10,
      speed: pet.speed || 10,
      intelligence: pet.intelligence || 10,
      luck: pet.luck || 10
    };

    return stats;
  };

  const generateLoot = () => {
    const adjectives = ['Glowing', 'Ancient', 'Mystic', 'Powerful', 'Rare'];
    const nouns = ['Shard', 'Gem', 'Amulet', 'Crystal', 'Rune'];
    
    return {
      name: `${getRandomElement(adjectives)} ${getRandomElement(nouns)}`,
      effect: {
        type: 'stat_boost',
        stat: getRandomElement(['attack', 'defense', 'hp']),
        value: Math.floor(Math.random() * 5) + 1,
        description: `Boosts ${getRandomElement(['attack', 'defense', 'hp'])} by ${Math.floor(Math.random() * 5) + 1}`
      }
    };
  };

  const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (playerPet) {
      generateWildOpponent();
    }
  }, [playerPet]);

  if (!playerPet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select a pet to start battling!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Battle Arena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player Pet */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{playerPet.name}</h3>
                <Badge variant="outline">{playerPet.element}</Badge>
              </div>
              
              <Pet3DViewer 
                petHash={playerPet.sha256Hash} 
                width={250} 
                height={200}
                className="mx-auto"
              />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">HP: {battleState.playerHp}/{playerPet.health || 100}</span>
                </div>
                <Progress 
                  value={(battleState.playerHp / (playerPet.health || 100)) * 100} 
                  className="h-2"
                />
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Sword className="h-3 w-3" />
                    ATK: {playerPet.attack}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    DEF: {playerPet.defense}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    SPD: {playerPet.speed}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    LCK: {playerPet.luck}
                  </div>
                </div>
              </div>
            </div>

            {/* Opponent Pet */}
            <div className="space-y-4">
              {opponentPet && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{opponentPet.name}</h3>
                    <Badge variant="secondary">{opponentPet.element}</Badge>
                  </div>
                  
                  <Pet3DViewer 
                    petHash={opponentPet.sha256Hash} 
                    width={250} 
                    height={200}
                    className="mx-auto"
                    enableControls={false}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">HP: {battleState.opponentHp}/{opponentPet.health || 100}</span>
                    </div>
                    <Progress 
                      value={(battleState.opponentHp / (opponentPet.health || 100)) * 100} 
                      className="h-2"
                    />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Sword className="h-3 w-3" />
                        ATK: {opponentPet.attack}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        DEF: {opponentPet.defense}
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        SPD: {opponentPet.speed}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        LCK: {opponentPet.luck}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={startBattle} 
                disabled={!opponentPet || battleState.isActive}
                className="flex-1"
              >
                {battleState.isActive ? 'Battle in Progress...' : 'Start Battle'}
              </Button>
              <Button 
                variant="outline" 
                onClick={generateWildOpponent}
                disabled={battleState.isActive}
              >
                New Opponent
              </Button>
            </div>

            {/* Challenge System */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Challenge a Friend's Pet</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter opponent's pet hash"
                  value={challengeHash}
                  onChange={(e) => setChallengeHash(e.target.value)}
                  className="flex-1"
                />
                <Button variant="secondary" disabled>
                  Challenge
                </Button>
              </div>
            </div>

            {/* Battle Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Battle Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {battleState.log.map((entry, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {entry}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}