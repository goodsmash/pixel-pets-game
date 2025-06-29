import OpenAI from "openai";
import { PetAttributes } from "./geminiGenerator";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePetImage(petData: PetAttributes): Promise<string> {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error("Valid OpenAI API key required for DALL-E image generation");
  }

  // Safe creature and color mapping for DALL-E compliance
  const creatureMapping: Record<string, string> = {
    'dragon': 'dragon', 'phoenix': 'phoenix', 'unicorn': 'unicorn', 'wolf': 'wolf',
    'serpent': 'snake', 'eagle': 'eagle', 'lion': 'lion', 'tiger': 'tiger',
    'spirit': 'ghost', 'beast': 'creature', 'fairy': 'fairy', 'elemental': 'elemental',
    'demon': 'demon', 'angel': 'angel', 'deity': 'deity', 'guardian': 'guardian',
    'hydra': 'hydra', 'kraken': 'kraken', 'sphinx': 'sphinx', 'chimera': 'chimera',
    'wyvern': 'wyvern', 'leviathan': 'leviathan', 'djinn': 'djinn', 'nymph': 'nymph',
    'monk': 'monk', 'explorer': 'explorer', 'hermit': 'hermit', 'galactic': 'cosmic being'
  };
  
  const colorMapping: Record<string, string> = {
    'crimson': 'crimson red', 'scarlet': 'scarlet red', 'azure': 'azure blue', 'cerulean': 'cerulean blue',
    'emerald': 'emerald green', 'jade': 'jade green', 'amber': 'amber yellow', 'gold': 'golden',
    'violet': 'violet purple', 'amethyst': 'amethyst purple', 'coral': 'coral orange', 'copper': 'copper bronze',
    'rose': 'rose pink', 'magenta': 'magenta pink', 'silver': 'metallic silver', 'platinum': 'platinum white',
    'obsidian': 'obsidian black', 'onyx': 'onyx black', 'bronze': 'bronze brown', 'mahogany': 'mahogany brown'
  };

  // Use authentic creature and color names
  const creature = creatureMapping[petData.type.toLowerCase()] || petData.type;
  const color = colorMapping[petData.color.toLowerCase()] || petData.color;

  // Enhanced DALL-E 3 prompt for superior image quality and full creature visibility
  const environmentDetails: Record<string, string> = {
    "Enchanted Forest": "mystical woodland with glowing flora",
    "Crystal Caves": "sparkling crystal cavern with prismatic light",
    "Floating Islands": "floating landmass with clouds below",
    "Fire Realm": "volcanic landscape with lava flows",
    "Ice Kingdom": "frozen palace with aurora lights",
    "Shadow Dimension": "dark realm with purple energy",
    "Light Sanctuary": "radiant temple with golden beams"
  };

  const rarityEffects = {
    "Common": "subtle magical glow",
    "Uncommon": "gentle energy aura",
    "Rare": "moderate mystical radiance",
    "Epic": "intense magical power",
    "Legendary": "divine energy emanation",
    "Mythical": "reality-bending aura",
    "Transcendent": "cosmic energy field"
  };

  // Create comprehensive DALL-E 3 prompt for better images
  const prompt = `MASTERPIECE: A majestic ${petData.rarity.toLowerCase()} ${color} ${creature} creature, full body centered in frame, fantasy art style. The creature displays ${petData.personality.toLowerCase()} personality with ${petData.element.toLowerCase()} elemental powers. Features include ${petData.specialFeatures.slice(0, 2).join(' and ')}. Background: ${environmentDetails[petData.habitat] || 'mystical landscape'}. Art style: high-quality digital fantasy art, vibrant colors, detailed textures, magical atmosphere, professional game artwork, no cropping, complete creature visible.`;

  try {
    console.log(`Generating DALL-E 3 image for ${petData.name}`);
    console.log(`Prompt: "${prompt}"`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });

    console.log(`DALL-E 3 response received successfully for ${petData.name}`);

    if (response?.data?.[0]?.url) {
      const imageUrl = response.data[0].url;
      console.log(`Successfully generated DALL-E 3 image for ${petData.name}: ${imageUrl}`);
      
      // Download and convert to base64 to avoid authentication issues
      try {
        console.log(`Downloading DALL-E image for ${petData.name}...`);
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;
          console.log(`Successfully converted DALL-E image to base64 for ${petData.name}`);
          return dataUrl;
        } else {
          console.warn(`Failed to download DALL-E image (${imageResponse.status}), using original URL`);
          return imageUrl;
        }
      } catch (downloadError) {
        console.warn(`Error downloading DALL-E image:`, downloadError);
        return imageUrl;
      }
    }

    throw new Error(`DALL-E 3 did not return image URL`);
  } catch (error: any) {
    console.error(`DALL-E 3 generation error:`, {
      status: error.status,
      type: error.type,
      message: error.message,
      prompt: prompt
    });
    
    // Try fallback to DALL-E 2 if DALL-E 3 fails
    try {
      console.log(`Attempting fallback to DALL-E 2`);
      
      const fallbackResponse = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt.substring(0, 1000), // DALL-E 2 has shorter prompt limit
        n: 1,
        size: "1024x1024"
      });

      if (fallbackResponse?.data?.[0]?.url) {
        const fallbackUrl = fallbackResponse.data[0].url;
        console.log(`Successfully generated DALL-E 2 fallback image for ${petData.name}`);
        
        // Download and convert to base64
        try {
          const imageResponse = await fetch(fallbackUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`;
            return dataUrl;
          }
        } catch (downloadError) {
          console.warn(`Error downloading DALL-E 2 image:`, downloadError);
        }
        
        return fallbackUrl;
      }
    } catch (fallbackError) {
      console.error(`DALL-E 2 fallback error:`, fallbackError);
    }
    
    throw new Error(`Both DALL-E 3 and DALL-E 2 failed: ${error.message}`);
  }
}

export async function generateBreedingOffspringImage(parentOne: PetAttributes, parentTwo: PetAttributes, offspring: PetAttributes): Promise<string> {
  // Enhanced breeding prompt that shows genetic inheritance
  const prompt = `MASTERPIECE: A baby ${offspring.rarity.toLowerCase()} ${offspring.color} ${offspring.type} creature, full body centered in frame, fantasy art style. This adorable offspring inherits traits from both parents: showing elements of ${parentOne.element.toLowerCase()} and ${parentTwo.element.toLowerCase()} magic. Features youthful versions of ${offspring.specialFeatures.slice(0, 2).join(' and ')}. The creature displays ${offspring.personality.toLowerCase()} personality in a ${offspring.habitat.toLowerCase()} environment. Art style: high-quality digital fantasy art, cute baby creature, vibrant colors, magical atmosphere, professional game artwork, complete creature visible.`;

  try {
    console.log(`Generating breeding offspring image`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });

    if (response?.data?.[0]?.url) {
      const imageUrl = response.data[0].url;
      
      // Download and convert to base64
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          return `data:image/png;base64,${base64Image}`;
        }
      } catch (downloadError) {
        console.warn(`Error downloading breeding image:`, downloadError);
      }
      
      return imageUrl;
    }

    throw new Error(`Failed to generate breeding offspring image`);
  } catch (error) {
    console.error(`Breeding image generation error:`, error);
    // Return a fallback that uses the regular image generation
    return generatePetImage(offspring);
  }
}