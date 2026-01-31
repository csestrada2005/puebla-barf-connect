import { Layout } from "@/components/layout";
import { RegisterForm } from "@/components/auth";
import { motion } from "framer-motion";
import dogPeeking from "@/assets/brand/dog-peeking.png";

export default function Registro() {
  return (
    <Layout>
      <div className="container py-12 relative overflow-visible">
        {/* Curious dog peeking at registration form */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute top-20 right-4 md:right-8 lg:right-16 z-10 pointer-events-none hidden lg:block"
        >
          <img 
            src={dogPeeking} 
            alt="Perro curioso observando" 
            className="w-32 md:w-40 object-contain drop-shadow-xl"
          />
        </motion.div>

        <RegisterForm />
      </div>
    </Layout>
  );
}
