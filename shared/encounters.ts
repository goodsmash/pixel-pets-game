import { pgTable, serial, varchar, integer, jsonb, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Wild Encounters table
export const encounters = pgTable("encounters", {
  id: serial("id").primaryKey(),
  sha256Hash: varchar("sha256_hash").notNull().unique(),
  name: varchar("name").notNull(),
  imageUrl: varchar("image_url"),
  // Core Attributes
  type: varchar("type").notNull(), // creature, item, treasure, mystery
  category: varchar("category").notNull(), // beast, spirit, artifact, etc.
  rarity: varchar("rarity").notNull(),
  environment: varchar("environment").notNull(),
  // Physical Attributes
  color: varchar("color").notNull(),
  size: varchar("size").notNull(),
  pattern: varchar("pattern").default("Solid"),
  aura: varchar("aura").default("None"),
  element: varchar("element").notNull(),
  // Battle Stats (for creatures)
  health: integer("health").default(100),
  attack: integer("attack").default(50),
  defense: integer("defense").default(50),
  speed: integer("speed").default(50),
  intelligence: integer("intelligence").default(50),
  // Special Properties
  abilities: jsonb("abilities").default('[]'),
  specialFeatures: jsonb("special_features").default('[]'),
  behaviorTraits: jsonb("behavior_traits").default('[]'),
  // Encounter Data
  captureRate: integer("capture_rate").default(50), // percentage
  experienceReward: integer("experience_reward").default(10),
  itemDrops: jsonb("item_drops").default('[]'),
  description: text("description"),
  // Metadata
  discoveredCount: integer("discovered_count").default(0),
  lastEncountered: timestamp("last_encountered"),
  createdAt: timestamp("created_at").defaultNow(),
});

// World Regions table
export const worldRegions = pgTable("world_regions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  type: varchar("type").notNull(), // forest, beach, mountain, etc.
  climate: varchar("climate").notNull(),
  terrain: varchar("terrain").notNull(),
  difficulty: integer("difficulty").default(1), // 1-10
  // Environment Properties
  temperature: varchar("temperature").notNull(),
  humidity: varchar("humidity").notNull(),
  lighting: varchar("lighting").notNull(),
  atmosphere: varchar("atmosphere").notNull(),
  // Encounter Rates
  commonEncounterRate: integer("common_encounter_rate").default(60),
  rareEncounterRate: integer("rare_encounter_rate").default(25),
  epicEncounterRate: integer("epic_encounter_rate").default(10),
  legendaryEncounterRate: integer("legendary_encounter_rate").default(4),
  mythicalEncounterRate: integer("mythical_encounter_rate").default(1),
  // Special Properties
  uniqueFeatures: jsonb("unique_features").default('[]'),
  hazards: jsonb("hazards").default('[]'),
  resources: jsonb("resources").default('[]'),
  description: text("description"),
  imageUrl: varchar("image_url"),
  // Access Requirements
  unlockLevel: integer("unlock_level").default(1),
  prerequisiteRegions: jsonb("prerequisite_regions").default('[]'),
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Battle Results table
export const battleResults = pgTable("battle_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  petId: integer("pet_id").notNull(),
  encounterId: integer("encounter_id"),
  battleType: varchar("battle_type").notNull(), // wild, pvp, boss
  environment: varchar("environment").notNull(),
  // Battle Details
  petStartHealth: integer("pet_start_health").notNull(),
  petEndHealth: integer("pet_end_health").notNull(),
  enemyStartHealth: integer("enemy_start_health").notNull(),
  enemyEndHealth: integer("enemy_end_health").notNull(),
  totalTurns: integer("total_turns").notNull(),
  result: varchar("result").notNull(), // victory, defeat, draw, fled
  // Rewards
  experienceGained: integer("experience_gained").default(0),
  itemsObtained: jsonb("items_obtained").default('[]'),
  coinsEarned: integer("coins_earned").default(0),
  // Battle Log
  battleLog: jsonb("battle_log").default('[]'), // detailed turn-by-turn actions
  criticalMoments: jsonb("critical_moments").default('[]'),
  // Metadata
  duration: integer("duration"), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
});

// Captured Encounters table
export const capturedEncounters = pgTable("captured_encounters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  encounterId: integer("encounter_id").notNull().references(() => encounters.id),
  captureMethod: varchar("capture_method").notNull(),
  captureLocation: varchar("capture_location").notNull(),
  // Capture Details
  attemptCount: integer("attempt_count").default(1),
  successRate: integer("success_rate").notNull(),
  petUsedId: integer("pet_used_id"),
  // Status
  isInCollection: boolean("is_in_collection").default(true),
  nickname: varchar("nickname"),
  notes: text("notes"),
  // Metadata
  capturedAt: timestamp("captured_at").defaultNow(),
});

// Evolution Paths table
export const evolutionPaths = pgTable("evolution_paths", {
  id: serial("id").primaryKey(),
  basePetType: varchar("base_pet_type").notNull(),
  evolvedPetType: varchar("evolved_pet_type").notNull(),
  // Requirements
  requiredLevel: integer("required_level").default(10),
  requiredExperience: integer("required_experience").default(1000),
  requiredItems: jsonb("required_items").default('[]'),
  requiredConditions: jsonb("required_conditions").default('[]'),
  // Evolution Details
  evolutionMethod: varchar("evolution_method").notNull(), // level, item, friendship, etc.
  statChanges: jsonb("stat_changes").default('{}'),
  newAbilities: jsonb("new_abilities").default('[]'),
  physicalChanges: jsonb("physical_changes").default('{}'),
  // Metadata
  discoveryRate: integer("discovery_rate").default(5), // percentage of players who discovered
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type Encounter = typeof encounters.$inferSelect;
export type InsertEncounter = typeof encounters.$inferInsert;
export type WorldRegion = typeof worldRegions.$inferSelect;
export type InsertWorldRegion = typeof worldRegions.$inferInsert;
export type BattleResult = typeof battleResults.$inferSelect;
export type InsertBattleResult = typeof battleResults.$inferInsert;
export type CapturedEncounter = typeof capturedEncounters.$inferSelect;
export type InsertCapturedEncounter = typeof capturedEncounters.$inferInsert;
export type EvolutionPath = typeof evolutionPaths.$inferSelect;
export type InsertEvolutionPath = typeof evolutionPaths.$inferInsert;

// Zod schemas
export const insertEncounterSchema = createInsertSchema(encounters).omit({
  id: true,
  discoveredCount: true,
  lastEncountered: true,
  createdAt: true,
});

export const insertWorldRegionSchema = createInsertSchema(worldRegions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBattleResultSchema = createInsertSchema(battleResults).omit({
  id: true,
  timestamp: true,
});

export const insertCapturedEncounterSchema = createInsertSchema(capturedEncounters).omit({
  id: true,
  capturedAt: true,
});

export const insertEvolutionPathSchema = createInsertSchema(evolutionPaths).omit({
  id: true,
  discoveryRate: true,
  createdAt: true,
});