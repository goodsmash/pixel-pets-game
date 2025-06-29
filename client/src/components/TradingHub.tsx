import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Heart, Star, Clock, Users, Gift, Sparkles } from "lucide-react";

interface TradeOffer {
  id: number;
  fromUserId: string;
  toUserId: string;
  offeredPets: number[];
  requestedPets: number[];
  offeredCoins: number;
  requestedCoins: number;
  status: string;
  message: string;
  createdAt: string;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  rarity: string;
  level: number;
  imageUrl: string;
  isForTrade: boolean;
  tradeValue: number;
}

export default function TradingHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("browse");
  const [tradePartner, setTradePartner] = useState("");
  const [selectedPets, setSelectedPets] = useState<number[]>([]);
  const [requestedPets, setRequestedPets] = useState<number[]>([]);
  const [offerCoins, setOfferCoins] = useState(0);
  const [requestCoins, setRequestCoins] = useState(0);
  const [tradeMessage, setTradeMessage] = useState("");

  // Fetch user's pets available for trading
  const { data: myPets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["/api/pets/trading"],
  });

  // Fetch available pets from other users
  const { data: availablePets = [], isLoading: availableLoading } = useQuery({
    queryKey: ["/api/trading/available"],
  });

  // Fetch pending trade offers
  const { data: tradeOffers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/trading/offers"],
  });

  // Create trade offer mutation
  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      return apiRequest("/api/trading/create", "POST", tradeData);
    },
    onSuccess: () => {
      toast({
        title: "Trade Offer Sent! 🎉",
        description: "Your trade offer has been sent to the other player.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/offers"] });
      setSelectedPets([]);
      setRequestedPets([]);
      setOfferCoins(0);
      setRequestCoins(0);
      setTradeMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to create trade offer",
        variant: "destructive",
      });
    },
  });

  // Accept trade offer mutation
  const acceptTradeMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest(`/api/trading/accept/${offerId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Trade Completed! ✨",
        description: "You've successfully completed the trade!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
  });

  // Decline trade offer mutation
  const declineTradeMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest(`/api/trading/decline/${offerId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Trade Declined",
        description: "Trade offer has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/offers"] });
    },
  });

  const handleCreateTrade = () => {
    if (selectedPets.length === 0 && offerCoins === 0) {
      toast({
        title: "No Offer",
        description: "Please select pets or coins to offer",
        variant: "destructive",
      });
      return;
    }

    if (requestedPets.length === 0 && requestCoins === 0) {
      toast({
        title: "No Request",
        description: "Please select what you want in return",
        variant: "destructive",
      });
      return;
    }

    createTradeMutation.mutate({
      toUserId: tradePartner,
      offeredPets: selectedPets,
      requestedPets: requestedPets,
      offeredCoins: offerCoins,
      requestedCoins: requestCoins,
      message: tradeMessage,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary": return "text-yellow-500 bg-yellow-100";
      case "epic": return "text-purple-500 bg-purple-100";
      case "rare": return "text-blue-500 bg-blue-100";
      case "uncommon": return "text-green-500 bg-green-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const PetCard = ({ pet, isSelectable = false, isSelected = false, onToggle }: any) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
      onClick={() => onToggle && onToggle(pet.id)}
    >
      <CardContent className="p-4">
        <div className="relative">
          {pet.imageUrl && (
            <img 
              src={pet.imageUrl} 
              alt={pet.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <Badge className={`absolute top-2 right-2 ${getRarityColor(pet.rarity)}`}>
            {pet.rarity}
          </Badge>
        </div>
        <h3 className="font-bold text-lg text-center">{pet.name}</h3>
        <p className="text-sm text-center text-gray-600">{pet.type}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Lv. {pet.level}
          </span>
          <span className="text-sm font-medium">
            {pet.tradeValue} coins
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const TradeOfferCard = ({ offer }: { offer: TradeOffer }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Trade Offer</CardTitle>
            <CardDescription>
              From: {offer.fromUserId} • {new Date(offer.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={offer.status === "pending" ? "default" : "secondary"}>
            {offer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {offer.message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm italic">"{offer.message}"</p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              They Offer:
            </h4>
            <div className="space-y-2">
              {offer.offeredPets.length > 0 && (
                <p className="text-sm">{offer.offeredPets.length} pets</p>
              )}
              {offer.offeredCoins > 0 && (
                <p className="text-sm">{offer.offeredCoins} coins</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              They Want:
            </h4>
            <div className="space-y-2">
              {offer.requestedPets.length > 0 && (
                <p className="text-sm">{offer.requestedPets.length} pets</p>
              )}
              {offer.requestedCoins > 0 && (
                <p className="text-sm">{offer.requestedCoins} coins</p>
              )}
            </div>
          </div>
        </div>

        {offer.status === "pending" && offer.toUserId === user?.id && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => acceptTradeMutation.mutate(offer.id)}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              Accept Trade
            </Button>
            <Button 
              onClick={() => declineTradeMutation.mutate(offer.id)}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gradient">
          🏪 Pet Trading Hub
        </h1>
        <p className="text-lg text-gray-600">
          Trade pets with friends and discover new companions!
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Browse Pets
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Create Trade
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            My Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Pets for Trade</CardTitle>
              <CardDescription>
                Browse pets that other players are willing to trade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableLoading ? (
                <div className="text-center py-8">Loading available pets...</div>
              ) : availablePets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pets available for trade right now. Check back later!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availablePets.map((pet: Pet) => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Trade Offer</CardTitle>
              <CardDescription>
                Select pets and coins to offer, then choose what you want in return
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-medium mb-3 block">Your Offer</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="offerCoins">Coins to Offer</Label>
                      <Input
                        id="offerCoins"
                        type="number"
                        value={offerCoins}
                        onChange={(e) => setOfferCoins(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Select Pets to Offer</Label>
                      <ScrollArea className="h-64 border rounded-lg p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {myPets.map((pet: Pet) => (
                            <PetCard
                              key={pet.id}
                              pet={pet}
                              isSelectable={true}
                              isSelected={selectedPets.includes(pet.id)}
                              onToggle={(id: number) => {
                                setSelectedPets(prev => 
                                  prev.includes(id) 
                                    ? prev.filter(p => p !== id)
                                    : [...prev, id]
                                );
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium mb-3 block">What You Want</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="requestCoins">Coins Requested</Label>
                      <Input
                        id="requestCoins"
                        type="number"
                        value={requestCoins}
                        onChange={(e) => setRequestCoins(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradePartner">Trade Partner User ID</Label>
                      <Input
                        id="tradePartner"
                        value={tradePartner}
                        onChange={(e) => setTradePartner(e.target.value)}
                        placeholder="Enter user ID or friend code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Trade Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={tradeMessage}
                  onChange={(e) => setTradeMessage(e.target.value)}
                  placeholder="Add a friendly message to your trade offer..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCreateTrade}
                className="w-full text-lg py-3"
                disabled={createTradeMutation.isPending}
              >
                {createTradeMutation.isPending ? "Sending..." : "Send Trade Offer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Offers</CardTitle>
              <CardDescription>
                Manage your incoming and outgoing trade offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="text-center py-8">Loading trade offers...</div>
              ) : tradeOffers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No trade offers yet. Create your first trade to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {tradeOffers.map((offer: TradeOffer) => (
                    <TradeOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}