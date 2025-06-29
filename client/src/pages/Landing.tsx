import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-pixel text-game-secondary text-xl sm:text-2xl">
            <i className="fas fa-gamepad mr-2"></i>
            PIXEL PETS
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="font-pixel text-4xl sm:text-6xl text-game-secondary mb-6 animate-glow">
              PIXEL PETS
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Create, explore, and battle with unique procedurally generated pixel pets. 
              Each pet is one-of-a-kind, powered by SHA-256 hashing for consistent generation.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-game-primary hover:bg-game-primary/80 text-white font-bold py-4 px-8 text-lg rounded-lg transition-all duration-200 hover:scale-105"
            >
              <i className="fas fa-play mr-2"></i>
              Start Your Adventure
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-dice text-game-accent text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">PROCEDURAL GENERATION</h3>
                <p className="text-sm text-white/70">
                  Every pet is unique with randomized attributes, colors, and special features
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-map text-game-success text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">EXPLORATION</h3>
                <p className="text-sm text-white/70">
                  Explore diverse environments and discover treasures, battles, and secrets
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-sword text-game-danger text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">EPIC BATTLES</h3>
                <p className="text-sm text-white/70">
                  Engage in strategic turn-based combat with wild creatures
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-chart-line text-game-primary text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">PET GROWTH</h3>
                <p className="text-sm text-white/70">
                  Train and evolve your pets through feeding, playing, and battles
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-treasure-chest text-game-secondary text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">RARE LOOT</h3>
                <p className="text-sm text-white/70">
                  Collect rare items, crystals, and artifacts with unique rarity distributions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <i className="fas fa-save text-game-accent text-3xl mb-4"></i>
                <h3 className="font-pixel text-lg mb-3">PERSISTENT PROGRESS</h3>
                <p className="text-sm text-white/70">
                  Your pets and progress are saved securely with cloud storage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h2 className="font-pixel text-2xl text-game-accent mb-4">
              Ready to Create Your First Pixel Pet?
            </h2>
            <p className="text-white/80 mb-6">
              Join thousands of adventurers in the magical world of Pixel Pets
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-game-secondary hover:bg-game-secondary/80 text-white font-bold py-3 px-6 text-lg rounded-lg transition-all duration-200 hover:scale-105"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
