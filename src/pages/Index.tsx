
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, MonitorPlay, BarChart, Play, Users, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth";
import { Header } from "@/components/Header";

const features = [
  {
    title: "Stream Management",
    description: "Add, manage, and organize your IPTV streams in one place",
    icon: MonitorPlay,
  },
  {
    title: "M3U Playlist Generation",
    description: "Generate custom M3U playlists for your IPTV player",
    icon: Play,
  },
  {
    title: "User Management",
    description: "Manage user accounts and control access to your streams",
    icon: Users,
  },
  {
    title: "Admin Dashboard",
    description: "Powerful admin tools to monitor and manage your service",
    icon: Settings,
  },
];

const Index = () => {
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <>
      <Header />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
                Simplify Your IPTV <span className="text-primary">Stream Management</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A beautifully designed, easy-to-use platform for managing your IPTV streams
                and generating custom M3U playlists for any device.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild>
                <a href="/login">Get Started</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/login">Live Demo</a>
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-medium mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage and deliver your IPTV streams efficiently
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="glass-panel p-6"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="glass-panel p-8 md:p-12 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -right-[30%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h2 className="text-3xl font-medium mb-4">Ready to simplify your IPTV management?</h2>
                  <p className="text-muted-foreground mb-6">
                    Try our demo with sample credentials to explore all features:
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>User access: username <strong>"user"</strong> / password <strong>"user"</strong></span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Admin access: username <strong>"admin"</strong> / password <strong>"admin"</strong></span>
                    </li>
                  </ul>
                  <Button size="lg" asChild>
                    <a href="/login">Try the Demo</a>
                  </Button>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-background/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-border/40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-12 w-12 text-primary opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-auto py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MonitorPlay className="h-6 w-6 text-primary" />
              <span className="font-medium text-xl">StreamGenius</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StreamGenius. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
