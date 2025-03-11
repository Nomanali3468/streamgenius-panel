
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FilePlus, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { StreamList } from "@/components/StreamList";
import { AdminStreamForm } from "@/components/AdminStreamForm";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { getStreams, createStream, updateStream, deleteStream } from "@/lib/api";
import { Stream } from "@/lib/types";
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
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<Stream | null>(null);
  
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
  
  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream);
    setIsFormOpen(true);
  };
  
  const handleDeleteStream = (stream: Stream) => {
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
  
  const handleSaveStream = async (data: Partial<Stream>) => {
    try {
      let updatedStream: Stream;
      
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
        updatedStream = await createStream(data as Omit<Stream, "id" | "createdAt" | "updatedAt">);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-28 pb-16 px-4 container mx-auto">
        <AnimatedTransition>
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-medium">Admin Dashboard</h1>
              <Button onClick={handleAddStream}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stream
              </Button>
            </div>
            
            <StreamList 
              streams={streams} 
              onEditStream={handleEditStream}
              onDeleteStream={handleDeleteStream}
            />
          </section>
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
    </>
  );
};

export default Admin;
