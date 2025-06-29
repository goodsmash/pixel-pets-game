import {
  users,
  pets,
  inventory,
  explorationLogs,
  battleLogs,
  gameState,
  craftingRecipes,
  craftedItems,
  craftingQueue,
  breedingSessions,
  type User,
  type UpsertUser,
  type Pet,
  type InsertPet,
  type InventoryItem,
  type InsertInventoryItem,
  type ExplorationLog,
  type InsertExplorationLog,
  type BattleLog,
  type InsertBattleLog,
  type BreedingSession,
  type InsertBreedingSession,
  type GameState,
  type InsertGameState,
  type CraftingRecipe,
  type InsertCraftingRecipe,
  type CraftedItem,
  type InsertCraftedItem,
  type CraftingQueue,
  type InsertCraftingQueue,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Pet operations
  createPet(pet: InsertPet): Promise<Pet>;
  getPetsByUserId(userId: string): Promise<Pet[]>;
  getActivePet(userId: string): Promise<Pet | undefined>;
  updatePet(petId: number, updates: Partial<Pet>): Promise<Pet>;
  deletePet(petId: number): Promise<void>;
  getPetByHash(hash: string): Promise<Pet | undefined>;
  
  // Inventory operations
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryByUserId(userId: string): Promise<InventoryItem[]>;
  updateInventoryItem(itemId: number, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  removeInventoryItem(itemId: number): Promise<void>;
  
  // Exploration operations
  logExploration(log: InsertExplorationLog): Promise<ExplorationLog>;
  getExplorationHistory(userId: string, limit?: number): Promise<ExplorationLog[]>;
  
  // Battle operations
  logBattle(log: InsertBattleLog): Promise<BattleLog>;
  getBattleHistory(userId: string, limit?: number): Promise<BattleLog[]>;
  
  // Game state operations
  getGameState(userId: string): Promise<GameState | undefined>;
  upsertGameState(userId: string, state: Partial<InsertGameState>): Promise<GameState>;
  
  // Capture operations
  logCapturedEncounter(data: any): Promise<any>;
  getCapturedEncounter(userId: string, encounterId: number): Promise<any>;
  
  // Crafting operations
  getCraftingRecipes(): Promise<CraftingRecipe[]>;
  getCraftingRecipesByCategory(category: string): Promise<CraftingRecipe[]>;
  getCraftingRecipe(id: number): Promise<CraftingRecipe | undefined>;
  createCraftedItem(item: InsertCraftedItem): Promise<CraftedItem>;
  getCraftedItemsByUserId(userId: string): Promise<CraftedItem[]>;
  getCraftedItem(id: number): Promise<CraftedItem | undefined>;
  updateCraftedItem(id: number, updates: Partial<CraftedItem>): Promise<CraftedItem>;
  deleteCraftedItem(id: number): Promise<void>;
  equipItem(itemId: number, petId: number): Promise<CraftedItem>;
  unequipItem(itemId: number): Promise<CraftedItem>;
  
  // Crafting queue operations
  addToCraftingQueue(item: InsertCraftingQueue): Promise<CraftingQueue>;
  getCraftingQueue(userId: string): Promise<CraftingQueue[]>;
  updateCraftingQueue(id: number, updates: Partial<CraftingQueue>): Promise<CraftingQueue>;
  completeCraftingQueue(id: number): Promise<CraftingQueue>;
  
  // Breeding operations
  createBreedingSession(session: InsertBreedingSession): Promise<BreedingSession>;
  getBreedingSessions(userId: string): Promise<BreedingSession[]>;
  updateBreedingSession(id: number, updates: Partial<BreedingSession>): Promise<BreedingSession>;
  completeBreedingSession(id: number, offspringId: number): Promise<BreedingSession>;
  
  // Trading operations
  createTradeOffer(offer: any): Promise<any>;
  getTradeOffers(userId: string): Promise<any[]>;
  updateTradeOffer(id: number, updates: any): Promise<any>;
  acceptTradeOffer(offerId: number, userId: string): Promise<any>;
  
  // Pet interactions and AI
  createPetInteraction(interaction: any): Promise<any>;
  getPetInteractions(petId: number, limit?: number): Promise<any[]>;
  updatePetPersonality(petId: number, personality: any): Promise<any>;
  
  // Social features
  createFriendship(userId: string, friendId: string): Promise<any>;
  getFriends(userId: string): Promise<any[]>;
  updateFriendshipStatus(id: number, status: string): Promise<any>;
  
  // Store and monetization
  getStoreItems(): Promise<any[]>;
  createPurchase(purchase: any): Promise<any>;
  getUserPurchases(userId: string): Promise<any[]>;
  
  // Daily rewards and activities
  claimDailyReward(userId: string): Promise<any>;
  getUserActivities(userId: string, limit?: number): Promise<any[]>;
  logUserActivity(activity: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pet operations
  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }

  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.userId, userId)).orderBy(desc(pets.createdAt));
  }

  async getActivePet(userId: string): Promise<Pet | undefined> {
    const userGameState = await this.getGameState(userId);
    if (!userGameState?.activePetId) {
      // Get the most recent pet
      const userPets = await this.getPetsByUserId(userId);
      return userPets[0];
    }
    
    const [pet] = await db.select().from(pets).where(eq(pets.id, userGameState.activePetId));
    return pet;
  }

  async updatePet(petId: number, updates: Partial<Pet>): Promise<Pet> {
    const [updatedPet] = await db
      .update(pets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pets.id, petId))
      .returning();
    return updatedPet;
  }

  async deletePet(petId: number): Promise<void> {
    await db.delete(pets).where(eq(pets.id, petId));
  }

  async getPetByHash(hash: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.sha256Hash, hash));
    return pet;
  }

  // Inventory operations
  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async getInventoryByUserId(userId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.userId, userId))
      .orderBy(inventory.acquiredAt);
  }

  async updateInventoryItem(itemId: number, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const [updatedItem] = await db
      .update(inventory)
      .set(updates)
      .where(eq(inventory.id, itemId))
      .returning();
    return updatedItem;
  }

  async removeInventoryItem(itemId: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, itemId));
  }

  // Exploration operations
  async logExploration(log: InsertExplorationLog): Promise<ExplorationLog> {
    const [newLog] = await db.insert(explorationLogs).values(log).returning();
    return newLog;
  }

  async getExplorationHistory(userId: string, limit = 50): Promise<ExplorationLog[]> {
    return await db
      .select()
      .from(explorationLogs)
      .where(eq(explorationLogs.userId, userId))
      .orderBy(desc(explorationLogs.timestamp))
      .limit(limit);
  }

  // Battle operations
  async logBattle(log: InsertBattleLog): Promise<BattleLog> {
    const [newLog] = await db.insert(battleLogs).values(log).returning();
    return newLog;
  }

  async getBattleHistory(userId: string, limit = 50): Promise<BattleLog[]> {
    return await db
      .select()
      .from(battleLogs)
      .where(eq(battleLogs.userId, userId))
      .orderBy(desc(battleLogs.timestamp))
      .limit(limit);
  }

  // Game state operations
  async getGameState(userId: string): Promise<GameState | undefined> {
    const [state] = await db.select().from(gameState).where(eq(gameState.userId, userId));
    return state;
  }

  async upsertGameState(userId: string, state: Partial<InsertGameState>): Promise<GameState> {
    const [updatedState] = await db
      .insert(gameState)
      .values({ userId, ...state })
      .onConflictDoUpdate({
        target: gameState.userId,
        set: {
          ...state,
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
      })
      .returning();
    return updatedState;
  }

  // Capture operations
  async logCapturedEncounter(data: any): Promise<any> {
    // For now, return mock data since we need to implement the captured encounters table
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      capturedAt: new Date(),
    };
  }

  async getCapturedEncounter(userId: string, encounterId: number): Promise<any> {
    // For now, return mock data since we need to implement the captured encounters table
    return {
      id: encounterId,
      userId,
      encounterId,
      captureMethod: 'Standard Capture',
      captureLocation: 'Unknown',
      successRate: 50,
      capturedAt: new Date(),
    };
  }

  // Crafting operations
  async getCraftingRecipes(): Promise<CraftingRecipe[]> {
    return await db.select().from(craftingRecipes);
  }

  async getCraftingRecipesByCategory(category: string): Promise<CraftingRecipe[]> {
    return await db.select().from(craftingRecipes).where(eq(craftingRecipes.category, category));
  }

  async getCraftingRecipe(id: number): Promise<CraftingRecipe | undefined> {
    const [recipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    return recipe;
  }

  async createCraftedItem(item: InsertCraftedItem): Promise<CraftedItem> {
    const [craftedItem] = await db.insert(craftedItems).values(item).returning();
    return craftedItem;
  }

  async getCraftedItemsByUserId(userId: string): Promise<CraftedItem[]> {
    return await db.select().from(craftedItems).where(eq(craftedItems.userId, userId));
  }

  async getCraftedItem(id: number): Promise<CraftedItem | undefined> {
    const [item] = await db.select().from(craftedItems).where(eq(craftedItems.id, id));
    return item;
  }

  async updateCraftedItem(id: number, updates: Partial<CraftedItem>): Promise<CraftedItem> {
    const [updatedItem] = await db.update(craftedItems)
      .set(updates)
      .where(eq(craftedItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteCraftedItem(id: number): Promise<void> {
    await db.delete(craftedItems).where(eq(craftedItems.id, id));
  }

  async equipItem(itemId: number, petId: number): Promise<CraftedItem> {
    const [equippedItem] = await db.update(craftedItems)
      .set({ equippedToPetId: petId })
      .where(eq(craftedItems.id, itemId))
      .returning();
    return equippedItem;
  }

  async unequipItem(itemId: number): Promise<CraftedItem> {
    const [unequippedItem] = await db.update(craftedItems)
      .set({ equippedToPetId: null })
      .where(eq(craftedItems.id, itemId))
      .returning();
    return unequippedItem;
  }

  // Crafting queue operations
  async addToCraftingQueue(item: InsertCraftingQueue): Promise<CraftingQueue> {
    const [queueItem] = await db.insert(craftingQueue).values(item).returning();
    return queueItem;
  }

  async getCraftingQueue(userId: string): Promise<CraftingQueue[]> {
    return await db.select().from(craftingQueue).where(eq(craftingQueue.userId, userId));
  }

  async updateCraftingQueue(id: number, updates: Partial<CraftingQueue>): Promise<CraftingQueue> {
    const [updatedItem] = await db.update(craftingQueue)
      .set(updates)
      .where(eq(craftingQueue.id, id))
      .returning();
    return updatedItem;
  }

  async completeCraftingQueue(id: number): Promise<CraftingQueue> {
    const [completedItem] = await db.update(craftingQueue)
      .set({ 
        status: "completed",
        completedAt: new Date()
      })
      .where(eq(craftingQueue.id, id))
      .returning();
    return completedItem;
  }

  // Trading operations
  async createTradeOffer(offer: any): Promise<any> {
    const [created] = await db
      .insert(tradeOffers)
      .values({
        fromUserId: offer.fromUserId,
        toUserId: offer.toUserId,
        offeredPets: offer.offeredPets,
        requestedPets: offer.requestedPets,
        offeredCoins: offer.offeredCoins || 0,
        requestedCoins: offer.requestedCoins || 0,
        message: offer.message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      .returning();
    return created;
  }

  async getTradeOffers(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(tradeOffers)
      .where(or(eq(tradeOffers.fromUserId, userId), eq(tradeOffers.toUserId, userId)))
      .orderBy(desc(tradeOffers.createdAt));
  }

  async updateTradeOffer(id: number, updates: any): Promise<any> {
    const [updated] = await db
      .update(tradeOffers)
      .set(updates)
      .where(eq(tradeOffers.id, id))
      .returning();
    return updated;
  }

  async acceptTradeOffer(offerId: number, userId: string): Promise<any> {
    const [offer] = await db
      .select()
      .from(tradeOffers)
      .where(eq(tradeOffers.id, offerId));

    if (!offer || offer.toUserId !== userId) {
      throw new Error("Trade offer not found or unauthorized");
    }

    const fromPets = offer.offeredPets as number[];
    const toPets = offer.requestedPets as number[];

    for (const petId of fromPets) {
      await db
        .update(pets)
        .set({ userId: offer.toUserId })
        .where(eq(pets.id, petId));
    }

    for (const petId of toPets) {
      await db
        .update(pets)
        .set({ userId: offer.fromUserId })
        .where(eq(pets.id, petId));
    }

    return await this.updateTradeOffer(offerId, {
      status: "accepted",
      completedAt: new Date()
    });
  }

  // Pet interactions and AI
  async createPetInteraction(interaction: any): Promise<any> {
    const [created] = await db
      .insert(petInteractions)
      .values(interaction)
      .returning();
    return created;
  }

  async getPetInteractions(petId: number, limit = 50): Promise<any[]> {
    return await db
      .select()
      .from(petInteractions)
      .where(eq(petInteractions.petId, petId))
      .orderBy(desc(petInteractions.timestamp))
      .limit(limit);
  }

  async updatePetPersonality(petId: number, personality: any): Promise<any> {
    const [updated] = await db
      .update(pets)
      .set({ personality })
      .where(eq(pets.id, petId))
      .returning();
    return updated;
  }

  // Social features
  async createFriendship(userId: string, friendId: string): Promise<any> {
    const [created] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: "pending"
      })
      .returning();
    return created;
  }

  async getFriends(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(friendships)
      .where(and(
        or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
        eq(friendships.status, "accepted")
      ));
  }

  async updateFriendshipStatus(id: number, status: string): Promise<any> {
    const [updated] = await db
      .update(friendships)
      .set({ 
        status,
        acceptedAt: status === "accepted" ? new Date() : undefined
      })
      .where(eq(friendships.id, id))
      .returning();
    return updated;
  }

  // Store and monetization
  async getStoreItems(): Promise<any[]> {
    return await db
      .select()
      .from(storeItems)
      .where(eq(storeItems.isActive, true))
      .orderBy(storeItems.category, storeItems.price);
  }

  async createPurchase(purchase: any): Promise<any> {
    const [created] = await db
      .insert(purchases)
      .values(purchase)
      .returning();
    return created;
  }

  async getUserPurchases(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));
  }

  // Daily rewards and activities
  async claimDailyReward(userId: string): Promise<any> {
    const today = new Date().toDateString();
    const existingClaim = await db
      .select()
      .from(dailyRewards)
      .where(eq(dailyRewards.userId, userId))
      .where(sql`DATE(claimed_at) = ${today}`)
      .limit(1);

    if (existingClaim.length > 0) {
      throw new Error("Daily reward already claimed today");
    }

    const lastClaim = await db
      .select()
      .from(dailyRewards)
      .where(eq(dailyRewards.userId, userId))
      .orderBy(desc(dailyRewards.claimedAt))
      .limit(1);

    let day = 1;
    if (lastClaim.length > 0) {
      const lastClaimDate = new Date(lastClaim[0].claimedAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClaimDate.toDateString() === yesterday.toDateString()) {
        day = lastClaim[0].day + 1;
      }
    }

    const rewardData = this.generateDailyReward(day);
    
    const [reward] = await db
      .insert(dailyRewards)
      .values({
        userId,
        day,
        rewardType: rewardData.type,
        rewardData: rewardData.data
      })
      .returning();

    return reward;
  }

  async getUserActivities(userId: string, limit = 100): Promise<any[]> {
    return await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.timestamp))
      .limit(limit);
  }

  async logUserActivity(activity: any): Promise<any> {
    const [logged] = await db
      .insert(userActivities)
      .values(activity)
      .returning();
    return logged;
  }

  // Breeding operations
  async createBreedingSession(session: InsertBreedingSession): Promise<BreedingSession> {
    const [created] = await db
      .insert(breedingSessions)
      .values(session)
      .returning();
    return created;
  }

  async getBreedingSessions(userId: string): Promise<BreedingSession[]> {
    return await db
      .select()
      .from(breedingSessions)
      .where(eq(breedingSessions.userId, userId))
      .orderBy(desc(breedingSessions.createdAt));
  }

  async updateBreedingSession(id: number, updates: Partial<BreedingSession>): Promise<BreedingSession> {
    const [updated] = await db
      .update(breedingSessions)
      .set(updates)
      .where(eq(breedingSessions.id, id))
      .returning();
    return updated;
  }

  async completeBreedingSession(id: number, offspringId: number): Promise<BreedingSession> {
    const [completed] = await db
      .update(breedingSessions)
      .set({
        breedingStatus: 'completed',
        breedingCompletedAt: new Date(),
        offspringId: offspringId
      })
      .where(eq(breedingSessions.id, id))
      .returning();
    return completed;
  }

  private generateDailyReward(day: number): { type: string; data: any } {
    const rewards = [
      { type: "coins", data: { amount: 50 } },
      { type: "gems", data: { amount: 5 } },
      { type: "coins", data: { amount: 75 } },
      { type: "item", data: { itemId: 1, quantity: 1 } },
      { type: "coins", data: { amount: 100 } },
      { type: "gems", data: { amount: 10 } },
      { type: "special", data: { itemId: "premium_egg", quantity: 1 } }
    ];

    const rewardIndex = (day - 1) % rewards.length;
    return rewards[rewardIndex];
  }
}

export const storage = new DatabaseStorage();
