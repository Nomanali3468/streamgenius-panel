import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { StreamCard } from "@/components/StreamCard";
import { Stream } from "@/lib/types";
import { AnimatedList } from "@/components/AnimatedTransition";
import { Search } from "lucide-react";

interface StreamListProps {
  streams: Stream[];
  onEditStream?: (stream: Stream) => void;
  onDeleteStream?: (stream: Stream) => void;
}

export function StreamList({ 
  streams, 
  onEditStream, 
  onDeleteStream 
}: StreamListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    streams.forEach(stream => {
      if (stream.category) {
        categorySet.add(stream.category);
      }
    });
    return Array.from(categorySet);
  }, [streams]);
  
  const filteredStreams = useMemo(() => {
    return streams.filter(stream => {
      const matchesSearch = stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           stream.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? stream.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [streams, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {filteredStreams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No streams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatedList staggerDelay={0.05}>
            {filteredStreams.map(stream => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onEdit={onEditStream}
                onDelete={onDeleteStream}
              />
            ))}
          </AnimatedList>
        </div>
      )}
    </div>
  );
}
