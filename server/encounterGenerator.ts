import crypto from 'crypto';

// Comprehensive attribute arrays for maximum randomization
export const COLORS = [
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

export const SIZES = [
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

export const CREATURE_TYPES = [
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

export const ELEMENTS = [
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

export const RARITIES = [
  { name: "Common", weight: 6000 },
  { name: "Uncommon", weight: 2500 },
  { name: "Rare", weight: 1200 },
  { name: "Epic", weight: 300 },
  { name: "Legendary", weight: 90 },
  { name: "Mythical", weight: 9 },
  { name: "Transcendent", weight: 1 }
];

export const SPECIAL_FEATURES = [
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

export const ENVIRONMENTS = [
  // Natural Environments
  "Enchanted Forest", "Crystal Caves", "Floating Islands", "Mystic Mountains", "Starlight Beach", "Aurora Plains",
  "Nebula Gardens", "Cosmic Reef", "Dimensional Valleys", "Temporal Meadows", "Quantum Fields", "Astral Peaks",
  
  // Elemental Realms
  "Fire Realm", "Ice Kingdom", "Earth Domain", "Sky Territory", "Lightning Lands", "Water World", "Metal City",
  "Crystal Palace", "Shadow Dimension", "Light Sanctuary", "Void Space", "Energy Core", "Plasma Zone",
  
  // Mystical Locations
  "Ancient Ruins", "Lost Civilization", "Forgotten Temple", "Sacred Grove", "Blessed Spring", "Cursed Swamp",
  "Haunted Manor", "Spectral Library", "Arcane Academy", "Divine Cathedral", "Infernal Pit", "Celestial Throne",
  
  // Cosmic Settings
  "Star Nursery", "Planet Core", "Moon Base", "Solar System", "Galaxy Center", "Universe Edge", "Multiverse Hub",
  "Reality Nexus", "Time Stream", "Space Fold", "Dimension Gate", "Portal Network", "Wormhole Junction"
];

export const PERSONALITIES = [
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

export const ABILITIES = [
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

export async function generateRandomEncounter(environment: string, sha256Hash?: string): Promise<any> {
  const hash = sha256Hash || crypto.randomBytes(32).toString('hex');
  
  // Use hash for deterministic generation
  const colorIndex = hashToNumber(hash, 0, COLORS.length);
  const sizeIndex = hashToNumber(hash, 1, SIZES.length);
  const typeIndex = hashToNumber(hash, 2, CREATURE_TYPES.length);
  const elementIndex = hashToNumber(hash, 3, ELEMENTS.length);
  const personalityIndex = hashToNumber(hash, 4, PERSONALITIES.length);
  
  // Generate rarity based on hash
  const rarityValue = hashToNumber(hash, 5, 10000);
  let rarity = "Common";
  let cumulativeWeight = 0;
  for (const r of RARITIES) {
    cumulativeWeight += r.weight;
    if (rarityValue < cumulativeWeight) {
      rarity = r.name;
      break;
    }
  }
  
  // Generate special features (more for rarer creatures)
  const specialFeatures: string[] = [];
  const featureCount = rarity === "Common" ? 1 : 
                      rarity === "Uncommon" ? 2 :
                      rarity === "Rare" ? 3 :
                      rarity === "Epic" ? 4 :
                      rarity === "Legendary" ? 5 :
                      rarity === "Mythical" ? 7 : 10;
  
  for (let i = 0; i < featureCount; i++) {
    const featureIndex = hashToNumber(hash, 6 + i, SPECIAL_FEATURES.length);
    const feature = SPECIAL_FEATURES[featureIndex];
    if (!specialFeatures.includes(feature)) {
      specialFeatures.push(feature);
    }
  }
  
  // Generate abilities (more for rarer creatures)
  const abilities: string[] = [];
  const abilityCount = Math.min(featureCount + 2, 8);
  for (let i = 0; i < abilityCount; i++) {
    const abilityIndex = hashToNumber(hash, 10 + i, ABILITIES.length);
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
  
  return {
    sha256Hash: hash,
    name: `${PERSONALITIES[personalityIndex]} ${CREATURE_TYPES[typeIndex]}`,
    type: "creature",
    category: CREATURE_TYPES[typeIndex],
    rarity,
    environment,
    color: COLORS[colorIndex],
    size: SIZES[sizeIndex],
    element: ELEMENTS[elementIndex],
    health: base + Math.floor(Math.random() * variance),
    attack: base + Math.floor(Math.random() * variance),
    defense: base + Math.floor(Math.random() * variance),
    speed: base + Math.floor(Math.random() * variance),
    intelligence: base + Math.floor(Math.random() * variance),
    abilities,
    specialFeatures,
    behaviorTraits: [PERSONALITIES[personalityIndex]],
    captureRate: Math.max(5, 80 - (baseStats[rarity as keyof typeof baseStats] || 30)),
    experienceReward: (baseStats[rarity as keyof typeof baseStats] || 30) * 2,
    description: `A ${rarity.toLowerCase()} ${CREATURE_TYPES[typeIndex].toLowerCase()} with ${COLORS[colorIndex].toLowerCase()} coloring and ${PERSONALITIES[personalityIndex].toLowerCase()} personality. This magnificent creature embodies the power of ${ELEMENTS[elementIndex].toLowerCase()} and possesses extraordinary abilities that make it truly unique.`
  };
}

export function generateRandomItem(environment: string, sha256Hash?: string): any {
  const hash = sha256Hash || crypto.randomBytes(32).toString('hex');
  
  // Comprehensive equipment slots and item categories
  const EQUIPMENT_SLOTS = [
    { name: "Weapon", weight: 180 },
    { name: "Helmet", weight: 85 },
    { name: "Chestplate", weight: 85 },
    { name: "Leggings", weight: 85 },
    { name: "Boots", weight: 85 },
    { name: "Gloves", weight: 85 },
    { name: "Shield", weight: 75 },
    { name: "Ring", weight: 60 },
    { name: "Necklace", weight: 60 },
    { name: "Belt", weight: 55 },
    { name: "Cape", weight: 50 },
    { name: "Earring", weight: 45 },
    { name: "Bracelet", weight: 45 },
    { name: "Currency", weight: 250 },
    { name: "Consumable", weight: 200 },
    { name: "Material", weight: 150 },
    { name: "Gem", weight: 100 },
    { name: "Pet Food", weight: 120 },
    { name: "Tool", weight: 80 },
    { name: "Scroll", weight: 90 }
  ];

  // Comprehensive materials system
  const MATERIALS = [
    "Iron", "Steel", "Mythril", "Adamantite", "Dragon Scale", "Phoenix Feather",
    "Void Steel", "Crystal", "Ethereal", "Shadow", "Light", "Ancient",
    "Blessed", "Cursed", "Enchanted", "Runic", "Celestial", "Infernal",
    "Frozen", "Burning", "Electric", "Poison", "Divine", "Demonic",
    "Astral", "Spectral", "Temporal", "Quantum", "Prismatic", "Radiant",
    "Obsidian", "Moonstone", "Sunstone", "Starlight", "Voidstone", "Dreamweave"
  ];

  const PREFIXES = [
    "Alpha", "Beta", "Gamma", "Delta", "Omega", "Prime", "Ultra", "Mega",
    "Super", "Hyper", "Neo", "Proto", "Meta", "Arch", "Elder", "Greater",
    "Lesser", "Minor", "Major", "Supreme", "Ultimate", "Final", "First",
    "Last", "True", "False", "Pure", "Tainted", "Wild", "Refined",
    "Perfect", "Flawed", "Ancient", "Modern", "Eternal", "Temporal"
  ];

  const WEAPON_TYPES = [
    "Sword", "Blade", "Staff", "Rod", "Bow", "Crossbow", "Dagger", "Knife",
    "Axe", "Hatchet", "Mace", "Hammer", "Spear", "Lance", "Wand", "Orb",
    "Scythe", "Whip", "Flail", "Katana", "Rapier", "Claymore", "Saber",
    "Greatsword", "Shortsword", "Longbow", "Shortbow", "Battleaxe", "Warhammer"
  ];

  const EFFECT_TYPES = [
    "Healing", "Power Boost", "Speed Enhancement", "Defense Increase", 
    "Magic Amplification", "Luck Improvement", "Experience Gain", "Critical Strike",
    "Fire Damage", "Ice Damage", "Lightning Damage", "Poison Damage",
    "Light Damage", "Shadow Damage", "Mana Regeneration", "Health Regeneration",
    "Damage Reduction", "Spell Resistance", "Physical Resistance", "Elemental Resistance"
  ];
  
  const slotType = getRandomByWeight(EQUIPMENT_SLOTS);
  const materialIndex = hashToNumber(hash, 0, MATERIALS.length);
  const colorIndex = hashToNumber(hash, 1, COLORS.length);
  const prefixIndex = hashToNumber(hash, 2, PREFIXES.length);
  const effectIndex = hashToNumber(hash, 3, EFFECT_TYPES.length);
  
  // Generate rarity using SHA-256 hash
  const rarityValue = hashToNumber(hash, 4, 10000);
  let rarity = "Common";
  let cumulativeWeight = 0;
  for (const r of RARITIES) {
    cumulativeWeight += r.weight;
    if (rarityValue < cumulativeWeight) {
      rarity = r.name;
      break;
    }
  }

  let itemName = "";
  let description = "";
  let value = 10;
  let stats: any = {};

  const material = MATERIALS[materialIndex];
  const color = COLORS[colorIndex];
  const prefix = PREFIXES[prefixIndex];
  const effect = EFFECT_TYPES[effectIndex];

  // Generate comprehensive stats based on rarity
  const rarityMultiplier = rarity === "Common" ? 1 : rarity === "Uncommon" ? 1.5 : 
                          rarity === "Rare" ? 2.5 : rarity === "Epic" ? 4 : 
                          rarity === "Legendary" ? 6.5 : rarity === "Mythical" ? 10 : 15;

  switch (slotType) {
    case "Weapon":
      const weaponType = WEAPON_TYPES[hashToNumber(hash, 5, WEAPON_TYPES.length)];
      itemName = `${prefix} ${color} ${material} ${weaponType}`;
      description = `A ${rarity.toLowerCase()} ${weaponType.toLowerCase()} forged from ${material.toLowerCase()} with ${effect.toLowerCase()} properties.`;
      value = Math.floor(50 * rarityMultiplier + hashToNumber(hash, 6, 100));
      stats = {
        attack: Math.floor((5 + hashToNumber(hash, 7, 15)) * rarityMultiplier),
        durability: 50 + hashToNumber(hash, 8, 50),
        criticalChance: hashToNumber(hash, 9, 20),
        effectPower: Math.floor(rarityMultiplier * 10)
      };
      break;
      
    case "Helmet":
    case "Chestplate":
    case "Leggings":
    case "Boots":
    case "Gloves":
    case "Shield":
      itemName = `${prefix} ${color} ${material} ${slotType}`;
      description = `Protective ${slotType.toLowerCase()} crafted from ${material.toLowerCase()} with ${effect.toLowerCase()} enchantments.`;
      value = Math.floor(40 * rarityMultiplier + hashToNumber(hash, 6, 80));
      stats = {
        defense: Math.floor((3 + hashToNumber(hash, 7, 12)) * rarityMultiplier),
        durability: 50 + hashToNumber(hash, 8, 50),
        resistance: hashToNumber(hash, 9, 25),
        effectPower: Math.floor(rarityMultiplier * 8)
      };
      break;
      
    case "Ring":
    case "Necklace":
    case "Belt":
    case "Cape":
    case "Earring":
    case "Bracelet":
      itemName = `${prefix} ${color} ${material} ${slotType}`;
      description = `An ornate ${slotType.toLowerCase()} made from ${material.toLowerCase()} with ${effect.toLowerCase()} magical properties.`;
      value = Math.floor(60 * rarityMultiplier + hashToNumber(hash, 6, 120));
      stats = {
        magicPower: Math.floor((2 + hashToNumber(hash, 7, 8)) * rarityMultiplier),
        luck: hashToNumber(hash, 8, 15),
        experience: hashToNumber(hash, 9, 10),
        effectPower: Math.floor(rarityMultiplier * 12)
      };
      break;
      
    case "Currency":
      const currencies = ["Gold Coins", "Silver Coins", "Platinum Coins", "Ancient Tokens", "Gems", "Crystals"];
      const currency = currencies[hashToNumber(hash, 5, currencies.length)];
      const amount = Math.floor((10 + hashToNumber(hash, 6, 190)) * rarityMultiplier);
      itemName = `${amount} ${currency}`;
      description = `A valuable collection of ${currency.toLowerCase()}.`;
      value = amount * (currency === "Gold Coins" ? 1 : currency === "Silver Coins" ? 0.1 : 
                       currency === "Platinum Coins" ? 10 : currency === "Gems" ? 5 : 15);
      break;
      
    case "Pet Food":
      const foodTypes = ["Premium Kibble", "Magical Treats", "Energy Biscuits", "Health Snacks", "Happiness Cookies", "Power Pellets"];
      const foodType = foodTypes[hashToNumber(hash, 5, foodTypes.length)];
      const quality = rarity === "Common" ? "Basic" : rarity === "Uncommon" ? "Quality" : 
                     rarity === "Rare" ? "Premium" : rarity === "Epic" ? "Gourmet" : "Divine";
      itemName = `${quality} ${foodType}`;
      description = `${quality} pet food that provides ${effect.toLowerCase()} benefits.`;
      value = Math.floor(15 * rarityMultiplier);
      stats = {
        healthBoost: Math.floor((5 + hashToNumber(hash, 7, 25)) * rarityMultiplier),
        happinessBoost: Math.floor((5 + hashToNumber(hash, 8, 20)) * rarityMultiplier),
        energyBoost: Math.floor((5 + hashToNumber(hash, 9, 15)) * rarityMultiplier)
      };
      break;
      
    default:
      itemName = `${prefix} ${color} ${slotType}`;
      description = `A ${rarity.toLowerCase()} ${slotType.toLowerCase()} with ${effect.toLowerCase()} properties.`;
      value = Math.floor(25 * rarityMultiplier + hashToNumber(hash, 6, 50));
      stats = {
        power: Math.floor(rarityMultiplier * 5),
        effectPower: Math.floor(rarityMultiplier * 10)
      };
  }
  
  return {
    sha256Hash: hash,
    name: itemName,
    type: "item",
    category: slotType,
    rarity,
    environment,
    color,
    material,
    prefix,
    effect,
    value,
    stats,
    abilities: [effect],
    specialFeatures: [`${effect} Properties`, `${material} Composition`],
    captureRate: 90,
    experienceReward: Math.floor(5 * rarityMultiplier),
    description,
    generatedAt: new Date().toISOString(),
    durability: stats.durability || 100
  };
}