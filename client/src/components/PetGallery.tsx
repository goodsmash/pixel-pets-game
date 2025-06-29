import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Pet } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PetGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: activePet } = useQuery<Pet>({
    queryKey: ["/api/pets/active"],
    retry: false,
  });

  const activatePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await apiRequest("PUT", `/api/pets/${petId}/activate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      toast({
        title: "Pet Activated",
        description: "Your pet is now active!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to activate pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await apiRequest("POST", `/api/pets/${petId}/generate-image`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      toast({
        title: "Image Generated",
        description: "OpenAI DALL-E image created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-500",
      uncommon: "bg-green-500",
      rare: "bg-blue-500",
      epic: "bg-purple-500",
      legendary: "bg-orange-500",
      mythic: "bg-red-500",
      transcendent: "bg-gradient-to-r from-purple-500 to-pink-500"
    };
    return colors[rarity as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-2xl text-game-secondary"></i>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="font-pixel text-xl text-center">Pet Collection</CardTitle>
        <p className="text-center text-white/70 text-sm">
          {pets.length} pets • {pets.filter(p => p.imageUrl && !p.imageUrl.includes('data:image/svg')).length} with OpenAI images
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {pets.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-dragon text-4xl text-game-primary mb-4"></i>
            <p className="text-white/70">No pets yet. Generate your first pet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  activePet?.id === pet.id
                    ? "border-game-primary bg-game-primary/10"
                    : "border-white/20 bg-black/10 hover:border-white/40"
                }`}
              >
                {/* Pet Image */}
                <div className="w-full h-40 bg-gradient-to-br from-game-primary/20 to-game-secondary/20 rounded-lg border-2 border-white/20 flex items-center justify-center mb-3 overflow-hidden">
                  {pet.imageUrl && !pet.imageUrl.includes('data:image/svg') ? (
                    <img
                      src={pet.imageUrl.includes('oaidalleapi') ? `/api/image-proxy?url=${encodeURIComponent(pet.imageUrl)}` : pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-dragon text-2xl text-game-primary mb-2"></i>
                      <p className="text-xs text-white/50">Ready for OpenAI generation</p>
                    </div>
                  )}
                </div>

                {/* Pet Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-pixel text-sm text-white truncate">{pet.name}</h3>
                    <Badge className={`${getRarityColor(pet.rarity)} text-white text-xs`}>
                      {pet.rarity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>LVL {pet.level}</span>
                    <span>{pet.type}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-game-element">{pet.element}</span>
                    <span className="text-white/60">{pet.personality}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 space-y-2">
                  {(!pet.imageUrl || pet.imageUrl.includes('data:image/svg')) && (
                    <Button
                      onClick={() => generateImageMutation.mutate(pet.id)}
                      disabled={generateImageMutation.isPending}
                      className="w-full bg-game-accent hover:bg-game-accent/80 text-white text-xs py-2"
                    >
                      {generateImageMutation.isPending ? "Generating..." : "Generate OpenAI Image"}
                    </Button>
                  )}
                  
                  {activePet?.id !== pet.id && (
                    <Button
                      onClick={() => activatePetMutation.mutate(pet.id)}
                      disabled={activatePetMutation.isPending}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 text-xs py-2"
                    >
                      {activatePetMutation.isPending ? "Activating..." : "Set Active"}
                    </Button>
                  )}
                  
                  {activePet?.id === pet.id && (
                    <div className="text-center text-xs text-game-primary font-pixel">
                      ★ ACTIVE PET ★
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}