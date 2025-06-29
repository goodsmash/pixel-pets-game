import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Enhanced exploration with millions of possibilities
export const ENHANCED_ENVIRONMENTS = [
  "mystical_forest", "crystal_caves", "floating_islands", "underwater_temple", 
  "volcanic_realm", "ice_citadel", "shadow_dimension", "light_sanctuary",
  "temporal_nexus", "dream_realm", "astral_plane", "elemental_chaos",
  "ancient_ruins", "sky_gardens", "deep_abyss", "cosmic_observatory",
  "spirit_woods", "mirror_lake", "wind_peaks", "earth_core",
  "fire_mountains", "water_falls", "thunder_plains", "void_space"
];

export const ENCOUNTER_ARCHETYPES = [
  "legendary_guardian", "ancient_spirit", "elemental_lord", "time_traveler",
  "cosmic_entity", "dream_weaver", "shadow_stalker", "light_bearer",
  "void_walker", "star_caller", "earth_shaper", "storm_rider",
  "flame_dancer", "wave_master", "wind_whisperer", "crystal_singer",
  "nature_herald", "chaos_spawn", "order_keeper", "reality_bender"
];

export const MYSTICAL_ARTIFACTS = [
  "shard_of_eternity", "crystal_of_power", "orb_of_wisdom", "stone_of_courage",
  "gem_of_healing", "rune_of_strength", "amulet_of_protection", "ring_of_speed",
  "crown_of_intelligence", "cloak_of_stealth", "boots_of_flying", "gloves_of_might",
  "pendant_of_luck", "bracelet_of_fortune", "necklace_of_charm", "earrings_of_perception",
  "belt_of_endurance", "sword_of_legends", "staff_of_mysteries", "bow_of_precision"
];

export const RARE_MATERIALS = [
  "stardust", "moonstone", "suncrystal", "voidessence", "timeflux", "dreamsilk",
  "shadowmetal", "lightcore", "spiritgem", "chaosorb", "orderstone", "lifeshard",
  "deathrune", "magicpowder", "elementalgem", "cosmicdust", "astralfiber", 
  "quantumparticle", "eternitystone", "infinitycrystal"
];

function hashToNumber(hash: string, index: number, max: number): number {
  const slice = hash.slice(index * 2, (index * 2) + 8);
  const num = parseInt(slice, 16);
  return num % max;
}

export async function generateEnhancedEncounter(environment: string, userId: string): Promise<any> {
  const timestamp = Date.now().toString();
  const hash = crypto.createHash('sha256').update(userId + timestamp + environment).digest('hex');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Select random archetype and artifacts
    const archetypeIndex = hashToNumber(hash, 0, ENCOUNTER_ARCHETYPES.length);
    const environmentIndex = hashToNumber(hash, 1, ENHANCED_ENVIRONMENTS.length);
    const artifactIndex = hashToNumber(hash, 2, MYSTICAL_ARTIFACTS.length);
    const materialIndex = hashToNumber(hash, 3, RARE_MATERIALS.length);
    
    const archetype = ENCOUNTER_ARCHETYPES[archetypeIndex];
    const enhancedEnv = ENHANCED_ENVIRONMENTS[environmentIndex];
    const artifact = MYSTICAL_ARTIFACTS[artifactIndex];
    const material = RARE_MATERIALS[materialIndex];
    
    // Determine encounter complexity
    const complexityRoll = hashToNumber(hash, 4, 100);
    const complexity = complexityRoll < 20 ? "simple" :
                      complexityRoll < 50 ? "moderate" :
                      complexityRoll < 80 ? "complex" : "legendary";
    
    const prompt = `Create an EPIC, COMPLEX exploration story for a pixel pet adventure game with rich narrative depth.

STORY PARAMETERS:
- Environment: ${enhancedEnv} (original: ${environment})
- Creature Archetype: ${archetype}
- Featured Artifact: ${artifact}
- Rare Material: ${material}
- Complexity Level: ${complexity}

CREATE A COMPELLING MULTI-CHAPTER STORY with:

CHAPTER 1 - DISCOVERY:
Write a dramatic opening (4-5 sentences) describing how your pet discovers this mysterious location. Include sensory details, atmospheric tension, and foreshadowing of the encounter ahead.

CHAPTER 2 - THE ENCOUNTER:
Develop a complex creature encounter with:
- Detailed backstory explaining why this creature is here
- Multiple personality layers and motivations
- Environmental storytelling through the setting
- Interactive dialogue or communication attempts
- Escalating tension with multiple decision points

CHAPTER 3 - THE CHALLENGE:
Create branching story paths with:
- 4-6 meaningful choices that affect the narrative
- Each choice leading to different story outcomes
- Consequences that feel impactful and memorable
- Risk/reward scenarios that test strategy
- Character development opportunities for your pet

CHAPTER 4 - RESOLUTION:
Provide satisfying conclusions with:
- Multiple possible endings based on choices made
- Meaningful rewards that tie to the story
- Lore revelations that expand the world
- Character growth moments for your pet
- Setup for future adventures

WORLD-BUILDING REQUIREMENTS:
- Rich environmental descriptions that paint vivid mental images
- Deep creature lore connecting to larger world mythology
- Ancient histories and forgotten civilizations
- Mystical forces and magical phenomena explanations
- Cultural details about creature societies and customs

EMOTIONAL DEPTH:
- Moments of wonder, fear, excitement, and triumph
- Relationship building between pet and encountered beings
- Moral dilemmas that require thoughtful consideration
- Character motivation exploration
- Themes of friendship, courage, wisdom, and growth

Format as comprehensive JSON:
{
  "title": "Epic Multi-Chapter Story Title",
  "opening_discovery": "Chapter 1 narrative (4-5 detailed sentences)",
  "main_story": "Chapter 2 complex encounter story (8-10 sentences)",
  "challenge_description": "Chapter 3 branching challenge narrative",
  "resolution_possibilities": ["Multiple possible endings"],
  "complexity": "${complexity}",
  "creature": {
    "name": "Memorable Character Name",
    "archetype": "${archetype}",
    "backstory": "Deep character history and motivations",
    "personality_traits": ["complex personality aspects"],
    "appearance": "Vivid visual description with artistic details",
    "cultural_background": "Society and customs information",
    "abilities": ["unique powers with story explanations"],
    "stats": {
      "health": number,
      "attack": number,
      "defense": number,
      "speed": number,
      "intelligence": number,
      "magic": number,
      "charisma": number,
      "wisdom": number
    },
    "element": "primary_element",
    "rarity": "encounter_rarity",
    "dialogue_samples": ["Example creature speech or communication"]
  },
  "environment": {
    "name": "${enhancedEnv}",
    "detailed_description": "Rich environmental storytelling",
    "ancient_history": "Historical significance of this location",
    "mystical_properties": "Magical aspects and phenomena",
    "hidden_secrets": ["Environmental mysteries to discover"],
    "atmospheric_details": ["Sensory descriptions"],
    "hazards": ["Environmental challenges with story context"],
    "bonuses": ["Environmental advantages with explanations"]
  },
  "story_choices": [
    {
      "chapter": "Discovery/Encounter/Challenge",
      "choice_point": "Narrative moment requiring decision",
      "options": [
        {
          "action": "Detailed choice description",
          "difficulty": "easy/medium/hard/legendary",
          "story_outcome": "Rich narrative consequence",
          "character_impact": "How this affects your pet's development",
          "world_impact": "How this affects the larger story world",
          "rewards": "Story-appropriate compensation"
        }
      ]
    }
  ],
  "rewards": {
    "experience": number,
    "coins": number,
    "story_items": [
      {
        "name": "Narrative-significant item name",
        "type": "equipment/consumable/material/artifact/relic",
        "rarity": "item_rarity",
        "story_significance": "Why this item matters to the narrative",
        "description": "Rich item lore and appearance",
        "effects": ["Mechanical and story effects"],
        "origin_story": "How this item came to exist"
      }
    ],
    "artifacts": ["${artifact}"],
    "materials": ["${material}"],
    "knowledge_gained": ["Lore revelations and world secrets"],
    "relationships": ["New allies, rivals, or neutral contacts"]
  },
  "world_lore": {
    "ancient_history": "Deep backstory connecting to larger world",
    "mythological_significance": "Religious or cultural importance", 
    "prophecies_legends": "Relevant myths and predictions",
    "connected_locations": "Other places in the world this relates to",
    "ongoing_mysteries": "Unresolved questions for future exploration"
  },
  "emotional_moments": [
    {
      "moment_type": "wonder/fear/triumph/friendship/discovery",
      "description": "Detailed emotional beat in the story",
      "pet_growth": "How this develops your pet's character"
    }
  ],
  "future_hooks": ["Story threads that could lead to future adventures"]
}

Make this an UNFORGETTABLE narrative experience that feels like reading an epic fantasy novel where YOUR PET is the hero!`;

    const result = await model.generateContent(prompt);
    const geminiResponse = result.response.text();
    
    // Parse Gemini response
    let encounter;
    try {
      encounter = JSON.parse(geminiResponse.replace(/```json\n?|\n?```/g, ''));
    } catch (parseError) {
      console.log("Using enhanced fallback for parsing error");
      encounter = createFallbackEncounter(archetype, enhancedEnv, artifact, material, complexity, hash);
    }
    
    // Add hash and metadata
    encounter.hash = hash;
    encounter.timestamp = timestamp;
    encounter.originalEnvironment = environment;
    encounter.generationType = "gemini_enhanced";
    
    return encounter;
    
  } catch (error) {
    console.error("Gemini encounter generation failed:", error);
    
    // Sophisticated fallback system
    const archetype = ENCOUNTER_ARCHETYPES[hashToNumber(hash, 0, ENCOUNTER_ARCHETYPES.length)];
    const enhancedEnv = ENHANCED_ENVIRONMENTS[hashToNumber(hash, 1, ENHANCED_ENVIRONMENTS.length)];
    const artifact = MYSTICAL_ARTIFACTS[hashToNumber(hash, 2, MYSTICAL_ARTIFACTS.length)];
    const material = RARE_MATERIALS[hashToNumber(hash, 3, RARE_MATERIALS.length)];
    const complexity = hashToNumber(hash, 4, 100) < 50 ? "moderate" : "complex";
    
    return createFallbackEncounter(archetype, enhancedEnv, artifact, material, complexity, hash);
  }
}

function createFallbackEncounter(archetype: string, environment: string, artifact: string, material: string, complexity: string, hash: string): any {
  const baseStats = {
    simple: { min: 30, max: 60 },
    moderate: { min: 50, max: 90 },
    complex: { min: 80, max: 120 },
    legendary: { min: 100, max: 150 }
  };
  
  const stats = baseStats[complexity as keyof typeof baseStats] || baseStats.moderate;
  
  const rewardScale = {
    simple: { exp: [10, 30], coins: [5, 15], items: 2 },
    moderate: { exp: [25, 50], coins: [15, 30], items: 3 },
    complex: { exp: [40, 80], coins: [25, 50], items: 4 },
    legendary: { exp: [70, 150], coins: [40, 100], items: 6 }
  };
  
  const rewards = rewardScale[complexity as keyof typeof rewardScale] || rewardScale.moderate;
  
  return {
    title: `${complexity.charAt(0).toUpperCase() + complexity.slice(1)} ${archetype.replace(/_/g, ' ')} Encounter`,
    description: `Deep within the ${environment.replace(/_/g, ' ')}, you encounter a powerful ${archetype.replace(/_/g, ' ')} guarding ancient secrets. The air crackles with mystical energy as the creature reveals the legendary ${artifact.replace(/_/g, ' ')} surrounded by pure ${material}.`,
    complexity,
    creature: {
      name: `${archetype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} of ${environment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      archetype,
      appearance: `A majestic being wreathed in ${material} energy, with eyes that reflect the depths of ${environment.replace(/_/g, ' ')}`,
      abilities: [
        `${archetype.split('_')[0]} mastery`,
        `${environment.split('_')[0]} control`,
        `${artifact.split('_')[0]} manipulation`,
        "reality distortion",
        "elemental fusion"
      ],
      stats: {
        health: stats.min + hashToNumber(hash, 5, stats.max - stats.min),
        attack: stats.min + hashToNumber(hash, 6, stats.max - stats.min),
        defense: stats.min + hashToNumber(hash, 7, stats.max - stats.min),
        speed: stats.min + hashToNumber(hash, 8, stats.max - stats.min),
        intelligence: stats.min + hashToNumber(hash, 9, stats.max - stats.min),
        magic: stats.min + hashToNumber(hash, 10, stats.max - stats.min)
      },
      element: environment.split('_')[0],
      rarity: complexity === "legendary" ? "mythical" : complexity === "complex" ? "epic" : "rare"
    },
    environment: {
      name: environment,
      hazards: [`${environment.split('_')[0]} storms`, "energy fluctuations"],
      bonuses: [`${material} enhancement`, "mystical amplification"],
      atmosphere: `The ${environment.replace(/_/g, ' ')} pulses with ancient power and hidden mysteries`
    },
    choices: [
      {
        option: "Challenge the guardian to honorable combat",
        difficulty: "hard",
        outcome: "Epic battle with maximum rewards if victorious",
        rewards: "Full experience and rare items"
      },
      {
        option: "Attempt to negotiate and prove worthiness",
        difficulty: "medium", 
        outcome: "Diplomatic solution with balanced rewards",
        rewards: "Moderate experience and unique items"
      },
      {
        option: "Study the creature and environment carefully",
        difficulty: "easy",
        outcome: "Knowledge gained with safe observation",
        rewards: "Information and basic materials"
      }
    ],
    rewards: {
      experience: rewards.exp[0] + hashToNumber(hash, 11, rewards.exp[1] - rewards.exp[0]),
      coins: rewards.coins[0] + hashToNumber(hash, 12, rewards.coins[1] - rewards.coins[0]),
      items: Array.from({ length: rewards.items }, (_, i) => ({
        name: `Enhanced ${MYSTICAL_ARTIFACTS[hashToNumber(hash, 13 + i, MYSTICAL_ARTIFACTS.length)].replace(/_/g, ' ')}`,
        type: ["equipment", "consumable", "material"][hashToNumber(hash, 20 + i, 3)],
        rarity: complexity === "legendary" ? "mythical" : complexity === "complex" ? "epic" : "rare",
        description: `A powerful item infused with ${material} energy`,
        effects: [`${environment.split('_')[0]} enhancement`, `${material} boost`]
      })),
      artifacts: [artifact],
      materials: [material]
    },
    lore: `The ${archetype.replace(/_/g, ' ')} has guarded the ${environment.replace(/_/g, ' ')} for millennia, protecting the sacred ${artifact.replace(/_/g, ' ')} and its connection to the primordial ${material}. Legend speaks of those who prove worthy gaining not just treasure, but wisdom beyond mortal comprehension.`,
    hash,
    originalEnvironment: environment,
    generationType: "enhanced_fallback"
  };
}

export async function generateEnhancedItem(environment: string, rarity: string, hash: string): Promise<any> {
  const itemTypes = ["weapon", "armor", "accessory", "consumable", "material", "artifact"];
  const typeIndex = hashToNumber(hash, 0, itemTypes.length);
  const itemType = itemTypes[typeIndex];
  
  const artifactIndex = hashToNumber(hash, 1, MYSTICAL_ARTIFACTS.length);
  const materialIndex = hashToNumber(hash, 2, RARE_MATERIALS.length);
  
  const artifact = MYSTICAL_ARTIFACTS[artifactIndex];
  const material = RARE_MATERIALS[materialIndex];
  
  const rarityMultiplier = {
    "Common": 1,
    "Uncommon": 1.5,
    "Rare": 2,
    "Epic": 3,
    "Legendary": 5,
    "Mythical": 8,
    "Transcendent": 12
  };
  
  const baseValue = 10 * (rarityMultiplier[rarity as keyof typeof rarityMultiplier] || 1);
  
  return {
    name: `${rarity} ${artifact.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    type: itemType,
    rarity: rarity.toLowerCase(),
    description: `A ${rarity.toLowerCase()} ${itemType} crafted from pure ${material} and imbued with the essence of ${environment}`,
    value: Math.floor(baseValue + hashToNumber(hash, 3, baseValue)),
    effects: [
      `${environment.split('_')[0]} affinity +${Math.floor(baseValue / 10)}`,
      `${material} enhancement +${Math.floor(baseValue / 15)}`,
      `${rarity.toLowerCase()} tier bonus`
    ],
    environment,
    material,
    hash: hash.slice(0, 8)
  };
}