import { Layout } from "@/components/layout";
import { LoginForm } from "@/components/auth";
import { motion } from "framer-motion";
import decoPuppy from "@/assets/brand/deco-puppy.png";

export default function Login() {
  return (
    <Layout>
      <div className="container py-12 min-h-[calc(100vh-200px)] flex items-center justify-center relative overflow-visible">
        {/* Friendly puppy welcoming users to login */}
        <motion.div 
          initial={{ opacity: 0, x: -40, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-16 left-4 md:left-16 lg:left-24 z-10 pointer-events-none hidden md:block"
        >
          <img 
            src={decoPuppy} 
            alt="Cachorro dando la bienvenida" 
            className="w-28 md:w-36 lg:w-44 object-contain drop-shadow-xl"
          />
        </motion.div>

        <LoginForm />
      </div>
    </Layout>
  );
}
