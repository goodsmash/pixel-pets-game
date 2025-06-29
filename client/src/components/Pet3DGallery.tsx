import { useState, useEffect } from 'react';
import { Pet3DViewer } from './Pet3DViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Upload, Copy, Hash, Sparkles, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Pet } from '@shared/schema';

interface Pet3DGalleryProps {
  selectedPet: Pet | null;
  onPetSelect?: (pet: Pet) => void;
}

export function Pet3DGallery({ selectedPet, onPetSelect }: Pet3DGalleryProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'lua'>('json');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all pets for gallery
  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['/api/pets']
  });

  // Generate pet mutation
  const generatePetMutation = useMutation({
    mutationFn: async (seed: string) => {
      const response = await fetch('/api/pets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed })
      });
      return response.json();
    },
    onSuccess: (newPet) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      onPetSelect?.(newPet);
      toast({
        title: "Pet Generated!",
        description: `${newPet.name} has been created with unique 3D characteristics.`
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new pet. Please try again.",
        variant: "destructive"
      });
    }
  });

  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGeneratePet = async () => {
    if (!hashInput.trim()) {
      toast({
        title: "Seed Required",
        description: "Please enter a word or phrase to generate your pet.",
        variant: "destructive"
      });
      return;
    }
    
    generatePetMutation.mutate(hashInput.trim());
  };

  const exportPet = (pet: Pet, format: 'json' | 'lua') => {
    if (!pet) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify({
        name: pet.name,
        hash: pet.sha256Hash,
        attributes: {
          color: pet.color,
          size: pet.size,
          type: pet.type,
          element: pet.element,
          rarity: pet.rarity,
          level: pet.level,
          traits: pet.traits,
          abilities: pet.abilities
        },
        stats: {
          health: pet.health,
          attack: pet.attack,
          defense: pet.defense,
          speed: pet.speed,
          intelligence: pet.intelligence,
          luck: pet.luck
        },
        metadata: {
          created: pet.createdAt,
          generation: pet.generation,
          isShiny: pet.isShiny
        }
      }, null, 2);
      filename = `${pet.name.replace(/\s+/g, '_')}_${pet.sha256Hash.substring(0, 8)}.json`;
      mimeType = 'application/json';
    } else {
      // Lua format for Roblox integration
      content = `local pet = {
    name = "${pet.name}",
    hash = "${pet.sha256Hash}",
    
    attributes = {
        color = "${pet.color}",
        size = "${pet.size}",
        type = "${pet.type}",
        element = "${pet.element}",
        rarity = "${pet.rarity}",
        level = ${pet.level || 1}
    },
    
    stats = {
        health = ${pet.health || 100},
        attack = ${pet.attack || 10},
        defense = ${pet.defense || 10},
        speed = ${pet.speed || 10},
        intelligence = ${pet.intelligence || 10},
        luck = ${pet.luck || 10}
    },
    
    visual = {
        isShiny = ${pet.isShiny ? 'true' : 'false'},
        generation = ${pet.generation || 1}
    }
}

return pet`;
      filename = `${pet.name.replace(/\s+/g, '_')}_${pet.sha256Hash.substring(0, 8)}.lua`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Pet data exported as ${format.toUpperCase()} file.`
    });
  };

  const handleImportPet = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a pet file to import.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await importFile.text();
      const petData = JSON.parse(text);
      
      // Validate basic structure
      if (!petData.hash || !petData.name || !petData.attributes) {
        throw new Error('Invalid pet file format');
      }

      // Generate pet from imported data
      generatePetMutation.mutate(petData.name);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${petData.name}!`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid pet file format. Please check the file and try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Hash copied to clipboard."
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            3D Pet Gallery & Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pet Seed (word or phrase)
                  </label>
                  <Input
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter a unique word or phrase"
                    onKeyDown={(e) => e.key === 'Enter' && handleGeneratePet()}
                  />
                </div>
                <Button 
                  onClick={handleGeneratePet}
                  disabled={generatePetMutation.isPending || !hashInput.trim()}
                  className="w-full"
                >
                  {generatePetMutation.isPending ? 'Generating...' : 'Generate 3D Pet'}
                </Button>
              </div>

              {selectedPet && (
                <div className="space-y-4">
                  <Separator />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{selectedPet.name}</h3>
                    <Pet3DViewer 
                      petHash={selectedPet.sha256Hash}
                      width={300}
                      height={250}
                      className="mx-auto mb-4"
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Hash:</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(selectedPet.sha256Hash)}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        {selectedPet.sha256Hash}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Health</p>
                        <p className="font-semibold">{selectedPet.health || 100}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Attack</p>
                        <p className="font-semibold">{selectedPet.attack || 10}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Defense</p>
                        <p className="font-semibold">{selectedPet.defense || 10}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Badge className={`text-white ${getRarityColor(selectedPet.rarity || 'common')}`}>
                        {selectedPet.rarity}
                      </Badge>
                      <Badge variant="outline">{selectedPet.element}</Badge>
                      {selectedPet.isShiny && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Shiny
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(pets as Pet[]).map((pet: Pet) => (
                      <Card 
                        key={pet.id} 
                        className={`cursor-pointer transition-all ${
                          selectedPet?.id === pet.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => onPetSelect?.(pet)}
                      >
                        <CardContent className="p-3">
                          <Pet3DViewer 
                            petHash={pet.sha256Hash}
                            width={120}
                            height={100}
                            enableControls={false}
                            className="mx-auto mb-2"
                          />
                          <h4 className="font-medium text-sm text-center truncate">
                            {pet.name}
                          </h4>
                          <div className="flex justify-center mt-1">
                            <Badge 
                              className={`text-white text-xs ${getRarityColor(pet.rarity || 'common')}`}
                            >
                              {pet.rarity}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              {selectedPet ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Export Format</label>
                    <div className="flex gap-2">
                      <Button
                        variant={exportFormat === 'json' ? 'default' : 'outline'}
                        onClick={() => setExportFormat('json')}
                        size="sm"
                      >
                        JSON
                      </Button>
                      <Button
                        variant={exportFormat === 'lua' ? 'default' : 'outline'}
                        onClick={() => setExportFormat('lua')}
                        size="sm"
                      >
                        Lua (Roblox)
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => exportPet(selectedPet, exportFormat)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedPet.name}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a pet to export</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Import Pet File</label>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <Button 
                  onClick={handleImportPet}
                  disabled={!importFile}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Pet
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}