
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MonitorPlay } from "lucide-react";
import { UserAuthForm } from "@/components/UserAuthForm";
import { isAuthenticated } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center mb-8"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-6">
          <MonitorPlay className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-medium">StreamGenius</h1>
        </div>
        <p className="text-muted-foreground">
          Sign in to manage your IPTV stream experience
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <UserAuthForm />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Demo credentials: Use "user" / "user" for regular access<br />
          or "admin" / "admin" for administrator access
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
