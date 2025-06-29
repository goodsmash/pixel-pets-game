import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import crypto from 'crypto';

// Google Gemini for text generation only
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// OpenAI for image generation only
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Comprehensive attribute arrays for maximum randomization
const COLORS = [
  // Basic Colors
  "Crimson", "Scarlet", "Ruby", "Cherry", "Rose", "Pink", "Magenta", "Fuchsia", "Purple", "Violet",
  "Indigo", "Navy", "Blue", "Azure", "Cyan", "Teal", "Turquoise", "Mint", "Green", "Emerald",
  "Lime", "Yellow", "Gold", "Amber", "Orange", "Coral", "Peach", "Brown", "Tan", "Beige",
  "Gray", "Silver", "White", "Black", "Charcoal", "Ivory", "Cream", "Pearl", "Bronze", "Copper",
  
  // Mystical Colors
  "Twilight Haze", "Solar Flare Red", "Mystic Opal", "Galactic Swirl", "Nebula Purple", "Cosmic Blue",
  "Starlight Silver", "Moonbeam White", "Shadow Void", "Ethereal Glow", "Aurora Green", "Prism Rainbow",
  "Dimensional Shift", "Quantum Violet", "Astral Pink", "Celestial Gold", "Vortex Teal", "Phoenix Orange",
  "Dragon Scale", "Unicorn Shimmer", "Fairy Dust", "Wizard Blue", "Enchanted Forest", "Crystal Clear",
  
  // Elemental Colors
  "Flame Red", "Ice Blue", "Earth Brown", "Wind Gray", "Lightning Yellow", "Water Aqua", "Metal Silver",
  "Wood Green", "Light Gold", "Dark Purple", "Poison Green", "Psychic Pink", "Fighting Red", "Ghost White",
  "Steel Blue", "Rock Brown", "Bug Green", "Flying Sky", "Electric Yellow", "Grass Green", "Fire Orange",
  
  // Rare Patterns
  "Holographic Rainbow", "Iridescent Blue", "Chameleon Shift", "Mirror Chrome", "Liquid Metal", "Plasma Glow",
  "Neon Electric", "Bioluminescent", "Crystalline", "Molten Lava", "Frozen Ice", "Smoky Mist", "Glittering",
  "Translucent", "Opaque Matte", "Glossy Shine", "Velvet Touch", "Silk Smooth", "Rough Stone", "Bumpy Scale",
  
  // Legendary Colors
  "Transcendent Aura", "Divine Light", "Infernal Dark", "Temporal Flux", "Reality Warp", "Existence Void",
  "Creation Bright", "Destruction Black", "Infinity Loop", "Zero Point", "Big Bang", "Heat Death",
  "Multiverse", "Singularity", "Event Horizon", "Quantum Entangled", "Probability Cloud", "Wave Function"
];

const SIZES = [
  // Standard Sizes
  "Tiny", "Small", "Medium", "Large", "Huge", "Gigantic", "Colossal", "Titanic", "Massive", "Enormous",
  "Miniature", "Compact", "Regular", "Oversized", "Jumbo", "Super", "Ultra", "Mega", "Giga", "Tera",
  
  // Mystical Sizes
  "Pocket-sized", "Room-sized", "House-sized", "Mountain-sized", "Planet-sized", "Star-sized", "Galaxy-sized",
  "Universe-sized", "Multiverse-sized", "Dimensional", "Quantum", "Subatomic", "Microscopic", "Macroscopic",
  "Interdimensional", "Transdimensional", "Extradimensional", "Hyperdimensional", "Omnidimensional",
  
  // Relative Sizes
  "Whisper-tiny", "Breath-small", "Heartbeat-medium", "Embrace-large", "Dream-huge", "Memory-vast",
  "Soul-infinite", "Spirit-boundless", "Essence-eternal", "Aura-expanding", "Energy-flowing", "Power-surging",
  
  // Conceptual Sizes
  "Thought-size", "Emotion-size", "Idea-size", "Concept-size", "Reality-size", "Truth-size", "Wisdom-size",
  "Knowledge-size", "Understanding-size", "Awareness-size", "Consciousness-size", "Existence-size",
  
  // Temporal Sizes
  "Moment-brief", "Second-quick", "Minute-short", "Hour-long", "Day-extended", "Year-lasting", "Decade-enduring",
  "Century-ancient", "Millennium-timeless", "Eon-eternal", "Epoch-infinite", "Era-boundless"
];

const CREATURE_TYPES = [
  // Mythical Creatures
  "Dragon", "Phoenix", "Unicorn", "Griffin", "Pegasus", "Chimera", "Sphinx", "Hydra", "Kraken", "Leviathan",
  "Basilisk", "Wyvern", "Drake", "Wyrm", "Salamander", "Thunderbird", "Roc", "Hippogriff", "Manticore", "Banshee",
  
  // Elemental Beings
  "Fire Elemental", "Water Elemental", "Earth Elemental", "Air Elemental", "Ice Elemental", "Lightning Elemental",
  "Shadow Elemental", "Light Elemental", "Nature Elemental", "Metal Elemental", "Crystal Elemental", "Plasma Elemental",
  
  // Celestial Entities
  "Star Guardian", "Moon Spirit", "Sun Deity", "Comet Rider", "Nebula Dancer", "Galaxy Keeper", "Cosmic Entity",
  "Astral Being", "Celestial Warrior", "Divine Messenger", "Angelic Guardian", "Seraph", "Cherub", "Archangel",
  
  // Nature Spirits
  "Forest Guardian", "Ocean Protector", "Mountain Lord", "Desert Wanderer", "Jungle Stalker", "Prairie Runner",
  "Tundra Survivor", "Swamp Dweller", "Cave Dweller", "Sky Dancer", "Wind Walker", "Earth Shaker", "Tree Spirit",
  
  // Mystical Animals
  "Crystal Wolf", "Shadow Cat", "Spirit Fox", "Phantom Deer", "Ethereal Eagle", "Mystic Bear", "Astral Tiger",
  "Cosmic Whale", "Dimensional Shark", "Quantum Butterfly", "Temporal Turtle", "Infinity Snake", "Void Raven",
  
  // Artificial Beings
  "Golem", "Automaton", "Construct", "Mechanical Beast", "Cyber Creature", "Digital Entity", "Virtual Being",
  "Holographic Guardian", "Energy Form", "Plasma Creature", "Electromagnetic Entity", "Quantum Computer"
];

const ELEMENTS = [
  // Classical Elements
  "Fire", "Water", "Earth", "Air", "Ice", "Lightning", "Nature", "Metal", "Light", "Dark",
  "Shadow", "Spirit", "Energy", "Void", "Crystal", "Magma", "Steam", "Mud", "Sand", "Plasma",
  
  // Exotic Elements
  "Cosmic", "Astral", "Ethereal", "Spectral", "Temporal", "Dimensional", "Quantum", "Digital", "Virtual", "Psychic",
  "Sonic", "Gravity", "Magnetic", "Radioactive", "Atomic", "Nuclear", "Photonic", "Neutrino", "Antimatter", "Dark Matter",
  
  // Mystical Elements
  "Arcane", "Divine", "Infernal", "Celestial", "Abyssal", "Primordial", "Chaos", "Order", "Balance", "Harmony",
  "Discord", "Creation", "Destruction", "Life", "Death", "Time", "Space", "Reality", "Dream", "Nightmare",
  
  // Emotional Elements
  "Joy", "Sorrow", "Love", "Hate", "Hope", "Despair", "Courage", "Fear", "Anger", "Peace", "Wisdom", "Folly"
];

const RARITIES = [
  { name: "Common", weight: 6000 },
  { name: "Uncommon", weight: 2500 },
  { name: "Rare", weight: 1200 },
  { name: "Epic", weight: 300 },
  { name: "Legendary", weight: 90 },
  { name: "Mythical", weight: 9 },
  { name: "Transcendent", weight: 1 }
];

const PERSONALITIES = [
  // Basic Traits
  "Brave", "Timid", "Curious", "Lazy", "Energetic", "Calm", "Aggressive", "Peaceful", "Intelligent", "Simple",
  "Wise", "Foolish", "Kind", "Mean", "Loyal", "Treacherous", "Honest", "Deceptive", "Patient", "Impatient",
  
  // Complex Personalities
  "Galactic Explorer", "Quantum Thinker", "Ancient Sage", "Playful Trickster", "Noble Guardian", "Mysterious Wanderer",
  "Cosmic Philosopher", "Dimensional Scholar", "Temporal Historian", "Reality Theorist", "Dream Weaver", "Nightmare Walker",
  
  // Emotional Personalities
  "Joyful Spirit", "Melancholy Soul", "Passionate Heart", "Cold Logic", "Warm Embrace", "Distant Observer",
  "Empathetic Helper", "Stoic Warrior", "Cheerful Companion", "Brooding Loner", "Social Butterfly", "Hermit Monk",
  
  // Mystical Personalities
  "Oracle Seer", "Prophet Voice", "Divine Messenger", "Infernal Tempter", "Celestial Guide", "Abyssal Whisperer",
  "Primordial Ancient", "Chaos Bringer", "Order Keeper", "Balance Seeker", "Harmony Singer", "Discord Dancer"
];

const SPECIAL_FEATURES = [
  // Physical Features
  "Glowing Eyes", "Crystal Horns", "Metallic Scales", "Feathered Wings", "Ethereal Tail", "Diamond Claws",
  "Rainbow Mane", "Star Patterns", "Cosmic Swirls", "Energy Aura", "Shadow Form", "Light Emanation",
  "Elemental Breath", "Mystic Runes", "Ancient Symbols", "Floating Orbs", "Dimensional Rifts", "Time Distortion",
  
  // Magical Abilities
  "Telepathy", "Telekinesis", "Precognition", "Time Travel", "Dimension Hopping", "Reality Warping",
  "Matter Manipulation", "Energy Control", "Gravity Defiance", "Invisibility", "Intangibility", "Regeneration",
  "Immortality", "Shapeshifting", "Size Alteration", "Duplication", "Fusion", "Fission", "Phase Shift",
  
  // Mystical Powers
  "Soul Reading", "Memory Access", "Dream Walking", "Nightmare Creation", "Illusion Casting", "Mind Control",
  "Emotion Manipulation", "Fear Inducement", "Hope Inspiration", "Luck Alteration", "Fate Weaving", "Destiny Control",
  
  // Cosmic Abilities
  "Star Creation", "Planet Formation", "Galaxy Spinning", "Universe Expansion", "Black Hole Generation",
  "White Hole Opening", "Wormhole Creation", "Time Loop Formation", "Paradox Resolution", "Causality Manipulation",
  
  // Elemental Mastery
  "Fire Storm", "Ice Age", "Lightning Strike", "Earth Quake", "Wind Hurricane", "Water Tsunami", "Metal Storm",
  "Crystal Growth", "Shadow Tendrils", "Light Beams", "Void Consumption", "Plasma Burst", "Energy Wave"
];

const HABITATS = [
  // Natural Environments
  "Enchanted Forest", "Crystal Caves", "Floating Islands", "Mystic Mountains", "Starlight Beach", "Aurora Plains",
  "Nebula Gardens", "Cosmic Reef", "Dimensional Valleys", "Temporal Meadows", "Quantum Fields", "Astral Peaks",
  
  // Elemental Realms
  "Fire Realm", "Ice Kingdom", "Earth Domain", "Sky Territory", "Lightning Lands", "Water World", "Metal City",
  "Crystal Palace", "Shadow Dimension", "Light Sanctuary", "Void Space", "Energy Core", "Plasma Zone",
  
  // Mystical Locations
  "Ancient Ruins", "Lost Civilization", "Forgotten Temple", "Sacred Grove", "Blessed Spring", "Cursed Swamp",
  "Haunted Manor", "Spectral Library", "Arcane Academy", "Divine Cathedral", "Infernal Pit", "Celestial Throne"
];

const ABILITIES = [
  // Combat Abilities
  "Fireball", "Ice Shard", "Lightning Bolt", "Earth Spike", "Wind Blade", "Water Whip", "Metal Strike", "Crystal Beam",
  "Shadow Slash", "Light Ray", "Void Drain", "Energy Blast", "Plasma Cannon", "Sonic Boom", "Gravity Crush", "Time Stop",
  
  // Defensive Abilities
  "Fire Shield", "Ice Armor", "Lightning Barrier", "Earth Wall", "Wind Deflection", "Water Healing", "Metal Skin",
  "Crystal Protection", "Shadow Cloak", "Light Blessing", "Void Immunity", "Energy Regeneration", "Plasma Field",
  
  // Utility Abilities
  "Teleportation", "Levitation", "Invisibility", "Intangibility", "Shapeshifting", "Size Change", "Duplication",
  "Fusion", "Mind Reading", "Future Sight", "Past Vision", "Dream Entry", "Illusion Creation", "Reality Alter",
  
  // Ultimate Abilities
  "Cosmic Ray Burst", "Galactic Storm", "Universal Reset", "Reality Rewrite", "Time Reversal", "Space Fold",
  "Dimension Break", "Multiverse Creation", "Existence Erasure", "Life Genesis", "Death Transcendence", "Infinity Loop"
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
  
  // Generate special features (more for rarer pets)
  const specialFeatures: string[] = [];
  const featureCount = rarity === "Common" ? 1 : 
                      rarity === "Uncommon" ? 2 :
                      rarity === "Rare" ? 3 :
                      rarity === "Epic" ? 5 :
                      rarity === "Legendary" ? 8 :
                      rarity === "Mythical" ? 12 : 20;
  
  for (let i = 0; i < featureCount; i++) {
    const featureIndex = hashToNumber(hash, 7 + i, SPECIAL_FEATURES.length);
    const feature = SPECIAL_FEATURES[featureIndex];
    if (!specialFeatures.includes(feature)) {
      specialFeatures.push(feature);
    }
  }
  
  // Generate abilities
  const abilities: string[] = [];
  const abilityCount = Math.min(featureCount + 2, 12);
  for (let i = 0; i < abilityCount; i++) {
    const abilityIndex = hashToNumber(hash, 15 + i, ABILITIES.length);
    const ability = ABILITIES[abilityIndex];
    if (!abilities.includes(ability)) {
      abilities.push(ability);
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