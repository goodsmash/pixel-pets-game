import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BattleResult } from "@/types/game";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  enemy?: {
    name: string;
    health: number;
    maxHealth: number;
    difficulty: string;
  };
}

export default function BattleModal({ isOpen, onClose, enemy }: BattleModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [battlePhase, setBattlePhase] = useState<'setup' | 'battle' | 'result'>('setup');

  const battleMutation = useMutation({
    mutationFn: async ({ enemyName, action }: { enemyName: string; action: string }) => {
      const response = await apiRequest("POST", "/api/battle", { enemyName, action });
      return response.json();
    },
    onSuccess: (data) => {
      setBattleResult(data);
      setBattlePhase('result');
      queryClient.invalidateQueries({ queryKey: ["/api/pets/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      const resultMessage = data.result === 'victory' 
        ? `Victory! Gained ${data.experienceGained} XP`
        : data.result === 'defeat'
        ? `Defeat! Gained ${data.experienceGained} XP`
        : 'Battle ended';
        
      toast({
        title: "Battle Complete",
        description: resultMessage,
        variant: data.result === 'victory' ? 'default' : 'destructive',
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
        title: "Battle Error",
        description: error.message || "Battle failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBattleAction = (action: string) => {
    if (!enemy) return;
    setBattlePhase('battle');
    battleMutation.mutate({ enemyName: enemy.name, action });
  };

  const handleClose = () => {
    setBattleResult(null);
    setBattlePhase('setup');
    onClose();
  };

  const renderBattleContent = () => {
    if (battlePhase === 'battle') {
      return (
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-4xl text-game-secondary mb-4"></i>
          <p className="text-lg">Battle in progress...</p>
        </div>
      );
    }

    if (battlePhase === 'result' && battleResult) {
      return (
        <div className="text-center py-6">
          <div className={`text-4xl mb-4 ${
            battleResult.result === 'victory' ? 'text-game-success' : 'text-game-danger'
          }`}>
            <i className={`fas ${
              battleResult.result === 'victory' ? 'fa-trophy' : 'fa-skull'
            }`}></i>
          </div>
          <h3 className="text-2xl font-bold mb-4">
            {battleResult.result === 'victory' ? 'Victory!' : 'Defeat!'}
          </h3>
          <div className="space-y-2 text-sm">
            <div>Damage Dealt: {battleResult.damageDealt}</div>
            <div>Damage Taken: {battleResult.damageTaken}</div>
            <div className="text-game-accent">Experience Gained: +{battleResult.experienceGained}</div>
          </div>
          <Button 
            onClick={handleClose}
            className="mt-6 bg-game-primary hover:bg-game-primary/80"
          >
            Continue
          </Button>
        </div>
      );
    }

    // Setup phase
    return (
      <>
        {/* Battle Interface */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Your Pet */}
          <div className="text-center">
            <div className="bg-game-primary/20 rounded-lg p-4 mb-3">
              <div className="w-20 h-20 bg-game-primary/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-dragon text-2xl text-game-primary"></i>
              </div>
              <div className="font-pixel text-sm">YOUR PET</div>
            </div>
            <div className="text-xs">Ready for battle!</div>
          </div>
          
          {/* VS Enemy */}
          <div className="text-center">
            <div className="bg-game-danger/20 rounded-lg p-4 mb-3">
              <div className="w-20 h-20 bg-game-danger/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-spider text-2xl text-game-danger"></i>
              </div>
              <div className="font-pixel text-sm">{enemy?.name || 'ENEMY'}</div>
            </div>
            <div className="text-xs">Difficulty: {enemy?.difficulty || 'Unknown'}</div>
          </div>
        </div>
        
        {/* Battle Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleBattleAction('attack')}
            disabled={battleMutation.isPending}
            className="bg-game-danger hover:bg-game-danger/80 text-white"
          >
            <i className="fas fa-fist-raised mr-2"></i>
            Attack
          </Button>
          <Button 
            onClick={() => handleBattleAction('special')}
            disabled={battleMutation.isPending}
            className="bg-game-primary hover:bg-game-primary/80 text-white"
          >
            <i className="fas fa-magic mr-2"></i>
            Special Move
          </Button>
          <Button 
            onClick={() => handleBattleAction('item')}
            disabled={battleMutation.isPending}
            className="bg-game-success hover:bg-game-success/80 text-white"
          >
            <i className="fas fa-flask mr-2"></i>
            Use Item
          </Button>
          <Button 
            onClick={() => handleBattleAction('flee')}
            disabled={battleMutation.isPending}
            className="bg-game-medium hover:bg-game-medium/80 text-white"
          >
            <i className="fas fa-running mr-2"></i>
            Retreat
          </Button>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-game-dark to-black border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl text-game-danger">
            <i className="fas fa-sword mr-2"></i>
            BATTLE ARENA
          </DialogTitle>
        </DialogHeader>
        
        {renderBattleContent()}
      </DialogContent>
    </Dialog>
  );
}
