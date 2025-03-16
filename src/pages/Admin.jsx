
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, Plus, Play, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminStreamForm } from "@/components/AdminStreamForm";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { getStreams, createStream, updateStream, deleteStream } from "@/lib/api";
import { isAdmin, isAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    if (!isAdmin()) {
      navigate("/dashboard");
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
  
  const handleAddStream = () => {
    setEditingStream(undefined);
    setIsFormOpen(true);
  };
  
  const handleEditStream = (stream) => {
    setEditingStream(stream);
    setIsFormOpen(true);
  };
  
  const handleDeleteStream = (stream) => {
    setStreamToDelete(stream);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteStream = async () => {
    if (!streamToDelete) return;
    
    try {
      await deleteStream(streamToDelete.id);
      
      // Update local state
      setStreams(streams.filter(s => s.id !== streamToDelete.id));
      
      toast({
        title: "Success",
        description: `Stream "${streamToDelete.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stream.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setStreamToDelete(null);
    }
  };
  
  const handleSaveStream = async (data) => {
    try {
      let updatedStream;
      
      if (data.id) {
        // Update existing stream
        updatedStream = await updateStream(data.id, data);
        setStreams(
          streams.map(s => (s.id === data.id ? { ...s, ...updatedStream } : s))
        );
        
        toast({
          title: "Success",
          description: `Stream "${updatedStream.name}" has been updated.`,
        });
      } else {
        // Create new stream
        updatedStream = await createStream(data);
        setStreams([...streams, updatedStream]);
        
        toast({
          title: "Success",
          description: `Stream "${updatedStream.name}" has been created.`,
        });
      }
      
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save stream.",
        variant: "destructive",
      });
    }
  };

  const categories = [...new Set(streams.map(stream => stream.category))];
  
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        stream.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? stream.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
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
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm">StreamGenius</p>
            </div>
          </div>
          <Button onClick={handleAddStream} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Stream
          </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {filteredStreams.map(stream => (
              <AdminStreamCard 
                key={stream.id} 
                stream={stream} 
                onEdit={handleEditStream}
                onDelete={handleDeleteStream}
              />
            ))}
          </div>
          {filteredStreams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No streams found</p>
            </div>
          )}
        </AnimatedTransition>
      </main>
      
      <AdminStreamForm
        stream={editingStream}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveStream}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the stream "{streamToDelete?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStream}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Admin Stream Card Component
const AdminStreamCard = ({ stream, onEdit, onDelete }) => {
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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        <button 
          onClick={() => onEdit(stream)}
          className="absolute top-2 left-2 h-8 w-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50"
        >
          <span className="text-sm">•••</span>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">{stream.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-1">{stream.url}</p>
      </div>
    </div>
  );
};

export default Admin;
