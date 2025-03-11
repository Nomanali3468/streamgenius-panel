
import { useState } from "react";
import { MoreHorizontal, Play, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stream } from "@/lib/types";
import { isAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface StreamCardProps {
  stream: Stream;
  onEdit?: (stream: Stream) => void;
  onDelete?: (stream: Stream) => void;
}

export function StreamCard({ stream, onEdit, onDelete }: StreamCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const fallbackImage = `/placeholder.svg`;

  const isAdminUser = isAdmin();

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      !stream.isActive && "opacity-75"
    )}>
      <div className="relative aspect-video bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}
        <img
          src={imageError ? fallbackImage : (stream.logo || fallbackImage)}
          alt={stream.name}
          className={cn(
            "w-full h-full object-cover transition-opacity",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="sm" className="rounded-full" variant="secondary">
            <Play className="h-4 w-4 mr-1" />
            Play
          </Button>
        </div>
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
            {stream.category}
          </span>
        </div>
        {isAdminUser && (
          <div className="absolute top-2 left-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(stream)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(stream)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-medium line-clamp-1">{stream.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {stream.url}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
