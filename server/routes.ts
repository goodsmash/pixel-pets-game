import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { petAI } from "./petPersonality";
import { generatePetImage, generateRandomPet } from "./geminiGenerator";
import { generateRandomEncounter, generateRandomItem } from "./encounterGenerator";
import { insertPetSchema, insertInventoryItemSchema, insertExplorationLogSchema, insertBattleLogSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Test DALL-E generation endpoint
  app.post("/api/test-dalle", async (req, res) => {
    try {
      const testPetData = {
        name: "Test Dragon",
        color: "crimson",
        size: "medium",
        type: "dragon",
        element: "fire",
        rarity: "legendary",
        personality: "fierce",
        specialFeatures: ["glowing scales", "crystal wings"],
        habitat: "volcanic",
        pattern: "striped",
        aura: "fiery",
        birthmark: "star",
        eyeType: "glowing",
        wingType: "crystal",
        tailType: "spiked",
        furTexture: "scales",
        scale: "dragon",
        horn: "curved",
        abilities: ["fire breath", "flight"],
        attack: 85,
        defense: 70,
        speed: 75,
        intelligence: 80,
        luck: 65
      };
      
      const testHash = "a1b2c3d4e5f6789012345678901234567890abcdef";
      const imageUrl = await generatePetImage(testPetData, testHash);
      
      res.json({ 
        success: true, 
        imageUrl, 
        petData: testPetData,
        message: "DALL-E generation successful" 
      });
    } catch (error: any) {
      console.error("DALL-E test error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        message: "DALL-E generation failed"
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Pet routes
  app.post('/api/pets/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Create SHA-256 hash for consistency
      const timestamp = Date.now().toString();
      const randomSeed = Math.random().toString();
      const sha256Hash = crypto.createHash('sha256').update(userId + timestamp + randomSeed).digest('hex');
      
      // Generate pet attributes using SHA-256 hash for deterministic generation
      const petData = generateRandomPet(sha256Hash);
      
      // Check if pet with this hash already exists
      const existingPet = await storage.getPetByHash(sha256Hash);
      if (existingPet) {
        return res.json(existingPet);
      }
      
      // Generate pet image using OpenAI DALL-E
      const imageUrl = await generatePetImage(petData, sha256Hash);
      
      // Create pet in database with all comprehensive attributes
      const newPet = await storage.createPet({
        userId,
        name: petData.name,
        sha256Hash,
        imageUrl,
        color: petData.color,
        size: petData.size,
        type: petData.type,
        element: petData.element,
        rarity: petData.rarity,
        personality: petData.personality,
        habitat: petData.habitat,
        pattern: petData.pattern,
        aura: petData.aura,
        birthmark: petData.birthmark,
        eyeType: petData.eyeType,
        wingType: petData.wingType,
        tailType: petData.tailType,
        furTexture: petData.furTexture,
        scale: petData.scale,
        horn: petData.horn,
        specialFeatures: petData.specialFeatures,
        abilities: petData.abilities,
        attack: petData.attack,
        defense: petData.defense,
        speed: petData.speed,
        intelligence: petData.intelligence,
        luck: petData.luck,
      });
      
      // Set as active pet if no active pet exists
      const gameStateData = await storage.getGameState(userId);
      if (!gameStateData?.activePetId) {
        await storage.upsertGameState(userId, { activePetId: newPet.id });
      }
      
      res.json(newPet);
    } catch (error) {
      console.error("Error generating pet:", error);
      res.status(500).json({ message: "Failed to generate pet" });
    }
  });

  app.get('/api/pets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pets = await storage.getPetsByUserId(userId);
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.get('/api/pets/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activePet = await storage.getActivePet(userId);
      res.json(activePet);
    } catch (error) {
      console.error("Error fetching active pet:", error);
      res.status(500).json({ message: "Failed to fetch active pet" });
    }
  });

  app.patch('/api/pets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      const updates = req.body;
      
      // Verify pet belongs to user
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).json({ message: "Failed to update pet" });
    }
  });

  // Generate image for existing pet
  app.post('/api/pets/:id/generate-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      // Get the pet to ensure it belongs to the user
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      if (pet.imageUrl) {
        return res.json({ message: "Pet already has an image", imageUrl: pet.imageUrl });
      }
      
      console.log(`Generating image for pet ${petId} with hash ${pet.sha256Hash}`);
      
      // Create pet attributes for image generation
      const petData = {
        name: pet.name,
        color: pet.color,
        size: pet.size,
        type: pet.type,
        element: pet.element,
        rarity: pet.rarity || "Common",
        personality: String(pet.personality || "Friendly"),
        specialFeatures: Array.isArray(pet.specialFeatures) ? pet.specialFeatures : [],
        habitat: "mystical",
        pattern: "solid",
        aura: "none",
        birthmark: "none",
        eyeType: "normal",
        wingType: "none",
        tailType: "normal",
        furTexture: "smooth",
        scale: "none",
        horn: "none",
        abilities: Array.isArray(pet.abilities) ? pet.abilities : [],
        attack: 50,
        defense: 50,
        speed: 50,
        intelligence: 50,
        luck: 50
      };
      
      // Generate image using OpenAI DALL-E
      const imageUrl = await generatePetImage(petData as any, pet.sha256Hash);
      
      // Update pet with generated image URL
      const updatedPet = await storage.updatePet(petId, { imageUrl });
      
      console.log(`Successfully generated and saved image for pet ${petId}`);
      res.json({ message: "Image generated successfully", imageUrl, pet: updatedPet });
      
    } catch (error) {
      console.error("Error generating pet image:", error);
      res.status(500).json({ message: "Failed to generate pet image", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Pet Breeding endpoints
  app.get('/api/breeding/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get breeding sessions from database
      const breedingSessions = await storage.getBreedingSessions(userId);
      
      // Update session progress
      const updatedSessions = [];
      for (const session of breedingSessions) {
        if (session.breedingStatus === 'active') {
          const now = Date.now();
          const startTime = new Date(session.breedingStartedAt).getTime();
          const breedingDuration = 24 * 60 * 60 * 1000; // 24 hours
          const timeElapsed = now - startTime;
          
          if (timeElapsed >= breedingDuration) {
            const updatedSession = await storage.updateBreedingSession(session.id, {
              breedingStatus: 'completed',
              breedingCompletedAt: new Date()
            });
            updatedSessions.push(updatedSession);
          } else {
            updatedSessions.push(session);
          }
        } else {
          updatedSessions.push(session);
        }
      }
      
      res.json(updatedSessions);
    } catch (error) {
      console.error("Error fetching breeding sessions:", error);
      res.status(500).json({ message: "Failed to fetch breeding sessions" });
    }
  });

  app.post('/api/breeding/breed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { parentOneId, parentTwoId } = req.body;
      
      // Validate parents exist and belong to user
      const pets = await storage.getPetsByUserId(userId);
      const parentOne = pets.find(p => p.id === parentOneId);
      const parentTwo = pets.find(p => p.id === parentTwoId);
      
      if (!parentOne || !parentTwo) {
        return res.status(400).json({ message: "Invalid parent pets" });
      }
      
      // Check breeding eligibility
      if ((parentOne.level || 0) < 5 || (parentTwo.level || 0) < 5) {
        return res.status(400).json({ message: "Pets must be level 5 or higher to breed" });
      }
      
      if ((parentOne.breedingCount || 0) >= (parentOne.maxBreedingCount || 3) || 
          (parentTwo.breedingCount || 0) >= (parentTwo.maxBreedingCount || 3)) {
        return res.status(400).json({ message: "One or both pets have reached breeding limit" });
      }
      
      // Calculate breeding cost
      const baseCost = 100;
      const rarityMultiplier = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5, mythic: 8, transcendent: 12 };
      const cost = Math.floor((baseCost * (rarityMultiplier[parentOne.rarity as keyof typeof rarityMultiplier] || 1) + baseCost * (rarityMultiplier[parentTwo.rarity as keyof typeof rarityMultiplier] || 1)) / 2);
      
      // Check user has enough coins
      const gameState = await storage.getGameState(userId);
      if (!gameState || (gameState.coins || 0) < cost) {
        return res.status(400).json({ message: "Insufficient coins" });
      }
      
      // Deduct coins and update breeding counts
      await storage.upsertGameState(userId, { coins: (gameState.coins || 0) - cost });
      await storage.updatePet(parentOneId, { breedingCount: (parentOne.breedingCount || 0) + 1 });
      await storage.updatePet(parentTwoId, { breedingCount: (parentTwo.breedingCount || 0) + 1 });
      
      // Create breeding session
      const breedingSessionData = {
        userId,
        parentOneId,
        parentTwoId,
        breedingCost: cost,
        successRate: Math.min(95, 75 + (parentOne.element === parentTwo.element ? 10 : 0)),
        breedingStatus: 'active' as const
      };
      
      // Store breeding session in database
      const breedingSession = await storage.createBreedingSession(breedingSessionData);
      
      res.json({ message: "Breeding started successfully", session: breedingSession });
    } catch (error) {
      console.error("Error starting breeding:", error);
      res.status(500).json({ message: "Failed to start breeding" });
    }
  });

  app.post('/api/breeding/claim/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      
      // Get breeding sessions
      const gameState = await storage.getGameState(userId);
      const breedingSessions = (gameState as any)?.breedingSessions || [];
      const session = breedingSessions.find((s: any) => s.id === sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Breeding session not found" });
      }
      
      if (session.breedingStatus !== 'completed') {
        return res.status(400).json({ message: "Breeding not yet completed" });
      }
      
      if (session.offspringId) {
        return res.status(400).json({ message: "Offspring already claimed" });
      }
      
      // Get parent pets for trait inheritance
      const pets = await storage.getPetsByUserId(userId);
      const parentOne = pets.find(p => p.id === session.parentOneId);
      const parentTwo = pets.find(p => p.id === session.parentTwoId);
      
      if (!parentOne || !parentTwo) {
        return res.status(400).json({ message: "Parent pets not found" });
      }
      
      // Generate offspring pet using breeding logic
      const breedingHash = `${sessionId}-${Date.now()}`;
      const { generateBreedingOffspring, generatePetImage } = require('./geminiGenerator');
      
      // Create offspring with inherited traits from both parents
      const offspring = generateBreedingOffspring(parentOne, parentTwo, breedingHash);
      
      // Generate image for the offspring
      let offspringImageUrl = null;
      try {
        offspringImageUrl = await generatePetImage(offspring, breedingHash);
      } catch (imageError) {
        console.warn('Failed to generate offspring image:', imageError);
      }
      
      // Apply trait inheritance
      const inheritedTraits = {
        // Mix elements (70% chance of parent element, 30% chance of new)
        element: Math.random() < 0.7 ? (Math.random() < 0.5 ? parentOne.element : parentTwo.element) : offspring.element,
        // Average stats with some randomness
        attack: Math.floor((parentOne.attack + parentTwo.attack) / 2 + (Math.random() * 20 - 10)),
        defense: Math.floor((parentOne.defense + parentTwo.defense) / 2 + (Math.random() * 20 - 10)),
        speed: Math.floor((parentOne.speed + parentTwo.speed) / 2 + (Math.random() * 20 - 10)),
        intelligence: Math.floor((parentOne.intelligence + parentTwo.intelligence) / 2 + (Math.random() * 20 - 10)),
        // Generation is max parent generation + 1
        generation: Math.max(parentOne.generation || 1, parentTwo.generation || 1) + 1,
        // Inherit some traits
        color: Math.random() < 0.5 ? parentOne.color : parentTwo.color,
        size: Math.random() < 0.5 ? parentOne.size : parentTwo.size
      };
      
      // Create the offspring pet
      const offspringPet = await storage.createPet({
        userId,
        name: offspring.name,
        petType: offspring.type,
        rarity: offspring.rarity,
        element: inheritedTraits.element,
        color: inheritedTraits.color,
        size: inheritedTraits.size,
        attack: Math.max(1, inheritedTraits.attack),
        defense: Math.max(1, inheritedTraits.defense),
        speed: Math.max(1, inheritedTraits.speed),
        intelligence: Math.max(1, inheritedTraits.intelligence),
        generation: inheritedTraits.generation,
        level: 1,
        experience: 0,
        happiness: 100,
        health: 100,
        maxHealth: 100,
        energy: 100,
        specialAbilities: offspring.abilities,
        personality: offspring.personality,
        imageUrl: null // Will be generated later
      });
      
      // Update breeding session with offspring ID
      const updatedSessions = breedingSessions.map((s: any) => 
        s.id === sessionId ? { ...s, offspringId: offspringPet.id } : s
      );
      
      await storage.upsertGameState(userId, { breedingSessions: updatedSessions });
      
      res.json({ 
        message: "Offspring claimed successfully", 
        offspring: offspringPet 
      });
    } catch (error) {
      console.error("Error claiming breeding:", error);
      res.status(500).json({ message: "Failed to claim breeding" });
    }
  });

  // Battle System endpoints
  app.post('/api/battle/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { petId, opponentType, difficulty } = req.body;
      
      // Get user's pet
      const pets = await storage.getPetsByUserId(userId);
      const userPet = pets.find(p => p.id === petId);
      
      if (!userPet) {
        return res.status(400).json({ message: "Pet not found" });
      }
      
      if ((userPet.health || 0) <= 0) {
        return res.status(400).json({ message: "Pet must be healthy to battle" });
      }
      
      // Generate opponent based on type and difficulty
      const { generateRandomEncounter } = require('./encounterGenerator');
      const opponent = await generateRandomEncounter('battle', `${userId}-${Date.now()}`);
      
      // Calculate battle stats
      const userStats = {
        attack: userPet.attack || 50,
        defense: userPet.defense || 50,
        speed: userPet.speed || 50,
        health: userPet.health || 100,
        level: userPet.level || 1
      };
      
      const difficultyMultiplier = { easy: 0.8, medium: 1.0, hard: 1.3, expert: 1.6 }[difficulty] || 1.0;
      const opponentStats = {
        attack: Math.floor((opponent.stats?.attack || 45) * difficultyMultiplier),
        defense: Math.floor((opponent.stats?.defense || 45) * difficultyMultiplier),
        speed: Math.floor((opponent.stats?.speed || 45) * difficultyMultiplier),
        health: Math.floor((opponent.stats?.health || 80) * difficultyMultiplier),
        level: Math.floor((opponent.level || 1) * difficultyMultiplier)
      };
      
      // Create battle session
      const battleSession = {
        id: Date.now(),
        userId,
        petId,
        opponent: {
          name: opponent.name,
          type: opponent.type,
          element: opponent.element,
          rarity: opponent.rarity,
          stats: opponentStats
        },
        userStats,
        battleStatus: 'active',
        turn: userStats.speed >= opponentStats.speed ? 'user' : 'opponent',
        battleLog: [],
        startedAt: new Date().toISOString()
      };
      
      res.json({ battle: battleSession });
    } catch (error) {
      console.error("Error starting battle:", error);
      res.status(500).json({ message: "Failed to start battle" });
    }
  });

  app.post('/api/battle/:battleId/action', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const battleId = parseInt(req.params.battleId);
      const { action, moveType } = req.body;
      
      // Mock battle logic for now - will implement full battle system
      res.json({ 
        message: "Battle action processed",
        battleStatus: 'active',
        turn: 'opponent'
      });
    } catch (error) {
      console.error("Error processing battle action:", error);
      res.status(500).json({ message: "Failed to process battle action" });
    }
  });

  app.get('/api/battle/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Return empty array for now - will implement battle persistence
      res.json([]);
    } catch (error) {
      console.error("Error fetching active battles:", error);
      res.status(500).json({ message: "Failed to fetch active battles" });
    }
  });

  // Trading System endpoints
  app.get('/api/trading/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tradeOffers = await storage.getTradeOffers(userId);
      res.json(tradeOffers);
    } catch (error) {
      console.error("Error fetching trade offers:", error);
      res.status(500).json({ message: "Failed to fetch trade offers" });
    }
  });

  app.post('/api/trading/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { offerType, itemId, requestedItems, description } = req.body;
      
      const tradeOffer = await storage.createTradeOffer({
        userId,
        offerType,
        itemId,
        requestedItems: JSON.stringify(requestedItems),
        description,
        status: 'active',
        createdAt: new Date()
      });
      
      res.json(tradeOffer);
    } catch (error) {
      console.error("Error creating trade offer:", error);
      res.status(500).json({ message: "Failed to create trade offer" });
    }
  });

  app.post('/api/trading/:offerId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offerId = parseInt(req.params.offerId);
      
      const result = await storage.acceptTradeOffer(offerId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error accepting trade offer:", error);
      res.status(500).json({ message: "Failed to accept trade offer" });
    }
  });

  // Social Features endpoints
  app.get('/api/social/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post('/api/social/add-friend', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.body;
      
      const friendship = await storage.createFriendship(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error adding friend:", error);
      res.status(500).json({ message: "Failed to add friend" });
    }
  });

  // Daily Rewards endpoints
  app.post('/api/rewards/claim-daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reward = await storage.claimDailyReward(userId);
      res.json(reward);
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      res.status(500).json({ message: "Failed to claim daily reward" });
    }
  });

  app.get('/api/activities/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getUserActivities(userId, 20);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Pet management endpoints
  app.post('/api/pets/:id/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      const { isFavorite } = req.body;
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updatedPet = await storage.updatePet(petId, { isFavorite });
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet favorite:", error);
      res.status(500).json({ message: "Failed to update pet favorite" });
    }
  });

  app.post('/api/pets/:id/heal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const healingCost = 50;
      const gameState = await storage.getGameState(userId);
      
      if ((gameState?.coins || 0) < healingCost) {
        return res.status(400).json({ message: "Insufficient coins for healing" });
      }
      
      await storage.upsertGameState(userId, { coins: (gameState?.coins || 0) - healingCost });
      const updatedPet = await storage.updatePet(petId, { 
        health: pet.maxHealth || 100,
        energy: 100 
      });
      
      res.json({ pet: updatedPet, cost: healingCost });
    } catch (error) {
      console.error("Error healing pet:", error);
      res.status(500).json({ message: "Failed to heal pet" });
    }
  });

  // Pet Evolution System
  app.post('/api/pets/:id/evolve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Check evolution requirements
      const requiredLevel = 10;
      const evolutionCost = 500;
      
      if ((pet.level || 0) < requiredLevel) {
        return res.status(400).json({ message: `Pet must be level ${requiredLevel} to evolve` });
      }
      
      const gameState = await storage.getGameState(userId);
      if ((gameState?.coins || 0) < evolutionCost) {
        return res.status(400).json({ message: "Insufficient coins for evolution" });
      }
      
      // Evolve pet - increase stats and rarity
      const rarityUpgrade = {
        common: 'uncommon',
        uncommon: 'rare', 
        rare: 'epic',
        epic: 'legendary',
        legendary: 'mythic',
        mythic: 'transcendent'
      };
      
      const newRarity = rarityUpgrade[pet.rarity as keyof typeof rarityUpgrade] || pet.rarity;
      const statBoost = 1.5;
      
      await storage.upsertGameState(userId, { coins: (gameState?.coins || 0) - evolutionCost });
      const evolvedPet = await storage.updatePet(petId, {
        rarity: newRarity,
        attack: Math.floor((pet.attack || 0) * statBoost),
        defense: Math.floor((pet.defense || 0) * statBoost),
        speed: Math.floor((pet.speed || 0) * statBoost),
        intelligence: Math.floor((pet.intelligence || 0) * statBoost),
        maxHealth: Math.floor((pet.maxHealth || 100) * statBoost),
        health: Math.floor((pet.maxHealth || 100) * statBoost)
      });
      
      res.json({ pet: evolvedPet, cost: evolutionCost });
    } catch (error) {
      console.error("Error evolving pet:", error);
      res.status(500).json({ message: "Failed to evolve pet" });
    }
  });

  // Store/Marketplace System
  app.get('/api/store/items', isAuthenticated, async (req: any, res) => {
    try {
      const storeItems = await storage.getStoreItems();
      res.json(storeItems);
    } catch (error) {
      console.error("Error fetching store items:", error);
      res.status(500).json({ message: "Failed to fetch store items" });
    }
  });

  app.post('/api/store/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId, quantity = 1 } = req.body;
      
      const purchase = await storage.createPurchase({
        userId,
        itemId,
        quantity,
        purchaseDate: new Date()
      });
      
      res.json(purchase);
    } catch (error) {
      console.error("Error making purchase:", error);
      res.status(500).json({ message: "Failed to make purchase" });
    }
  });

  app.get('/api/store/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/pets/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      const { notes } = req.body;
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updatedPet = await storage.updatePet(petId, { notes });
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet notes:", error);
      res.status(500).json({ message: "Failed to update pet notes" });
    }
  });

  app.post('/api/pets/:id/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      const { tags } = req.body;
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updatedPet = await storage.updatePet(petId, { tags });
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet tags:", error);
      res.status(500).json({ message: "Failed to update pet tags" });
    }
  });

  // Pet actions
  app.post('/api/pets/:id/feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updates = {
        hunger: Math.min(100, (pet.hunger || 50) + 20),
        happiness: Math.min(100, (pet.happiness || 50) + 5),
        energy: Math.max(0, (pet.energy || 100) - 5),
      };
      
      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);
    } catch (error) {
      console.error("Error feeding pet:", error);
      res.status(500).json({ message: "Failed to feed pet" });
    }
  });

  app.post('/api/pets/:id/play', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet || (pet.energy || 100) < 10) {
        return res.status(400).json({ message: "Pet is too tired to play" });
      }
      
      const expGain = Math.floor(Math.random() * 15) + 5;
      const updates = {
        energy: Math.max(0, (pet.energy || 100) - 10),
        happiness: Math.min(100, (pet.happiness || 50) + 15),
        experience: (pet.experience || 0) + expGain,
      };
      
      const updatedPet = await storage.updatePet(petId, updates);
      res.json({ pet: updatedPet, experienceGained: expGain });
    } catch (error) {
      console.error("Error playing with pet:", error);
      res.status(500).json({ message: "Failed to play with pet" });
    }
  });

  app.post('/api/pets/:id/train', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet || (pet.energy || 100) < 20) {
        return res.status(400).json({ message: "Pet is too tired to train" });
      }
      
      const expGain = Math.floor(Math.random() * 25) + 15;
      const updates = {
        energy: Math.max(0, (pet.energy || 100) - 20),
        experience: (pet.experience || 0) + expGain,
      };
      
      const updatedPet = await storage.updatePet(petId, updates);
      res.json({ pet: updatedPet, experienceGained: expGain });
    } catch (error) {
      console.error("Error training pet:", error);
      res.status(500).json({ message: "Failed to train pet" });
    }
  });

  app.post('/api/pets/:id/rest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const petId = parseInt(req.params.id);
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updates = {
        energy: Math.min(100, (pet.energy || 100) + 30),
        health: Math.min((pet.maxHealth || 100), (pet.health || 100) + 20),
        hunger: Math.max(0, (pet.hunger || 50) - 5),
      };
      
      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);
    } catch (error) {
      console.error("Error resting pet:", error);
      res.status(500).json({ message: "Failed to rest pet" });
    }
  });

  // Enhanced Exploration routes with Google Gemini
  app.post('/api/explore', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { environment } = req.body;
      
      const activePet = await storage.getActivePet(userId);
      if (!activePet) {
        return res.status(400).json({ message: "No active pet found" });
      }
      
      if ((activePet.energy || 100) < 15) {
        return res.status(400).json({ message: "Pet is too tired to explore" });
      }
      
      // Generate comprehensive encounter with SHA-256 hash
      const explorationHash = crypto.createHash('sha256')
        .update(`${userId}-${environment}-${Date.now()}-${Math.random()}`)
        .digest('hex');

      const encounters = [
        { type: 'loot', weight: 35 },
        { type: 'battle', weight: 25 },
        { type: 'treasure', weight: 20 },
        { type: 'event', weight: 15 },
        { type: 'discovery', weight: 5 }
      ];
      
      const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      let encounterType = 'loot';
      
      for (const encounter of encounters) {
        random -= encounter.weight;
        if (random <= 0) {
          encounterType = encounter.type;
          break;
        }
      }
      
      // Generate encounter data based on type
      let encounterData: any = {};
      let result: any = {};
      let experienceGained = 0;
      
      switch (encounterType) {
        case 'loot':
          // Use procedural generation for authentic loot
          const generatedItem = generateRandomItem(environment, explorationHash);
          encounterData = generatedItem;
          result = { success: true, itemFound: generatedItem };
          experienceGained = Math.floor(Math.random() * 15) + 5;
          
          // Add authentic procedural item to inventory
          await storage.addInventoryItem({
            userId,
            itemType: generatedItem.category,
            itemName: generatedItem.name,
            itemId: generatedItem.id || generatedItem.name,
            quantity: generatedItem.quantity,
          });
          break;
          
        case 'battle':
          const encounterHash = crypto.randomBytes(16).toString('hex');
          const creatureEncounter = await generateRandomEncounter(environment, encounterHash);
          encounterData = creatureEncounter;
          result = { 
            battleInitiated: true, 
            enemy: {
              name: creatureEncounter.name,
              health: creatureEncounter.health,
              maxHealth: creatureEncounter.health,
              difficulty: creatureEncounter.rarity,
              element: creatureEncounter.element,
              abilities: creatureEncounter.abilities,
              specialFeatures: creatureEncounter.specialFeatures
            }
          };
          experienceGained = creatureEncounter.experienceReward;
          break;
          
        case 'treasure':
          const treasureTypes = [
            'Ancient Chest', 'Mystical Vault', 'Dragon Hoard', 'Pirate Cache',
            'Royal Treasury', 'Wizard Stash', 'Forgotten Shrine', 'Crystal Cave'
          ];
          const treasureType = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
          
          const baseCoins = environment === 'mountain' ? 200 : environment === 'city' ? 150 : 
                           environment === 'beach' ? 120 : 100;
          const coinMultiplier = Math.random() * 2 + 0.5;
          const coinsFound = Math.floor(baseCoins * coinMultiplier);
          
          const bonusItems = [];
          const bonusChance = Math.random();
          
          if (bonusChance > 0.7) {
            const bonusItem = generateRandomItem(environment, explorationHash + '-bonus');
            bonusItems.push(bonusItem);
            
            await storage.addInventoryItem({
              userId,
              itemType: bonusItem.category,
              itemName: bonusItem.name,
              itemId: bonusItem.id || bonusItem.name,
              quantity: bonusItem.quantity,
            });
          }
          
          encounterData = { 
            treasureType, 
            coinsFound, 
            bonusItems,
            description: `Discovered a ${treasureType.toLowerCase()} containing ${coinsFound} gold coins${bonusItems.length > 0 ? ` and a ${bonusItems[0].name}` : ''}`
          };
          result = { coinsFound, bonusItems };
          experienceGained = Math.floor(Math.random() * 30) + 15;
          
          const currentGameState = await storage.getGameState(userId);
          await storage.upsertGameState(userId, {
            coins: (currentGameState?.coins || 1000) + coinsFound
          });
          break;
          
        case 'event':
          const eventTypes = [
            {
              name: 'Mystical Portal',
              description: 'Discovered a shimmering portal that enhanced your pet\'s magical abilities',
              effect: 'magic_boost'
            },
            {
              name: 'Ancient Shrine',
              description: 'Found a sacred shrine that blessed your pet with wisdom',
              effect: 'experience_boost'
            },
            {
              name: 'Healing Spring',
              description: 'Located a magical spring that restored your pet\'s vitality',
              effect: 'full_restore'
            },
            {
              name: 'Friendly Merchant',
              description: 'Met a traveling merchant who offered rare goods',
              effect: 'item_trade'
            },
            {
              name: 'Weather Blessing',
              description: `The spirits of the ${environment} blessed your journey`,
              effect: 'environment_bonus'
            }
          ];
          
          const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          encounterData = event;
          result = { specialEvent: event.effect };
          experienceGained = Math.floor(Math.random() * 35) + 20;
          
          if (event.effect === 'full_restore') {
            await storage.updatePet(activePet.id, {
              health: activePet.maxHealth || 100,
              energy: 100,
              happiness: Math.min(100, (activePet.happiness || 50) + 25)
            });
          }
          break;
          
        case 'discovery':
          const discoveries = [
            {
              name: 'Rare Mineral Vein',
              description: 'Discovered a vein of rare crystals with magical properties',
              reward: 'materials'
            },
            {
              name: 'Ancient Runes',
              description: 'Found mysterious runes that revealed secret knowledge',
              reward: 'knowledge'
            },
            {
              name: 'Hidden Cave System',
              description: 'Uncovered a network of unexplored caves',
              reward: 'location'
            }
          ];
          
          const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
          encounterData = discovery;
          result = { discovery: discovery.reward };
          experienceGained = Math.floor(Math.random() * 40) + 25;
          
          if (discovery.reward === 'materials') {
            for (let i = 0; i < 2; i++) {
              const material = generateRandomItem(environment, explorationHash + `-material-${i}`);
              await storage.addInventoryItem({
                userId,
                itemType: 'Material',
                itemName: material.name,
                itemId: material.name,
                quantity: 1,
              });
            }
          }
          break;
          
        default:
          encounterData = { description: `Discovered a peaceful clearing in the ${environment}` };
          result = { discovery: true };
          experienceGained = Math.floor(Math.random() * 8) + 2;
      }
      
      // Update pet
      await storage.updatePet(activePet.id, {
        energy: Math.max(0, (activePet.energy || 100) - 15),
        experience: (activePet.experience || 0) + experienceGained,
      });
      
      // Log exploration
      const explorationLog = await storage.logExploration({
        userId,
        petId: activePet.id,
        environment,
        outcome: 'success',
        itemsFound: result,
        experienceGained,
      });
      
      res.json({
        encounter: {
          type: encounterType,
          data: encounterData,
          result,
          experienceGained,
        },
        log: explorationLog,
      });
    } catch (error) {
      console.error("Error during exploration:", error);
      res.status(500).json({ message: "Failed to explore" });
    }
  });

  // Battle routes
  app.post('/api/battle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { enemyName, action } = req.body;
      
      const activePet = await storage.getActivePet(userId);
      if (!activePet) {
        return res.status(400).json({ message: "No active pet found" });
      }
      
      if ((activePet.energy || 100) < 20) {
        return res.status(400).json({ message: "Pet is too tired to battle" });
      }
      
      // Simple battle logic
      const enemyHealth = Math.floor(Math.random() * 100) + 50;
      const petDamage = Math.floor(Math.random() * 30) + 20;
      const enemyDamage = Math.floor(Math.random() * 25) + 15;
      
      const battleResult = petDamage > enemyHealth ? 'victory' : 'defeat';
      const expGained = battleResult === 'victory' ? Math.floor(Math.random() * 50) + 25 : Math.floor(Math.random() * 20) + 5;
      
      // Update pet
      const healthLoss = battleResult === 'defeat' ? enemyDamage : Math.floor(enemyDamage / 2);
      await storage.updatePet(activePet.id, {
        energy: Math.max(0, (activePet.energy || 100) - 20),
        health: Math.max(0, (activePet.health || 100) - healthLoss),
        experience: (activePet.experience || 0) + expGained,
      });
      
      // Log battle
      const battleLog = await storage.logBattle({
        userId,
        petId: activePet.id,
        outcome: battleResult,
        enemyName,
        enemyType: 'wild',
        experienceGained: expGained,
        itemsEarned: battleResult === 'victory' ? [{ name: 'Battle Trophy', type: 'trophy' }] : [],
        battleData: {
          damageDealt: petDamage,
          damageTaken: healthLoss
        }
      });
      
      res.json({
        result: battleResult,
        damageDealt: petDamage,
        damageTaken: healthLoss,
        experienceGained: expGained,
        log: battleLog,
      });
    } catch (error) {
      console.error("Error during battle:", error);
      res.status(500).json({ message: "Failed to battle" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inventory = await storage.getInventoryByUserId(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Game state routes
  app.get('/api/game-state', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let gameStateData = await storage.getGameState(userId);
      
      if (!gameStateData) {
        // Initialize game state for new user
        gameStateData = await storage.upsertGameState(userId, {
          coins: 1000,
          currentEnvironment: 'forest',
          unlockedEnvironments: ['forest'],
          achievements: [],
          settings: {},
        });
      }
      
      res.json(gameStateData);
    } catch (error) {
      console.error("Error fetching game state:", error);
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  app.patch('/api/game-state', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const updatedState = await storage.upsertGameState(userId, updates);
      res.json(updatedState);
    } catch (error) {
      console.error("Error updating game state:", error);
      res.status(500).json({ message: "Failed to update game state" });
    }
  });

  // Capture encounter system
  app.post('/api/encounters/capture/:encounterId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { encounterId } = req.params;
      const { encounterData, captureMethod } = req.body;

      const activePet = await storage.getActivePet(userId);
      if (!activePet) {
        return res.status(400).json({ message: "No active pet found" });
      }

      // Calculate capture success rate based on pet stats and encounter rarity
      const baseCaptureRate = encounterData.captureRate || 50;
      const petLuck = (activePet.luck || 50) / 100;
      const rarityModifiers: Record<string, number> = {
        'Common': 1.0, 'Uncommon': 0.8, 'Rare': 0.6, 'Epic': 0.4, 
        'Legendary': 0.2, 'Mythical': 0.1, 'Transcendent': 0.05
      };
      const rarityModifier = rarityModifiers[encounterData.rarity] || 1.0;

      const finalCaptureRate = Math.min(95, baseCaptureRate * rarityModifier * (1 + petLuck));
      const captureSuccess = Math.random() * 100 < finalCaptureRate;

      if (captureSuccess) {
        // Add to captured encounters
        const capturedEncounter = await storage.logCapturedEncounter({
          userId,
          encounterId: parseInt(encounterId),
          captureMethod: captureMethod || 'Standard Capture',
          captureLocation: encounterData.environment || 'Unknown',
          attemptCount: 1,
          successRate: Math.round(finalCaptureRate),
          petUsedId: activePet.id,
        });

        // Award experience for successful capture
        const captureExp = Math.floor(encounterData.experienceReward * 0.5);
        await storage.updatePet(activePet.id, {
          experience: (activePet.experience || 0) + captureExp,
        });

        res.json({
          success: true,
          captureRate: finalCaptureRate,
          experienceGained: captureExp,
          captured: capturedEncounter,
          encounter: encounterData
        });
      } else {
        res.json({
          success: false,
          captureRate: finalCaptureRate,
          message: "Capture attempt failed",
          encounter: encounterData
        });
      }
    } catch (error) {
      console.error("Error capturing encounter:", error);
      res.status(500).json({ message: "Capture attempt failed" });
    }
  });

  // Export encounter details
  app.get('/api/encounters/export/:encounterId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { encounterId } = req.params;
      
      const capturedEncounter = await storage.getCapturedEncounter(userId, parseInt(encounterId));
      if (!capturedEncounter) {
        return res.status(404).json({ message: "Encounter not found in collection" });
      }

      // Generate comprehensive export data
      const exportData = {
        id: capturedEncounter.id,
        encounterId: capturedEncounter.encounterId,
        captureDate: capturedEncounter.capturedAt,
        captureLocation: capturedEncounter.captureLocation,
        captureMethod: capturedEncounter.captureMethod,
        successRate: capturedEncounter.successRate,
        nickname: capturedEncounter.nickname || "Unnamed",
        notes: capturedEncounter.notes || "",
        encounterDetails: {
          // This would fetch the actual encounter data
          name: "Detailed encounter information",
          rarity: "Would be fetched from encounter system",
          abilities: "Full ability list",
          specialFeatures: "Complete feature set",
          stats: "All battle statistics"
        },
        exportedAt: new Date().toISOString(),
        exportedBy: userId
      };

      res.json({
        message: "Encounter exported successfully",
        exportData,
        downloadUrl: `/api/encounters/download/${capturedEncounter.id}`
      });
    } catch (error) {
      console.error("Error exporting encounter:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  // Generate battle scene images
  app.post('/api/battles/generate-scene', isAuthenticated, async (req: any, res) => {
    try {
      const { petData, enemyData, environment } = req.body;
      
      // Create battle scene hash for consistency
      const sceneHash = crypto.createHash('sha256')
        .update(JSON.stringify({ petData, enemyData, environment, timestamp: Date.now() }))
        .digest('hex');

      // Generate battle scene image using Gemini
      const battlePrompt = `Create an epic pixel art battle scene showing:
- Pet: ${petData.name} (${petData.type}) with ${petData.color} coloring
- Enemy: ${enemyData.name} with ${enemyData.element} powers
- Environment: ${environment}
- Style: 16-bit pixel art, dynamic action scene, magical effects
- Both creatures should be in combat poses with their abilities visible`;

      const battleImageUrl = await generatePetImage(
        { 
          ...petData, 
          name: `${petData.name} vs ${enemyData.name}`,
          specialFeatures: [...(petData.specialFeatures || []), 'Battle Stance', 'Combat Aura']
        }, 
        sceneHash
      );

      res.json({
        battleSceneUrl: battleImageUrl,
        sceneHash,
        description: `Epic battle between ${petData.name} and ${enemyData.name} in ${environment}`
      });
    } catch (error) {
      console.error("Error generating battle scene:", error);
      res.status(500).json({ message: "Failed to generate battle scene" });
    }
  });

  // World map with strategic points
  app.get('/api/world/map', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameState = await storage.getGameState(userId);
      
      const worldMap = {
        regions: [
          {
            id: 'enchanted-forest',
            name: 'Enchanted Forest',
            type: 'forest',
            difficulty: 1,
            unlocked: true,
            encounters: ['Forest Sprites', 'Crystal Wolves', 'Ancient Trees'],
            specialFeatures: ['Mystical Groves', 'Hidden Clearings', 'Fairy Circles'],
            coordinates: { x: 100, y: 150 }
          },
          {
            id: 'crystal-caves',
            name: 'Crystal Caves',
            type: 'cave',
            difficulty: 3,
            unlocked: Array.isArray(gameState?.unlockedEnvironments) ? gameState.unlockedEnvironments.includes('crystal-caves') : false,
            encounters: ['Crystal Golems', 'Echo Spirits', 'Gem Dragons'],
            specialFeatures: ['Resonant Crystals', 'Underground Lakes', 'Glowing Formations'],
            coordinates: { x: 200, y: 100 }
          },
          {
            id: 'floating-islands',
            name: 'Floating Islands',
            type: 'sky',
            difficulty: 5,
            unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('floating-islands'),
            encounters: ['Sky Dancers', 'Wind Elementals', 'Star Guardians'],
            specialFeatures: ['Gravity Anomalies', 'Cloud Bridges', 'Celestial Portals'],
            coordinates: { x: 150, y: 50 }
          },
          {
            id: 'temporal-meadows',
            name: 'Temporal Meadows',
            type: 'time',
            difficulty: 7,
            unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('temporal-meadows'),
            encounters: ['Time Sprites', 'Chronos Guardians', 'Reality Weavers'],
            specialFeatures: ['Time Distortions', 'Memory Echoes', 'Future Glimpses'],
            coordinates: { x: 250, y: 200 }
          }
        ],
        playerPosition: gameState?.currentEnvironment || 'enchanted-forest',
        explorationProgress: gameState?.achievements || [],
        availableQuests: [
          'Discover 10 different creature types',
          'Capture a Legendary rarity encounter',
          'Complete exploration in all environments',
          'Win 50 battles'
        ]
      };

      res.json(worldMap);
    } catch (error) {
      console.error("Error fetching world map:", error);
      res.status(500).json({ message: "Failed to load world map" });
    }
  });

  // Crafting routes
  app.get('/api/crafting/recipes', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      let recipes;
      
      if (category && typeof category === 'string') {
        recipes = await storage.getCraftingRecipesByCategory(category);
      } else {
        recipes = await storage.getCraftingRecipes();
      }
      
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching crafting recipes:", error);
      res.status(500).json({ message: "Failed to fetch crafting recipes" });
    }
  });

  app.get('/api/crafting/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      const recipe = await storage.getCraftingRecipe(recipeId);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching crafting recipe:", error);
      res.status(500).json({ message: "Failed to fetch crafting recipe" });
    }
  });

  app.get('/api/crafting/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const items = await storage.getCraftedItemsByUserId(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching crafted items:", error);
      res.status(500).json({ message: "Failed to fetch crafted items" });
    }
  });

  app.post('/api/crafting/craft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { recipeId } = req.body;
      
      const recipe = await storage.getCraftingRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Check if user has required materials
      const userInventory = await storage.getInventoryByUserId(userId);
      const materials = (recipe.requiredItems as any) || [];
      
      for (const material of materials) {
        const userMaterial = userInventory.find(item => 
          item.itemName === material.material && (item.quantity || 0) >= material.quantity
        );
        if (!userMaterial) {
          return res.status(400).json({ 
            message: `Insufficient materials: ${material.material}` 
          });
        }
      }
      
      // Create crafting queue entry
      const queueItem = await storage.addToCraftingQueue({
        userId,
        recipeId,
        craftingTime: recipe.craftingTime || 300,
        status: "in_progress"
      });
      
      res.json(queueItem);
    } catch (error) {
      console.error("Error starting craft:", error);
      res.status(500).json({ message: "Failed to start crafting" });
    }
  });

  app.get('/api/crafting/queue', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const queue = await storage.getCraftingQueue(userId);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching crafting queue:", error);
      res.status(500).json({ message: "Failed to fetch crafting queue" });
    }
  });

  app.post('/api/crafting/complete/:id', isAuthenticated, async (req: any, res) => {
    try {
      const queueId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      
      const queueItem = await storage.updateCraftingQueue(queueId, { status: "completed" });
      
      // Create the crafted item
      const recipe = await storage.getCraftingRecipe(queueItem.recipeId!);
      if (recipe) {
        const craftedItem = await storage.createCraftedItem({
          userId,
          recipeId: recipe.id,
          name: recipe.name,
          category: recipe.category,
          type: recipe.type,
          rarity: recipe.rarity || 'common',
          effects: recipe.effects,
          bonuses: recipe.bonuses
        });
        
        res.json(craftedItem);
      } else {
        res.status(404).json({ message: "Recipe not found" });
      }
    } catch (error) {
      console.error("Error completing craft:", error);
      res.status(500).json({ message: "Failed to complete crafting" });
    }
  });

  app.post('/api/crafting/equip/:itemId/:petId', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const petId = parseInt(req.params.petId);
      
      const equippedItem = await storage.equipItem(itemId, petId);
      res.json(equippedItem);
    } catch (error) {
      console.error("Error equipping item:", error);
      res.status(500).json({ message: "Failed to equip item" });
    }
  });

  app.post('/api/crafting/unequip/:itemId', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      
      const unequippedItem = await storage.unequipItem(itemId);
      res.json(unequippedItem);
    } catch (error) {
      console.error("Error unequipping item:", error);
      res.status(500).json({ message: "Failed to unequip item" });
    }
  });

  // Pet AI interaction routes
  app.get('/api/pets/:petId', isAuthenticated, async (req: any, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const userId = req.user?.claims?.sub;
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.json(pet);
    } catch (error) {
      console.error("Error fetching pet:", error);
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  app.post('/api/pets/:petId/chat', isAuthenticated, async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const userId = req.user?.claims?.sub;
      const { message } = req.body;
      
      const pets = await storage.getPetsByUserId(userId);
      const pet = pets.find(p => p.id === petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Generate AI response using Gemini
      const response = await petAI.generateResponse(pet, message, userId);
      
      // Log the interaction
      const interaction = await storage.createPetInteraction({
        petId,
        userId,
        interactionType: 'chat',
        userMessage: message,
        petResponse: response.message,
        moodChange: response.moodChange || 0,
        happinessChange: response.happinessChange || 0,
        experienceGained: response.experienceGained || 0
      });
      
      // Update pet mood and happiness
      if (response.moodChange || response.happinessChange) {
        await storage.updatePet(petId, {
          mood: response.newMood || pet.mood,
          happiness: Math.max(0, Math.min(100, pet.happiness + (response.happinessChange || 0))),
          lastInteraction: new Date()
        });
      }
      
      res.json({
        ...interaction,
        experienceGained: response.experienceGained || 0
      });
    } catch (error) {
      console.error("Error in pet chat:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/pets/:petId/interactions', isAuthenticated, async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const interactions = await storage.getPetInteractions(petId, 50);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // Trading system routes
  app.get('/api/trading/offers', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offers = await storage.getTradeOffers(userId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching trade offers:", error);
      res.status(500).json({ message: "Failed to fetch trade offers" });
    }
  });

  app.post('/api/trading/offers', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offerData = { ...req.body, fromUserId: userId };
      
      const offer = await storage.createTradeOffer(offerData);
      res.json(offer);
    } catch (error) {
      console.error("Error creating trade offer:", error);
      res.status(500).json({ message: "Failed to create trade offer" });
    }
  });

  app.post('/api/trading/offers/:offerId/accept', isAuthenticated, async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId);
      const userId = req.user?.claims?.sub;
      
      const result = await storage.acceptTradeOffer(offerId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error accepting trade:", error);
      res.status(500).json({ message: error.message || "Failed to accept trade" });
    }
  });

  // Social features routes
  app.get('/api/friends', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post('/api/friends/request', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { friendId } = req.body;
      
      const friendship = await storage.createFriendship(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  // Store and monetization routes
  app.get('/api/store', async (req, res) => {
    try {
      const items = await storage.getStoreItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching store items:", error);
      res.status(500).json({ message: "Failed to fetch store items" });
    }
  });

  app.post('/api/daily-reward/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const reward = await storage.claimDailyReward(userId);
      res.json(reward);
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      res.status(400).json({ message: error.message || "Failed to claim daily reward" });
    }
  });

  // Game World and Advanced Mechanics
  app.get('/api/user/level', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameState = await storage.getGameState(userId);
      res.json({ level: gameState?.level || 1, experience: gameState?.experience || 0 });
    } catch (error) {
      console.error("Error fetching user level:", error);
      res.status(500).json({ message: "Failed to fetch user level" });
    }
  });

  // World Map route
  app.get('/api/world/regions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameState = await storage.getGameState(userId);
      
      const regions = [
        {
          id: 'forest',
          name: 'Enchanted Forest',
          type: 'forest',
          difficulty: 1,
          unlocked: true,
          encounters: ['Forest Sprites', 'Woodland Guardians', 'Ancient Trees'],
          specialFeatures: ['Mystical Groves', 'Hidden Clearings', 'Talking Animals'],
          coordinates: { x: 25, y: 70 },
          description: 'A peaceful woodland where magical creatures roam freely',
          requiredLevel: 1
        },
        {
          id: 'crystal-caves',
          name: 'Crystal Caves',
          type: 'crystal',
          difficulty: 3,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('crystal-caves'),
          encounters: ['Crystal Golems', 'Gem Sprites', 'Prismatic Dragons'],
          specialFeatures: ['Rainbow Light', 'Resonant Crystals', 'Hidden Treasures'],
          coordinates: { x: 60, y: 80 },
          description: 'Sparkling caverns filled with magical crystals and ancient secrets',
          requiredLevel: 3
        },
        {
          id: 'floating-islands',
          name: 'Floating Islands',
          type: 'sky',
          difficulty: 5,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('floating-islands'),
          encounters: ['Sky Dancers', 'Wind Elementals', 'Star Guardians'],
          specialFeatures: ['Gravity Anomalies', 'Cloud Bridges', 'Celestial Portals'],
          coordinates: { x: 75, y: 20 },
          description: 'Mystical islands suspended in the clouds above',
          requiredLevel: 5
        },
        {
          id: 'fire-realm',
          name: 'Fire Realm',
          type: 'fire',
          difficulty: 4,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('fire-realm'),
          encounters: ['Fire Phoenixes', 'Lava Serpents', 'Flame Spirits'],
          specialFeatures: ['Lava Falls', 'Volcanic Vents', 'Phoenix Nests'],
          coordinates: { x: 20, y: 30 },
          description: 'A volcanic realm where fire creatures rule supreme',
          requiredLevel: 4
        },
        {
          id: 'ice-kingdom',
          name: 'Ice Kingdom',
          type: 'ice',
          difficulty: 4,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('ice-kingdom'),
          encounters: ['Ice Dragons', 'Frost Giants', 'Aurora Spirits'],
          specialFeatures: ['Frozen Palaces', 'Aurora Lights', 'Ice Crystals'],
          coordinates: { x: 80, y: 60 },
          description: 'A frozen wonderland ruled by ice and eternal winter',
          requiredLevel: 4
        },
        {
          id: 'shadow-dimension',
          name: 'Shadow Dimension',
          type: 'shadow',
          difficulty: 6,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('shadow-dimension'),
          encounters: ['Shadow Wraiths', 'Void Walkers', 'Dark Phantoms'],
          specialFeatures: ['Reality Rifts', 'Shadow Portals', 'Void Energy'],
          coordinates: { x: 15, y: 85 },
          description: 'A dark realm where shadows come alive and reality bends',
          requiredLevel: 6
        },
        {
          id: 'temporal-meadows',
          name: 'Temporal Meadows',
          type: 'time',
          difficulty: 7,
          unlocked: Array.isArray(gameState?.unlockedEnvironments) && gameState.unlockedEnvironments.includes('temporal-meadows'),
          encounters: ['Time Sprites', 'Chronos Guardians', 'Reality Weavers'],
          specialFeatures: ['Time Distortions', 'Memory Echoes', 'Future Glimpses'],
          coordinates: { x: 85, y: 25 },
          description: 'Meadows where time flows differently and past meets future',
          requiredLevel: 7
        }
      ];
      
      res.json(regions);
    } catch (error) {
      console.error("Error fetching world regions:", error);
      res.status(500).json({ message: "Failed to fetch world regions" });
    }
  });

  app.post('/api/world/visit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { locationId } = req.body;
      
      // Log the visit activity
      await storage.logUserActivity({
        userId,
        activityType: 'location_visit',
        metadata: { locationId },
        experienceGained: 5
      });

      res.json({ 
        success: true, 
        location: locationId,
        experienceGained: 5
      });
    } catch (error) {
      console.error("Error visiting location:", error);
      res.status(500).json({ message: "Failed to visit location" });
    }
  });

  // Mini Games and Arcade
  app.get('/api/arcade/games', isAuthenticated, async (req: any, res) => {
    try {
      const games = [
        { id: 1, name: "Pet Race", description: "Race your pets against others", minLevel: 1, rewards: "Coins & XP" },
        { id: 2, name: "Memory Match", description: "Match pet cards to win prizes", minLevel: 3, rewards: "Gems & Items" },
        { id: 3, name: "Bubble Pop", description: "Pop bubbles with your pet", minLevel: 5, rewards: "Special Items" },
        { id: 4, name: "Treasure Hunt", description: "Find hidden treasures", minLevel: 8, rewards: "Rare Materials" }
      ];
      res.json(games);
    } catch (error) {
      console.error("Error fetching arcade games:", error);
      res.status(500).json({ message: "Failed to fetch arcade games" });
    }
  });

  app.post('/api/arcade/play', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId, score } = req.body;
      
      const baseReward = Math.floor(score / 10);
      const coinsEarned = Math.min(baseReward, 100);
      const experienceGained = Math.min(Math.floor(score / 5), 50);

      // Update game state
      const currentState = await storage.getGameState(userId);
      await storage.upsertGameState(userId, {
        coins: (currentState?.coins || 0) + coinsEarned,
        experience: (currentState?.experience || 0) + experienceGained
      });

      res.json({ 
        success: true, 
        coinsEarned, 
        experienceGained,
        message: "Game completed successfully!"
      });
    } catch (error) {
      console.error("Error playing arcade game:", error);
      res.status(500).json({ message: "Failed to complete game" });
    }
  });

  // Pet Hospital and Health System
  app.get('/api/hospital/treatments', isAuthenticated, async (req: any, res) => {
    try {
      const treatments = [
        { id: 1, name: "Basic Checkup", cost: 50, description: "General health examination" },
        { id: 2, name: "Energy Boost", cost: 100, description: "Restore pet energy to full" },
        { id: 3, name: "Happiness Therapy", cost: 75, description: "Improve pet mood and happiness" },
        { id: 4, name: "Skill Enhancement", cost: 200, description: "Temporarily boost pet abilities" }
      ];
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching hospital treatments:", error);
      res.status(500).json({ message: "Failed to fetch treatments" });
    }
  });

  app.post('/api/hospital/treat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { petId, treatmentId } = req.body;
      
      const treatments = {
        1: { cost: 50, effect: "health" },
        2: { cost: 100, effect: "energy" },
        3: { cost: 75, effect: "happiness" },
        4: { cost: 200, effect: "skills" }
      };

      const treatment = treatments[treatmentId];
      if (!treatment) {
        return res.status(400).json({ message: "Invalid treatment" });
      }

      const gameState = await storage.getGameState(userId);
      if ((gameState?.coins || 0) < treatment.cost) {
        return res.status(400).json({ message: "Insufficient coins" });
      }

      // Deduct coins and apply treatment
      await storage.upsertGameState(userId, {
        coins: (gameState?.coins || 0) - treatment.cost
      });

      res.json({ 
        success: true,
        message: "Treatment applied successfully!",
        coinsSpent: treatment.cost
      });
    } catch (error) {
      console.error("Error applying treatment:", error);
      res.status(500).json({ message: "Failed to apply treatment" });
    }
  });

  // Daily Rewards System
  app.post('/api/rewards/claim-daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reward = await storage.claimDailyReward(userId);
      res.json(reward);
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      res.status(500).json({ message: "Failed to claim daily reward" });
    }
  });

  // Magic Shop
  app.get('/api/magic-shop/items', isAuthenticated, async (req: any, res) => {
    try {
      const magicItems = [
        { id: 1, name: "Speed Potion", cost: 150, effect: "Increases pet speed for 1 hour", type: "consumable" },
        { id: 2, name: "Luck Charm", cost: 300, effect: "Improves rare item discovery", type: "equipment" },
        { id: 3, name: "Transformation Spell", cost: 500, effect: "Temporarily change pet appearance", type: "spell" },
        { id: 4, name: "Energy Crystal", cost: 200, effect: "Restores all pet energy", type: "consumable" }
      ];
      res.json(magicItems);
    } catch (error) {
      console.error("Error fetching magic shop items:", error);
      res.status(500).json({ message: "Failed to fetch magic items" });
    }
  });

  // Image proxy route for DALL-E images
  app.get("/api/image-proxy", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Missing image URL parameter" });
      }
      
      console.log("Proxying image:", imageUrl);
      
      // Fetch the image from OpenAI with proper headers
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      });
      
      if (!response.ok) {
        console.error("Image proxy fetch failed:", response.status, response.statusText);
        return res.status(response.status).json({ error: `Image fetch failed: ${response.statusText}` });
      }
      
      // Set appropriate headers
      const contentType = response.headers.get('content-type') || 'image/png';
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
      // Stream the image data
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
      console.log("Successfully proxied image, size:", buffer.byteLength, "bytes");
    } catch (error) {
      console.error("Image proxy error:", error);
      res.status(500).json({ error: "Failed to proxy image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
