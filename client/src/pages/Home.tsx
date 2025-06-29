import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PetDisplay from "@/components/PetDisplay";
import PetManager from "@/components/PetManager";
import PetBreeding from "@/components/PetBreeding";
import EnhancedExplorationPanel from "@/components/EnhancedExplorationPanel";
import PetStats from "@/components/PetStats";
import InventoryFixed from "@/components/InventoryFixed";
import BattleModal from "@/components/BattleModal";
import GenerationModal from "@/components/GenerationModal";
import CraftingSystem from "@/components/CraftingSystem";
import WorldMap from "@/components/WorldMap";
import GameWorld from "@/components/GameWorld";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-game-secondary mb-4"></i>
          <p className="font-pixel text-lg">Loading your pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-sans">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-game-secondary text-xl sm:text-2xl">
              <i className="fas fa-gamepad mr-2"></i>
              PIXEL PETS
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="bg-game-danger hover:bg-game-danger/80 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-lg p-2">
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                className="px-4 py-2 bg-game-primary hover:bg-game-primary/80 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('pet-manager')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Pet Collection
              </button>
              <button 
                className="px-4 py-2 bg-game-accent hover:bg-game-accent/80 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('pet-breeding')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Breeding Lab
              </button>
              <button 
                className="px-4 py-2 bg-game-secondary hover:bg-game-secondary/80 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('exploration')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Exploration
              </button>
              <button 
                className="px-4 py-2 bg-game-warning hover:bg-game-warning/80 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('active-pet')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Active Pet
              </button>
              <button 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('crafting')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Crafting Workshop
              </button>
              <button 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-pixel text-sm transition-colors"
                onClick={() => document.getElementById('game-world')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Game World
              </button>
            </div>
          </div>

          {/* Pet Collection Manager */}
          <div id="pet-manager">
            <PetManager />
          </div>

          {/* Pet Breeding Laboratory */}
          <div id="pet-breeding">
            <PetBreeding />
          </div>

          {/* Game Sections Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Active Pet Display */}
            <div id="active-pet" className="xl:col-span-2 space-y-6">
              <PetDisplay />
              <PetStats />
            </div>
            
            {/* Exploration and Inventory */}
            <div id="exploration" className="xl:col-span-2 space-y-6">
              <EnhancedExplorationPanel />
              <InventoryFixed />
            </div>
          </div>

          {/* Crafting Workshop */}
          <div id="crafting">
            <CraftingSystem />
          </div>

          {/* Game World */}
          <div id="game-world" className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
            <GameWorld />
          </div>
        </div>
      </div>

      {/* Modals */}
      <BattleModal isOpen={false} onClose={() => {}} />
      <GenerationModal isOpen={false} />
    </div>
  );
}
