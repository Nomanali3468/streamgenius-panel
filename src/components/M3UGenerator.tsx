
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileDown, Loader2, Info, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateM3U } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function M3UGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const handleGenerateM3U = async () => {
    setIsGenerating(true);
    
    try {
      const playlist = await generateM3U();
      
      // Create a blob from the M3U content
      const blob = new Blob([playlist.content], { type: "application/x-mpegURL" });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement("a");
      a.href = url;
      a.download = playlist.filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Update the last generated time
      setLastGenerated(new Date().toLocaleString());
      
      toast({
        title: "Success",
        description: "M3U playlist generated successfully",
      });
    } catch (error) {
      console.error("Error generating M3U playlist:", error);
      toast({
        title: "Error",
        description: "Failed to generate M3U playlist",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          M3U Playlist Generator
        </CardTitle>
        <CardDescription>
          Generate a custom M3U playlist with all available streams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to generate a playlist file that you can import into your IPTV player.
        </p>
        
        <div className="bg-muted rounded-md p-3 mb-4 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Streamlink Support</p>
              <p className="text-muted-foreground text-xs">
                This playlist includes streams that use Streamlink to extract content from platforms like YouTube and Twitch. 
                These streams require a backend service running Streamlink to function properly.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted rounded-md p-3 mb-4 text-sm">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Secure Streamlink Proxy</p>
              <p className="text-muted-foreground text-xs">
                Streams that use Streamlink are now routed through a secure proxy that generates temporary tokens.
                This prevents direct access to the Streamlink server and improves security.
              </p>
            </div>
          </div>
        </div>
        
        {lastGenerated && (
          <div className="text-xs text-muted-foreground">
            Last generated: {lastGenerated}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateM3U} 
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          ) : (
            <Download className="h-4 w-4" />
          )}
          Generate M3U Playlist
        </Button>
      </CardFooter>
    </Card>
  );
}
