import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GenerationModalProps {
  isOpen: boolean;
}

export default function GenerationModal({ isOpen }: GenerationModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="bg-gradient-to-br from-game-dark to-black border-white/20 text-white max-w-md"
        hideCloseButton
      >
        <div className="text-center py-6">
          <h3 className="font-pixel text-xl text-game-secondary mb-4">GENERATING PET...</h3>
          <div className="w-32 h-32 bg-gradient-to-br from-game-primary/20 to-game-secondary/20 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <i className="fas fa-sparkles text-4xl text-game-accent animate-bounce"></i>
          </div>
          <p className="text-sm text-white/70 mb-4">Using SHA-256 hash to create a unique pixel pet...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-game-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-game-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-game-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
