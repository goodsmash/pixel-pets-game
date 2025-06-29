import { db } from "./db";
import { craftingRecipes } from "@shared/schema";

const initialRecipes = [
  // Accessories - Common
  {
    name: "Basic Collar",
    category: "accessories",
    type: "collar",
    rarity: "common",
    description: "A simple leather collar that provides basic protection.",
    materials: [
      { material: "Leather Scraps", quantity: 3 },
      { material: "Iron Buckle", quantity: 1 }
    ],
    craftingTime: 300,
    levelRequired: 1,
    effects: { defense: 2 },
    bonuses: ["Basic Protection"]
  },
  {
    name: "Simple Bandana",
    category: "accessories",
    type: "hat",
    rarity: "common",
    description: "A colorful bandana that boosts your pet's charm.",
    materials: [
      { material: "Cloth Fabric", quantity: 2 },
      { material: "Dye", quantity: 1 }
    ],
    craftingTime: 240,
    levelRequired: 1,
    effects: { luck: 3 },
    bonuses: ["Charm Boost"]
  },

  // Accessories - Uncommon
  {
    name: "Crystal Pendant",
    category: "accessories",
    type: "necklace",
    rarity: "uncommon",
    description: "A shimmering pendant that enhances magical abilities.",
    materials: [
      { material: "Crystal Shard", quantity: 2 },
      { material: "Silver Chain", quantity: 1 },
      { material: "Enchanted Thread", quantity: 1 }
    ],
    craftingTime: 600,
    levelRequired: 3,
    effects: { intelligence: 5, luck: 2 },
    bonuses: ["Magic Amplification", "Mana Regeneration"]
  },
  {
    name: "Speed Boots",
    category: "accessories",
    type: "boots",
    rarity: "uncommon",
    description: "Lightweight boots that increase movement speed.",
    materials: [
      { material: "Wind Essence", quantity: 2 },
      { material: "Soft Leather", quantity: 3 },
      { material: "Feather", quantity: 5 }
    ],
    craftingTime: 480,
    levelRequired: 2,
    effects: { speed: 7 },
    bonuses: ["Swift Movement", "Silent Steps"]
  },

  // Accessories - Rare
  {
    name: "Dragon Scale Armor",
    category: "accessories",
    type: "armor",
    rarity: "rare",
    description: "Armor crafted from ancient dragon scales.",
    materials: [
      { material: "Dragon Scale", quantity: 5 },
      { material: "Mythril Thread", quantity: 3 },
      { material: "Fire Core", quantity: 1 }
    ],
    craftingTime: 1200,
    levelRequired: 5,
    effects: { defense: 15, attack: 5 },
    bonuses: ["Fire Resistance", "Dragon's Might", "Intimidation"]
  },

  // Consumables - Common
  {
    name: "Health Potion",
    category: "consumables",
    type: "potion",
    rarity: "common",
    description: "A basic healing potion that restores health.",
    materials: [
      { material: "Healing Herbs", quantity: 3 },
      { material: "Pure Water", quantity: 1 },
      { material: "Glass Vial", quantity: 1 }
    ],
    craftingTime: 180,
    levelRequired: 1,
    effects: { health: 50 },
    bonuses: ["Instant Healing"]
  },
  {
    name: "Energy Drink",
    category: "consumables",
    type: "potion",
    rarity: "common",
    description: "A refreshing drink that restores energy.",
    materials: [
      { material: "Sweet Berries", quantity: 4 },
      { material: "Honey", quantity: 2 },
      { material: "Sparkling Water", quantity: 1 }
    ],
    craftingTime: 150,
    levelRequired: 1,
    effects: { energy: 30 },
    bonuses: ["Energy Boost"]
  },

  // Consumables - Uncommon
  {
    name: "Strength Elixir",
    category: "consumables",
    type: "elixir",
    rarity: "uncommon",
    description: "A powerful elixir that temporarily boosts attack power.",
    materials: [
      { material: "Bull's Horn", quantity: 1 },
      { material: "Red Mushroom", quantity: 3 },
      { material: "Ancient Wine", quantity: 1 }
    ],
    craftingTime: 450,
    levelRequired: 3,
    effects: { attack: 10 },
    bonuses: ["Temporary Strength", "Battle Fury"]
  },

  // Tools - Common
  {
    name: "Basic Pickaxe",
    category: "tools",
    type: "pickaxe",
    rarity: "common",
    description: "A sturdy pickaxe for mining common materials.",
    materials: [
      { material: "Iron Ore", quantity: 3 },
      { material: "Wooden Handle", quantity: 1 },
      { material: "Binding Rope", quantity: 2 }
    ],
    craftingTime: 360,
    levelRequired: 2,
    effects: { mining: 5 },
    bonuses: ["Efficient Mining"]
  },
  {
    name: "Fishing Net",
    category: "tools",
    type: "net",
    rarity: "common",
    description: "A durable net for catching aquatic creatures.",
    materials: [
      { material: "Strong Rope", quantity: 5 },
      { material: "Lead Weight", quantity: 3 },
      { material: "Waterproof Coating", quantity: 1 }
    ],
    craftingTime: 300,
    levelRequired: 2,
    effects: { fishing: 8 },
    bonuses: ["Large Catch", "Durability"]
  },

  // Tools - Rare
  {
    name: "Master's Toolkit",
    category: "tools",
    type: "toolkit",
    rarity: "rare",
    description: "A comprehensive toolkit for advanced crafting.",
    materials: [
      { material: "Precision Gears", quantity: 5 },
      { material: "Mithril Components", quantity: 3 },
      { material: "Enchanted Crystal", quantity: 2 },
      { material: "Master's Blueprint", quantity: 1 }
    ],
    craftingTime: 1800,
    levelRequired: 7,
    effects: { crafting: 20, efficiency: 15 },
    bonuses: ["Master Crafting", "Resource Efficiency", "Quality Boost"]
  }
];

export async function seedCraftingRecipes() {
  try {
    console.log("Seeding crafting recipes...");
    
    // Check if recipes already exist
    const existingRecipes = await db.select().from(craftingRecipes);
    if (existingRecipes.length > 0) {
      console.log("Crafting recipes already seeded.");
      return;
    }

    // Insert initial recipes
    for (const recipe of initialRecipes) {
      await db.insert(craftingRecipes).values({
        name: recipe.name,
        category: recipe.category,
        type: recipe.type,
        rarity: recipe.rarity,
        description: recipe.description,
        materials: recipe.materials,
        craftingTime: recipe.craftingTime,
        levelRequired: recipe.levelRequired,
        effects: recipe.effects,
        bonuses: recipe.bonuses
      });
    }

    console.log(`Successfully seeded ${initialRecipes.length} crafting recipes.`);
  } catch (error) {
    console.error("Error seeding crafting recipes:", error);
  }
}