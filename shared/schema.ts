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
  name: varchar("name").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sha256Hash: varchar("sha256_hash").notNull(),
  imageUrl: varchar("image_url"),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  mood: varchar("mood").default('happy'),
  personality: jsonb("personality").default('{}'),
  traits: jsonb("traits").default('[]'),
  memories: jsonb("memories").default('[]'),
  lastInteraction: timestamp("last_interaction"),
  isForTrade: boolean("is_for_trade").default(false),
  tradeValue: integer("trade_value").default(0),
  birthDate: timestamp("birth_date").defaultNow(),
  evolutionStage: integer("evolution_stage").default(1),
  rarity: varchar("rarity").default('common'),
  color: varchar("color").notNull(),
  size: varchar("size").notNull(),
  type: varchar("type").notNull(),
  element: varchar("element").notNull(),
  specialFeatures: jsonb("special_features").default('[]'),
  habitat: varchar("habitat"),
  pattern: varchar("pattern"),
  aura: varchar("aura"),
  birthmark: varchar("birthmark"),
  eyeType: varchar("eye_type"),
  wingType: varchar("wing_type"),
  tailType: varchar("tail_type"),
  furTexture: varchar("fur_texture"),
  scale: varchar("scale"),
  horn: varchar("horn"),
  abilities: jsonb("abilities").default('[]'),
  attack: integer("attack").default(10),
  defense: integer("defense").default(10),
  speed: integer("speed").default(10),
  intelligence: integer("intelligence").default(10),
  luck: integer("luck").default(10),
  happiness: integer("happiness").default(100),
  hunger: integer("hunger").default(100),
  energy: integer("energy").default(100),
  health: integer("health").default(100),
  isActive: boolean("is_active").default(true),
  isShiny: boolean("is_shiny").default(false),
  generation: integer("generation").default(1),
  breedingCount: integer("breeding_count").default(0),
  maxBreedingCount: integer("max_breeding_count").default(3),
  parentOneId: integer("parent_one_id").references(() => pets.id),
  parentTwoId: integer("parent_two_id").references(() => pets.id),
  isFavorite: boolean("is_favorite").default(false),
  notes: text("notes"),
  tags: jsonb("tags").default('[]'),
  maxHealth: integer("max_health").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory System
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemType: varchar("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  itemName: varchar("item_name"),
  quantity: integer("quantity").default(1),
  metadata: jsonb("metadata").default('{}'),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

// Exploration System
export const explorationLogs = pgTable("exploration_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: integer("pet_id").references(() => pets.id),
  environment: varchar("environment").notNull(),
  outcome: varchar("outcome").notNull(),
  itemsFound: jsonb("items_found").default('[]'),
  encountersFound: jsonb("encounters_found").default('[]'),
  experienceGained: integer("experience_gained").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Battle System
export const battleLogs = pgTable("battle_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: integer("pet_id").notNull().references(() => pets.id),
  enemyType: varchar("enemy_type").notNull(),
  enemyName: varchar("enemy_name"),
  outcome: varchar("outcome").notNull(),
  experienceGained: integer("experience_gained").default(0),
  itemsEarned: jsonb("items_earned").default('[]'),
  battleData: jsonb("battle_data").default('{}'),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Game State Management
export const gameState = pgTable("game_state", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  coins: integer("coins").default(100),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  activePetId: integer("active_pet_id").references(() => pets.id),
  currentEnvironment: varchar("current_environment").default('meadow'),
  unlockedEnvironments: jsonb("unlocked_environments").default('["meadow"]'),
  achievements: jsonb("achievements").default('[]'),
  settings: jsonb("settings").default('{}'),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crafting System
export const craftingRecipes = pgTable("crafting_recipes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  type: varchar("type").notNull(),
  rarity: varchar("rarity").default('common'),
  requiredItems: jsonb("required_items").notNull(),
  effects: jsonb("effects").default('{}'),
  bonuses: jsonb("bonuses").default('{}'),
  unlockLevel: integer("unlock_level").default(1),
  craftingTime: integer("crafting_time").default(60),
  isActive: boolean("is_active").default(true),
});

export const craftedItems = pgTable("crafted_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => craftingRecipes.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  type: varchar("type").notNull(),
  rarity: varchar("rarity").notNull(),
  effects: jsonb("effects").default('{}'),
  bonuses: jsonb("bonuses").default('{}'),
  equippedToPetId: integer("equipped_to_pet_id").references(() => pets.id),
  durability: integer("durability").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const craftingQueue = pgTable("crafting_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => craftingRecipes.id),
  status: varchar("status").default('in_progress'),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  craftingTime: integer("crafting_time").notNull(),
});

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

// Breeding Sessions
export const breedingSessions = pgTable("breeding_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  parentOneId: integer("parent_one_id").notNull().references(() => pets.id),
  parentTwoId: integer("parent_two_id").notNull().references(() => pets.id),
  offspringId: integer("offspring_id").references(() => pets.id),
  breedingStatus: varchar("breeding_status").notNull().default("active"),
  breedingStartedAt: timestamp("breeding_started_at").defaultNow(),
  breedingCompletedAt: timestamp("breeding_completed_at"),
  successRate: integer("success_rate").notNull(),
  breedingCost: integer("breeding_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;
export type Pet = typeof pets.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;
export type ExplorationLog = typeof explorationLogs.$inferSelect;
export type InsertExplorationLog = typeof explorationLogs.$inferInsert;
export type BattleLog = typeof battleLogs.$inferSelect;
export type InsertBattleLog = typeof battleLogs.$inferInsert;
export type GameState = typeof gameState.$inferSelect;
export type InsertGameState = typeof gameState.$inferInsert;
export type CraftingRecipe = typeof craftingRecipes.$inferSelect;
export type InsertCraftingRecipe = typeof craftingRecipes.$inferInsert;
export type CraftedItem = typeof craftedItems.$inferSelect;
export type InsertCraftedItem = typeof craftedItems.$inferInsert;
export type CraftingQueue = typeof craftingQueue.$inferSelect;
export type InsertCraftingQueue = typeof craftingQueue.$inferInsert;
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
export type BreedingSession = typeof breedingSessions.$inferSelect;
export type InsertBreedingSession = typeof breedingSessions.$inferInsert;

// Insert schemas for validation
export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventory).omit({
  id: true,
  acquiredAt: true,
});

export const insertExplorationLogSchema = createInsertSchema(explorationLogs).omit({
  id: true,
  timestamp: true,
});

export const insertBattleLogSchema = createInsertSchema(battleLogs).omit({
  id: true,
  timestamp: true,
});

export const insertGameStateSchema = createInsertSchema(gameState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});