
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Header } from "@/components/Header";
import { StreamList } from "@/components/StreamList";
import { M3UGenerator } from "@/components/M3UGenerator";
import { AnimatedTransition } from "@/components/AnimatedTransition";
import { getStreams } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    <>
      <Header />
      <main className="pt-28 pb-16 px-4 container mx-auto">
        <AnimatedTransition>
          <section className="mb-12">
            <h1 className="text-3xl font-medium mb-6">Your Streams</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <StreamList streams={streams} />
              </div>
              <div className="lg:col-span-1">
                <M3UGenerator />
              </div>
            </div>
          </section>
        </AnimatedTransition>
      </main>
    </>
  );
};

export default Dashboard;
