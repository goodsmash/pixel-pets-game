import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface PetAttributes {
  name: string;
  color: string;
  size: string;
  type: string;
  element: string;
  rarity: string;
  personality: string;
  specialFeatures: string[];
  habitat: string;
  pattern: string;
  aura: string;
  birthmark: string;
  eyeType: string;
  wingType: string;
  tailType: string;
  furTexture: string;
  scale: string;
  horn: string;
  abilities: string[];
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
}

export const COLORS = [
  "Crimson", "Scarlet", "Azure", "Cerulean", "Emerald", "Jade", "Amber", "Gold",
  "Violet", "Amethyst", "Coral", "Copper", "Rose", "Magenta", "Silver", "Platinum",
  "Obsidian", "Onyx", "Bronze", "Mahogany", "Ivory", "Pearl", "Sapphire", "Ruby"
];

export const SIZES = [
  "Tiny", "Small", "Medium", "Large", "Huge", "Gigantic", "Colossal"
];

export const CREATURE_TYPES = [
  "Dragon", "Phoenix", "Unicorn", "Wolf", "Serpent", "Eagle", "Lion", "Tiger",
  "Spirit", "Beast", "Fairy", "Elemental", "Demon", "Angel", "Deity", "Guardian",
  "Hydra", "Kraken", "Sphinx", "Chimera", "Wyvern", "Leviathan", "Djinn", "Nymph",
  "Monk", "Explorer", "Hermit", "Galactic", "Archangel", "Phantom", "Oracle", "Sage"
];

export const ELEMENTS = [
  "Fire", "Water", "Earth", "Air", "Lightning", "Ice", "Shadow", "Light",
  "Metal", "Wood", "Crystal", "Void", "Energy", "Plasma", "Gravity", "Time",
  "Space", "Mind", "Soul", "Life", "Death", "Chaos", "Order", "Nature"
];

export const RARITIES = [
  { name: "Common", weight: 4000 },
  { name: "Uncommon", weight: 2500 },
  { name: "Rare", weight: 1500 },
  { name: "Epic", weight: 800 },
  { name: "Legendary", weight: 300 },
  { name: "Mythical", weight: 80 },
  { name: "Transcendent", weight: 20 }
];

export const SPECIAL_FEATURES = [
  "Glowing Eyes", "Crystal Scales", "Metal Claws", "Energy Wings", "Phantom Tail",
  "Fire Breath", "Ice Aura", "Lightning Speed", "Shadow Form", "Light Halo",
  "Void Touch", "Time Warp", "Space Fold", "Mind Link", "Soul Bond",
  "Life Force", "Death Gaze", "Chaos Storm", "Order Shield", "Nature Growth"
];

export const ENVIRONMENTS = [
  "Enchanted Forest", "Crystal Caves", "Floating Islands", "Fire Realm",
  "Ice Kingdom", "Shadow Dimension", "Light Sanctuary", "Metal Fortress",
  "Wood Grove", "Void Space", "Energy Field", "Plasma Core", "Gravity Well",
  "Time Stream", "Space Nexus", "Mind Palace", "Soul Garden", "Life Spring",
  "Death Valley", "Chaos Maelstrom", "Order Temple", "Nature Reserve"
];

export const PERSONALITIES = [
  "Playful", "Gentle", "Fierce", "Wise", "Mischievous", "Noble", "Mysterious",
  "Energetic", "Calm", "Brave", "Shy", "Curious", "Ancient", "Ethereal",
  "Primordial", "Cosmic", "Temporal", "Astral", "Dimensional", "Quantum"
];

export const ABILITIES = [
  "Fireball", "Ice Shard", "Lightning Bolt", "Earth Spike", "Wind Blade", "Water Whip",
  "Metal Strike", "Crystal Beam", "Shadow Slash", "Light Ray", "Void Drain", "Energy Blast",
  "Plasma Cannon", "Sonic Boom", "Gravity Crush", "Time Stop", "Fire Shield", "Ice Armor",
  "Lightning Barrier", "Earth Wall", "Wind Deflection", "Water Healing", "Metal Skin",
  "Crystal Protection", "Shadow Cloak", "Light Blessing", "Void Immunity", "Energy Regeneration",
  "Teleportation", "Levitation", "Invisibility", "Intangibility", "Shapeshifting", "Size Change",
  "Duplication", "Fusion", "Mind Reading", "Future Sight", "Past Vision", "Dream Entry",
  "Illusion Creation", "Reality Alter", "Cosmic Ray Burst", "Galactic Storm", "Universal Reset",
  "Reality Rewrite", "Time Reversal", "Space Fold", "Dimension Break", "Multiverse Creation",
  "Existence Erasure", "Life Genesis", "Death Transcendence", "Infinity Loop"
];

const PATTERNS = [
  "Stripes", "Spots", "Swirls", "Geometric", "Gradient", 
  "Marble", "Starlight", "Crystal", "Flame", "Wave"
];

const AURAS = [
  "Golden", "Silver", "Rainbow", "Dark", "Bright", 
  "Mystical", "Ethereal", "Cosmic", "Elemental", "Pure"
];

const BIRTHMARKS = [
  "Star", "Moon", "Sun", "Lightning", "Heart", 
  "Diamond", "Circle", "Triangle", "Spiral", "Cross"
];

const EYE_TYPES = [
  "Round", "Almond", "Oval", "Cat-like", "Dragon", 
  "Glowing", "Crystal", "Starry", "Void", "Multi-colored"
];

const WING_TYPES = [
  "Feathered", "Membrane", "Crystal", "Energy", "Leaf", 
  "Butterfly", "Dragonfly", "Bat", "Phoenix", "None"
];

const TAIL_TYPES = [
  "Long", "Short", "Fluffy", "Spike", "Fan", 
  "Whip", "Club", "Split", "Feathered", "None"
];

const FUR_TEXTURES = [
  "Smooth", "Fluffy", "Rough", "Silky", "Spiky", 
  "Curly", "Wavy", "Metallic", "Glowing", "Crystalline"
];

const SCALES = [
  "Smooth", "Rough", "Overlapping", "Metallic", "Iridescent", 
  "Spiky", "Large", "Small", "Glowing", "Transparent"
];

const HORNS = [
  "Straight", "Curved", "Spiral", "Branched", "Crystal", 
  "Metallic", "Glowing", "Split", "None", "Multiple"
];

const HABITATS = [
  "Enchanted Forest", "Crystal Caves", "Floating Islands", "Fire Realm",
  "Ice Kingdom", "Shadow Dimension", "Light Sanctuary"
];

function getRandomByWeight(items: { name: string; weight: number }[]): string {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  
  for (const item of items) {
    random -= item.weight;
    if (random < 0) {
      return item.name;
    }
  }
  return items[items.length - 1].name;
}

function hashToNumber(hash: string, index: number, max: number): number {
  const slice = hash.slice(index * 2, (index + 1) * 2);
  const num = parseInt(slice, 16);
  return num % max;
}

export function generateRandomPet(sha256Hash?: string): PetAttributes {
  const hash = sha256Hash || crypto.randomBytes(32).toString('hex');
  
  // Use hash for deterministic generation
  const colorIndex = hashToNumber(hash, 0, COLORS.length);
  const sizeIndex = hashToNumber(hash, 1, SIZES.length);
  const typeIndex = hashToNumber(hash, 2, CREATURE_TYPES.length);
  const elementIndex = hashToNumber(hash, 3, ELEMENTS.length);
  const personalityIndex = hashToNumber(hash, 4, PERSONALITIES.length);
  const habitatIndex = hashToNumber(hash, 5, HABITATS.length);
  
  // Generate rarity based on hash
  const rarityValue = hashToNumber(hash, 6, 10000);
  let rarity = "Common";
  let cumulativeWeight = 0;
  for (const r of RARITIES) {
    cumulativeWeight += r.weight;
    if (rarityValue < cumulativeWeight) {
      rarity = r.name;
      break;
    }
  }

  // Generate special features
  const featureCount = hashToNumber(hash, 7, 3) + 1;
  const specialFeatures: string[] = [];
  for (let i = 0; i < featureCount; i++) {
    const featureIndex = hashToNumber(hash, 8 + i, SPECIAL_FEATURES.length);
    if (!specialFeatures.includes(SPECIAL_FEATURES[featureIndex])) {
      specialFeatures.push(SPECIAL_FEATURES[featureIndex]);
    }
  }

  // Generate abilities based on rarity
  const abilityCount = Math.min(5, Math.max(1, Math.floor(RARITIES.findIndex(r => r.name === rarity) / 2) + 1));
  const abilities: string[] = [];
  for (let i = 0; i < abilityCount; i++) {
    const abilityIndex = hashToNumber(hash, 11 + i, ABILITIES.length);
    if (!abilities.includes(ABILITIES[abilityIndex])) {
      abilities.push(ABILITIES[abilityIndex]);
    }
  }

  // Generate stats based on rarity
  const baseStats = {
    Common: 30, Uncommon: 40, Rare: 50, Epic: 65, Legendary: 80, Mythical: 95, Transcendent: 120
  };
  const base = baseStats[rarity as keyof typeof baseStats] || 30;
  const variance = 20;

  // Generate deterministic unique name based on hash
  const nameIndex = hashToNumber(hash, 15, 1000);
  const nameVariations = [
    `${PERSONALITIES[personalityIndex]} ${CREATURE_TYPES[typeIndex]}`,
    `${ELEMENTS[elementIndex]} ${CREATURE_TYPES[typeIndex]}`,
    `${COLORS[colorIndex]} ${CREATURE_TYPES[typeIndex]}`,
    `${CREATURE_TYPES[typeIndex]} of ${HABITATS[habitatIndex]}`,
    `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${CREATURE_TYPES[typeIndex]}`
  ];
  
  const petName = nameVariations[nameIndex % nameVariations.length];

  return {
    name: petName,
    color: COLORS[colorIndex],
    size: SIZES[sizeIndex],
    type: CREATURE_TYPES[typeIndex],
    element: ELEMENTS[elementIndex],
    rarity,
    personality: PERSONALITIES[personalityIndex],
    habitat: HABITATS[habitatIndex],
    pattern: PATTERNS[hashToNumber(hash, 15, PATTERNS.length)],
    aura: AURAS[hashToNumber(hash, 16, AURAS.length)],
    birthmark: BIRTHMARKS[hashToNumber(hash, 17, BIRTHMARKS.length)],
    eyeType: EYE_TYPES[hashToNumber(hash, 18, EYE_TYPES.length)],
    wingType: WING_TYPES[hashToNumber(hash, 19, WING_TYPES.length)],
    tailType: TAIL_TYPES[hashToNumber(hash, 20, TAIL_TYPES.length)],
    furTexture: FUR_TEXTURES[hashToNumber(hash, 21, FUR_TEXTURES.length)],
    scale: SCALES[hashToNumber(hash, 22, SCALES.length)],
    horn: HORNS[hashToNumber(hash, 23, HORNS.length)],
    specialFeatures,
    abilities,
    attack: base + Math.floor(Math.random() * variance),
    defense: base + Math.floor(Math.random() * variance),
    speed: base + Math.floor(Math.random() * variance),
    intelligence: base + Math.floor(Math.random() * variance),
    luck: base + Math.floor(Math.random() * variance),
  };
}

export async function generatePetImage(petData: PetAttributes, sha256Hash: string): Promise<string> {
  // Use the new OpenAI generator service
  const { generatePetImage: generateOpenAIPetImage } = await import('./openaiGenerator');
  return generateOpenAIPetImage(petData);
}

export function generateBreedingOffspring(parentOne: PetAttributes, parentTwo: PetAttributes, breedingHash: string): PetAttributes {
  // Create offspring with inherited traits from both parents
  const hash = breedingHash;
  
  // Inherit traits from parents with some randomization
  const inheritFromParentOne = hashToNumber(hash, 0, 2) === 0;
  const colorInherit = hashToNumber(hash, 1, 3);
  const typeInherit = hashToNumber(hash, 2, 3);
  const elementInherit = hashToNumber(hash, 3, 3);
  
  // Color inheritance: 50% from parent, 25% blend, 25% mutation
  let color: string;
  if (colorInherit === 0) {
    color = inheritFromParentOne ? parentOne.color : parentTwo.color;
  } else if (colorInherit === 1) {
    // Blend colors (simplified)
    const colors = [parentOne.color, parentTwo.color];
    color = colors[hashToNumber(hash, 4, colors.length)];
  } else {
    // Mutation - new color
    color = COLORS[hashToNumber(hash, 5, COLORS.length)];
  }
  
  // Type inheritance with chance of evolution/mutation
  let type: string;
  if (typeInherit === 0) {
    type = inheritFromParentOne ? parentOne.type : parentTwo.type;
  } else if (typeInherit === 1) {
    // Hybrid type
    const types = [parentOne.type, parentTwo.type];
    type = types[hashToNumber(hash, 6, types.length)];
  } else {
    // Evolution/mutation
    type = CREATURE_TYPES[hashToNumber(hash, 7, CREATURE_TYPES.length)];
  }
  
  // Element inheritance
  let element: string;
  if (elementInherit === 0) {
    element = inheritFromParentOne ? parentOne.element : parentTwo.element;
  } else if (elementInherit === 1) {
    element = inheritFromParentOne ? parentTwo.element : parentOne.element;
  } else {
    // Rare dual element or mutation
    element = ELEMENTS[hashToNumber(hash, 8, ELEMENTS.length)];
  }
  
  // Rarity inheritance - chance for upgrade
  const parentRarities = [parentOne.rarity, parentTwo.rarity];
  const rarityUpgradeChance = hashToNumber(hash, 9, 100);
  let rarity: string;
  
  if (rarityUpgradeChance < 10) {
    // 10% chance for rarity upgrade
    const currentRarityIndex = Math.max(
      RARITIES.findIndex(r => r.name === parentOne.rarity),
      RARITIES.findIndex(r => r.name === parentTwo.rarity)
    );
    const nextRarityIndex = Math.min(currentRarityIndex + 1, RARITIES.length - 1);
    rarity = RARITIES[nextRarityIndex].name;
  } else {
    // Inherit from better parent
    const parentOneRarityIndex = RARITIES.findIndex(r => r.name === parentOne.rarity);
    const parentTwoRarityIndex = RARITIES.findIndex(r => r.name === parentTwo.rarity);
    rarity = parentOneRarityIndex < parentTwoRarityIndex ? parentOne.rarity : parentTwo.rarity;
  }
  
  // Combine special features from both parents
  const combinedFeatures = [...parentOne.specialFeatures, ...parentTwo.specialFeatures];
  const uniqueFeatures = combinedFeatures.filter((feature, index) => combinedFeatures.indexOf(feature) === index);
  const maxFeatures = Math.min(4, uniqueFeatures.length);
  const specialFeatures = uniqueFeatures.slice(0, maxFeatures);
  
  // Combine abilities
  const combinedAbilities = [...parentOne.abilities, ...parentTwo.abilities];
  const uniqueAbilities = combinedAbilities.filter((ability, index) => combinedAbilities.indexOf(ability) === index);
  const maxAbilities = Math.min(6, uniqueAbilities.length);
  const abilities = uniqueAbilities.slice(0, maxAbilities);
  
  // Stats inheritance with potential for improvement
  const statBonus = RARITIES.findIndex(r => r.name === rarity) * 5;
  const attack = Math.floor((parentOne.attack + parentTwo.attack) / 2) + statBonus + hashToNumber(hash, 10, 10);
  const defense = Math.floor((parentOne.defense + parentTwo.defense) / 2) + statBonus + hashToNumber(hash, 11, 10);
  const speed = Math.floor((parentOne.speed + parentTwo.speed) / 2) + statBonus + hashToNumber(hash, 12, 10);
  const intelligence = Math.floor((parentOne.intelligence + parentTwo.intelligence) / 2) + statBonus + hashToNumber(hash, 13, 10);
  const luck = Math.floor((parentOne.luck + parentTwo.luck) / 2) + statBonus + hashToNumber(hash, 14, 10);
  
  // Generate offspring name
  const nameVariations = [
    `Young ${type}`,
    `Baby ${color} ${type}`,
    `${element} Hatchling`,
    `Bred ${rarity} ${type}`,
    `${parentOne.name.split(' ')[0]} ${parentTwo.name.split(' ')[0]} Offspring`
  ];
  const name = nameVariations[hashToNumber(hash, 15, nameVariations.length)];
  
  // Other inherited traits
  const habitat = hashToNumber(hash, 16, 2) === 0 ? parentOne.habitat : parentTwo.habitat;
  const personality = PERSONALITIES[hashToNumber(hash, 17, PERSONALITIES.length)];
  const size = SIZES[hashToNumber(hash, 18, SIZES.length)];
  
  return {
    name,
    color,
    size,
    type,
    element,
    rarity,
    personality,
    specialFeatures,
    habitat,
    pattern: PATTERNS[hashToNumber(hash, 19, PATTERNS.length)],
    aura: AURAS[hashToNumber(hash, 20, AURAS.length)],
    birthmark: BIRTHMARKS[hashToNumber(hash, 21, BIRTHMARKS.length)],
    eyeType: EYE_TYPES[hashToNumber(hash, 22, EYE_TYPES.length)],
    wingType: WING_TYPES[hashToNumber(hash, 23, WING_TYPES.length)],
    tailType: TAIL_TYPES[hashToNumber(hash, 24, TAIL_TYPES.length)],
    furTexture: FUR_TEXTURES[hashToNumber(hash, 25, FUR_TEXTURES.length)],
    scale: SCALES[hashToNumber(hash, 26, SCALES.length)],
    horn: HORNS[hashToNumber(hash, 27, HORNS.length)],
    abilities,
    attack,
    defense,
    speed,
    intelligence,
    luck,
  };
}