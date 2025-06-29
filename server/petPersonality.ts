import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import type { Pet, PetInteraction } from "@shared/schema";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface PetPersonalityData {
  traits: string[];
  mood: string;
  memories: string[];
  preferences: Record<string, any>;
  relationshipLevel: number;
}

export class PetAI {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generatePersonality(pet: Pet): Promise<PetPersonalityData> {
    const prompt = `
    Create a unique personality for a pixel pet with these characteristics:
    - Name: ${pet.name}
    - Type: ${pet.type}
    - Element: ${pet.element}
    - Rarity: ${pet.rarity}
    - Level: ${pet.level}
    - Current Mood: ${pet.mood}

    Generate a personality that includes:
    1. 5 personality traits (playful, shy, curious, brave, mischievous, loyal, etc.)
    2. Current mood description
    3. 3 initial memories or experiences
    4. Preferences for activities, foods, toys
    5. Relationship level with owner (1-10)

    Respond in JSON format:
    {
      "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
      "mood": "detailed mood description",
      "memories": ["memory1", "memory2", "memory3"],
      "preferences": {
        "favoriteActivity": "activity",
        "favoriteFood": "food",
        "favoriteToy": "toy",
        "preferredTime": "morning/afternoon/evening"
      },
      "relationshipLevel": 5
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error generating pet personality:", error);
      // Fallback personality
      return {
        traits: ["friendly", "curious", "playful", "loyal", "energetic"],
        mood: "happy and excited to meet you",
        memories: [
          "remembers the day they were born",
          "loves exploring new places",
          "enjoys playing with toys"
        ],
        preferences: {
          favoriteActivity: "playing",
          favoriteFood: "treats",
          favoriteToy: "ball",
          preferredTime: "afternoon"
        },
        relationshipLevel: 3
      };
    }
  }

  async generateResponse(
    pet: Pet,
    userMessage: string,
    context: PetInteraction[]
  ): Promise<{
    response: string;
    moodChange: number;
    happinessChange: number;
    experienceGained: number;
    newMemory?: string;
  }> {
    const recentInteractions = context.slice(-5).map(interaction => 
      `User: ${interaction.userMessage}\nPet: ${interaction.petResponse}`
    ).join('\n');

    const personality = pet.personality as PetPersonalityData || await this.generatePersonality(pet);
    
    const prompt = `
    You are ${pet.name}, a ${pet.type} pixel pet with ${pet.element} element abilities.
    
    Your personality:
    - Traits: ${personality.traits?.join(', ') || 'friendly, curious'}
    - Current mood: ${pet.mood}
    - Happiness level: ${pet.happiness}/100
    - Relationship with owner: ${personality.relationshipLevel || 5}/10
    
    Recent conversation:
    ${recentInteractions}
    
    User just said: "${userMessage}"
    
    Respond as this pet character. Be:
    - Age-appropriate for kids
    - In character with your personality traits
    - Emotionally responsive to the user's message
    - Encouraging and positive
    - Maximum 2 sentences
    
    Also determine:
    - Mood change (-10 to +10)
    - Happiness change (-5 to +15)
    - Experience gained (1-5)
    - If this creates a memorable moment, describe it briefly
    
    Respond in JSON format:
    {
      "response": "pet's response message",
      "moodChange": 0,
      "happinessChange": 5,
      "experienceGained": 2,
      "newMemory": "memorable moment description or null"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error generating pet response:", error);
      return {
        response: `*${pet.name} looks at you with sparkling eyes* Woof! I'm so happy to see you!`,
        moodChange: 2,
        happinessChange: 5,
        experienceGained: 1
      };
    }
  }

  async updatePetMemories(pet: Pet, newMemory: string): Promise<Pet> {
    const memories = (pet.memories as string[]) || [];
    memories.push(newMemory);
    
    // Keep only the most recent 10 memories
    if (memories.length > 10) {
      memories.shift();
    }
    
    return await storage.updatePet(pet.id, { memories });
  }

  async evolvePersonality(pet: Pet): Promise<Pet> {
    const personality = pet.personality as PetPersonalityData;
    if (!personality) return pet;

    // Personality evolves based on interactions and level
    if (pet.level && pet.level > (personality.relationshipLevel * 2)) {
      personality.relationshipLevel = Math.min(10, personality.relationshipLevel + 1);
      
      const prompt = `
      The pet ${pet.name} has grown closer to their owner (relationship level now ${personality.relationshipLevel}).
      Current traits: ${personality.traits?.join(', ')}
      
      Suggest 1-2 new personality traits that could develop as the pet bonds more with their owner.
      Keep existing traits but add new ones that show growth and deeper connection.
      
      Respond with just the new traits as a JSON array: ["trait1", "trait2"]
      `;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const newTraits = JSON.parse(cleanedText);
        
        personality.traits = [...(personality.traits || []), ...newTraits];
      } catch (error) {
        console.error("Error evolving personality:", error);
      }
    }

    return await storage.updatePet(pet.id, { personality });
  }
}

export const petAI = new PetAI();