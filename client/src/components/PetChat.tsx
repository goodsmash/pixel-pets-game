import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Heart, Star, Smile, PlayCircle, Gift } from "lucide-react";

interface PetInteraction {
  id: number;
  userMessage: string;
  petResponse: string;
  moodChange: number;
  happinessChange: number;
  experienceGained: number;
  timestamp: string;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  mood: string;
  happiness: number;
  level: number;
  personality: any;
  memories: string[];
}

export default function PetChat({ petId }: { petId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch pet details
  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: [`/api/pets/${petId}`],
  });

  // Fetch conversation history
  const { data: interactions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: [`/api/pets/${petId}/interactions`],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      return apiRequest(`/api/pets/${petId}/chat`, "POST", { message: userMessage });
    },
    onSuccess: (data) => {
      setMessage("");
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${petId}/interactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${petId}`] });
      
      if (data.experienceGained > 0) {
        toast({
          title: "Experience Gained!",
          description: `${pet?.name} gained ${data.experienceGained} XP from your conversation!`,
        });
      }
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: "Chat Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case "happy": return "😊";
      case "excited": return "🤩";
      case "playful": return "😄";
      case "sleepy": return "😴";
      case "hungry": return "😋";
      case "curious": return "🤔";
      case "sad": return "😢";
      case "angry": return "😠";
      default: return "😊";
    }
  };

  const getHappinessColor = (happiness: number) => {
    if (happiness >= 80) return "text-green-500";
    if (happiness >= 60) return "text-yellow-500";
    if (happiness >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (petLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading your pet...</div>
        </CardContent>
      </Card>
    );
  }

  if (!pet) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-500">Pet not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={pet.imageUrl} alt={pet.name} />
            <AvatarFallback>{pet.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {pet.name} {getMoodEmoji(pet.mood)}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>Level {pet.level} {pet.type}</span>
              <span className={`flex items-center gap-1 ${getHappinessColor(pet.happiness)}`}>
                <Heart className="w-4 h-4" />
                {pet.happiness}%
              </span>
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {pet.mood}
            </Badge>
            <div className="text-sm text-gray-500">
              Mood: {pet.mood}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {interactionsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading conversation...
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 text-6xl">{getMoodEmoji(pet.mood)}</div>
                <h3 className="text-lg font-medium mb-2">
                  Say hello to {pet.name}!
                </h3>
                <p className="text-gray-600">
                  Start a conversation with your pet. They love to chat and learn about you!
                </p>
              </div>
            ) : (
              interactions.map((interaction: PetInteraction) => (
                <div key={interaction.id} className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
                      {interaction.userMessage}
                    </div>
                  </div>
                  
                  {/* Pet response */}
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={pet.imageUrl} alt={pet.name} />
                      <AvatarFallback>{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                      <p>{interaction.petResponse}</p>
                      {interaction.experienceGained > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                          <Star className="w-3 h-3" />
                          +{interaction.experienceGained} XP
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex items-start space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={pet.imageUrl} alt={pet.name} />
                  <AvatarFallback>{pet.name[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick action buttons */}
        <div className="px-4 py-2 border-t">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("How are you feeling today?")}
              className="flex items-center gap-1"
            >
              <Smile className="w-3 h-3" />
              Ask about mood
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("Want to play?")}
              className="flex items-center gap-1"
            >
              <PlayCircle className="w-3 h-3" />
              Play together
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("You're such a good pet!")}
              className="flex items-center gap-1"
            >
              <Heart className="w-3 h-3" />
              Give praise
            </Button>
          </div>
        </div>

        {/* Message input */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type a message to ${pet.name}...`}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}