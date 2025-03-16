
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Play } from "lucide-react";
import { motion } from "framer-motion";

import { Header } from "@/components/Header";
import { StreamList } from "@/components/StreamList";
import { M3UGenerator } from "@/components/M3UGenerator";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { getStreams } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Fetch streams
    const fetchData = async () => {
      try {
        const data = await getStreams();
        setStreams(data);
      } catch (error) {
        console.error("Error fetching streams:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const categories = [...new Set(streams.map(stream => stream.category))];
  
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? stream.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="mt-4 text-muted-foreground">Loading streams...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-primary mr-2">
              <Play className="h-8 w-8 fill-primary" />
            </div>
            <h1 className="text-2xl font-bold">Live TV</h1>
          </div>
          <M3UGenerator className="hidden md:block" />
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? "bg-primary text-white font-medium"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white font-medium"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <main className="flex-1 p-4">
        <AnimatedTransition>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStreams.map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
          {filteredStreams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No streams found</p>
            </div>
          )}
        </AnimatedTransition>
      </main>
      
      <div className="md:hidden bg-white p-4 border-t">
        <M3UGenerator />
      </div>
    </div>
  );
};

// Move StreamCard into the Dashboard file for simplicity
const StreamCard = ({ stream }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const fallbackImage = `/placeholder.svg`;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
          className={`w-full h-full object-cover transition-opacity ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium">
            {stream.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">{stream.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-1">{stream.url}</p>
      </div>
    </div>
  );
};

export default Dashboard;
