import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  displayName: varchar("display_name"),
  coins: integer("coins").default(100),
  gems: integer("gems").default(10),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  friendCode: varchar("friend_code").unique(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  preferences: jsonb("preferences").default({}),
  achievements: jsonb("achievements").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pixel Pets table
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  sha256Hash: varchar("sha256_hash").notNull().unique(),
  imageUrl: varchar("image_url"),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  health: integer("health").default(100),
  maxHealth: integer("max_health").default(100),
  happiness: integer("happiness").default(50),
  mood: varchar("mood").default("happy"),
  personality: jsonb("personality").default({}),
  traits: jsonb("traits").default([]),
  memories: jsonb("memories").default([]),
  lastInteraction: timestamp("last_interaction"),
  isForTrade: boolean("is_for_trade").default(false),
  tradeValue: integer("trade_value").default(0),
  rarity: varchar("rarity").default("common"),
  birthDate: timestamp("birth_date").defaultNow(),
  evolutionStage: integer("evolution_stage").default(1),
  energy: integer("energy").default(100),
  hunger: integer("hunger").default(50),
  // Core Attributes
  color: varchar("color").notNull(),
  size: varchar("size").notNull(),
  type: varchar("type").notNull(),
  element: varchar("element").notNull(),
  rarity: varchar("rarity").notNull(),
  personality: varchar("personality").notNull(),
  // Extended Attributes
  habitat: varchar("habitat").default("Unknown"),
  pattern: varchar("pattern").default("Solid"),
  aura: varchar("aura").default("None"),
  birthmark: varchar("birthmark").default("None"),
  eyeType: varchar("eye_type").default("Normal"),
  wingType: varchar("wing_type").default("None"),
  tailType: varchar("tail_type").default("Normal"),
  furTexture: varchar("fur_texture").default("Smooth"),
  scale: varchar("scale").default("None"),
  horn: varchar("horn").default("None"),
  specialFeatures: jsonb("special_features").default('[]'),
  abilities: jsonb("abilities").default('[]'),
  // Battle Stats
  attack: integer("attack").default(50),
  defense: integer("defense").default(50),
  speed: integer("speed").default(50),
  intelligence: integer("intelligence").default(50),
  luck: integer("luck").default(50),
  // Evolution Data
  evolutionStage: integer("evolution_stage").default(1),
  evolutionPath: varchar("evolution_path").default("Normal"),
  canEvolve: boolean("can_evolve").default(false),
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemType: varchar("item_type").notNull(), // 'gem', 'consumable', 'equipment', 'currency'
  itemName: varchar("item_name").notNull(),
  itemDescription: text("item_description"),
  quantity: integer("quantity").default(1),
  rarity: varchar("rarity").default("common"),
  obtainedAt: timestamp("obtained_at").defaultNow(),
});

// Exploration logs table
export const explorationLogs = pgTable("exploration_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: integer("pet_id").notNull().references(() => pets.id),
  environment: varchar("environment").notNull(),
  encounterType: varchar("encounter_type").notNull(), // 'loot', 'battle', 'event'
  encounterData: jsonb("encounter_data"),
  result: jsonb("result"),
  experienceGained: integer("experience_gained").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Battle logs table
export const battleLogs = pgTable("battle_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: integer("pet_id").notNull().references(() => pets.id),
  enemyName: varchar("enemy_name").notNull(),
  enemyType: varchar("enemy_type").notNull(),
  battleResult: varchar("battle_result").notNull(), // 'victory', 'defeat', 'flee'
  damageDealt: integer("damage_dealt").default(0),
  damageTaken: integer("damage_taken").default(0),
  experienceGained: integer("experience_gained").default(0),
  lootGained: jsonb("loot_gained").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
});

// User game state table
export const gameState = pgTable("game_state", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  coins: integer("coins").default(1000),
  activePetId: integer("active_pet_id").references(() => pets.id),
  currentEnvironment: varchar("current_environment").default("forest"),
  unlockedEnvironments: jsonb("unlocked_environments").default('["forest"]'),
  achievements: jsonb("achievements").default('[]'),
  settings: jsonb("settings").default('{}'),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crafting Recipes Table
export const craftingRecipes = pgTable("crafting_recipes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "accessories", "consumables", "tools"
  type: varchar("type", { length: 100 }).notNull(), // "collar", "hat", "wings", "potion"
  rarity: varchar("rarity", { length: 50 }).notNull(),
  description: text("description"),
  materials: jsonb("materials").notNull(), // [{"material": "Crystal Shard", "quantity": 3}]
  craftingTime: integer("crafting_time").default(300), // seconds
  levelRequired: integer("level_required").default(1),
  effects: jsonb("effects").default({}), // {"attack": +5, "defense": +3}
  bonuses: text("bonuses").array().default([]), // ["Fire Resistance", "Speed Boost"]
  createdAt: timestamp("created_at").defaultNow(),
});

// Crafted Items Table
export const craftedItems = pgTable("crafted_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").references(() => craftingRecipes.id),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  rarity: varchar("rarity", { length: 50 }).notNull(),
  effects: jsonb("effects").default({}),
  bonuses: text("bonuses").array().default([]),
  durability: integer("durability").default(100),
  maxDurability: integer("max_durability").default(100),
  equippedToPetId: integer("equipped_to_pet_id").references(() => pets.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crafting Queue Table
export const craftingQueue = pgTable("crafting_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").references(() => craftingRecipes.id),
  status: varchar("status", { length: 50 }).default("in_progress"), // "in_progress", "completed", "cancelled"
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  craftingTime: integer("crafting_time").notNull(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Trading system tables
export const tradeOffers = pgTable("trade_offers", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  offeredPets: jsonb("offered_pets").notNull(),
  requestedPets: jsonb("requested_pets").notNull(),
  offeredCoins: integer("offered_coins").default(0),
  requestedCoins: integer("requested_coins").default(0),
  status: varchar("status").notNull().default("pending"),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  friendId: varchar("friend_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const petInteractions = pgTable("pet_interactions", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  interactionType: varchar("interaction_type").notNull(),
  userMessage: text("user_message"),
  petResponse: text("pet_response"),
  moodChange: integer("mood_change").default(0),
  happinessChange: integer("happiness_change").default(0),
  experienceGained: integer("experience_gained").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Store and monetization tables
export const storeItems = pgTable("store_items", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  itemType: varchar("item_type").notNull(),
  price: integer("price").notNull(),
  currency: varchar("currency").notNull(),
  rarity: varchar("rarity").default("common"),
  imageUrl: varchar("image_url"),
  isLimited: boolean("is_limited").default(false),
  stock: integer("stock"),
  isActive: boolean("is_active").default(true),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => storeItems.id),
  quantity: integer("quantity").default(1),
  totalPrice: integer("total_price").notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyRewards = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  day: integer("day").notNull(),
  rewardType: varchar("reward_type").notNull(),
  rewardData: jsonb("reward_data").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
});

export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type").notNull(),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Type exports for the new tables
export type TradeOffer = typeof tradeOffers.$inferSelect;
export type InsertTradeOffer = typeof tradeOffers.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;
export type PetInteraction = typeof petInteractions.$inferSelect;
export type InsertPetInteraction = typeof petInteractions.$inferInsert;
export type StoreItem = typeof storeItems.$inferSelect;
export type InsertStoreItem = typeof storeItems.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
export type DailyReward = typeof dailyRewards.$inferSelect;
export type InsertDailyReward = typeof dailyRewards.$inferInsert;
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;

export type InsertPet = typeof pets.$inferInsert;
export type Pet = typeof pets.$inferSelect;

export type InsertInventoryItem = typeof inventory.$inferInsert;
export type InventoryItem = typeof inventory.$inferSelect;

export type InsertExplorationLog = typeof explorationLogs.$inferInsert;
export type ExplorationLog = typeof explorationLogs.$inferSelect;

export type InsertBattleLog = typeof battleLogs.$inferInsert;
export type BattleLog = typeof battleLogs.$inferSelect;

export type InsertGameState = typeof gameState.$inferInsert;
export type GameState = typeof gameState.$inferSelect;

export type InsertCraftingRecipe = typeof craftingRecipes.$inferInsert;
export type CraftingRecipe = typeof craftingRecipes.$inferSelect;

export type InsertCraftedItem = typeof craftedItems.$inferInsert;
export type CraftedItem = typeof craftedItems.$inferSelect;

export type InsertCraftingQueue = typeof craftingQueue.$inferInsert;
export type CraftingQueue = typeof craftingQueue.$inferSelect;

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventory).omit({
  id: true,
  obtainedAt: true,
});

export const insertExplorationLogSchema = createInsertSchema(explorationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBattleLogSchema = createInsertSchema(battleLogs).omit({
  id: true,
  createdAt: true,
});

export const insertGameStateSchema = createInsertSchema(gameState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});



// World Map and Locations
export const worldLocations = pgTable("world_locations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // park, shop, minigame, trading_hub
  description: text("description"),
  unlockLevel: integer("unlock_level").default(1),
  backgroundImage: varchar("background_image"),
  coordinates: jsonb("coordinates"), // {x, y} position on map
  features: jsonb("features").default([]), // Available activities
  isPublic: boolean("is_public").default(true),
});

// Pet Interactions and AI Conversations
export const petInteractions = pgTable("pet_interactions", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  interactionType: varchar("interaction_type").notNull(), // chat, feed, play, train
  userMessage: text("user_message"),
  petResponse: text("pet_response"),
  moodChange: integer("mood_change").default(0),
  happinessChange: integer("happiness_change").default(0),
  experienceGained: integer("experience_gained").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Monetization: In-Game Store
export const storeItems = pgTable("store_items", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // pets, accessories, coins, gems, special
  itemType: varchar("item_type").notNull(),
  price: integer("price").notNull(),
  currency: varchar("currency").notNull(), // coins, gems, real_money
  rarity: varchar("rarity").default("common"),
  imageUrl: varchar("image_url"),
  isLimited: boolean("is_limited").default(false),
  stock: integer("stock"),
  isActive: boolean("is_active").default(true),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => storeItems.id),
  quantity: integer("quantity").default(1),
  totalPrice: integer("total_price").notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Rewards and Activities
export const dailyRewards = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  day: integer("day").notNull(), // Consecutive login day
  rewardType: varchar("reward_type").notNull(), // coins, gems, items
  rewardData: jsonb("reward_data").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow(),
});

export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type").notNull(),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Type exports for new tables
export type InsertTradeOffer = typeof tradeOffers.$inferInsert;
export type TradeOffer = typeof tradeOffers.$inferSelect;

export type InsertFriendship = typeof friendships.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;

export type InsertWorldLocation = typeof worldLocations.$inferInsert;
export type WorldLocation = typeof worldLocations.$inferSelect;

export type InsertPetInteraction = typeof petInteractions.$inferInsert;
export type PetInteraction = typeof petInteractions.$inferSelect;

export type InsertStoreItem = typeof storeItems.$inferInsert;
export type StoreItem = typeof storeItems.$inferSelect;

export type InsertPurchase = typeof purchases.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;

export type InsertDailyReward = typeof dailyRewards.$inferInsert;
export type DailyReward = typeof dailyRewards.$inferSelect;

export type InsertUserActivity = typeof userActivities.$inferInsert;
export type UserActivity = typeof userActivities.$inferSelect;
