import { Layout } from "@/components/layout";
import { RegisterForm } from "@/components/auth";
import { motion } from "framer-motion";
import dogPeeking from "@/assets/brand/dog-peeking.png";

export default function Registro() {
  return (
    <Layout>
      <div className="container py-12 relative overflow-visible">
        {/* Welcome committee dog - peeking from bottom-left, curious about registration */}
        <motion.img
          src={dogPeeking}
          alt="Perro curioso esperándote"
          initial={{ opacity: 0, y: 50, x: -30 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="peeking-dog -bottom-8 -left-4 md:left-8 lg:left-16 w-32 sm:w-40 md:w-52 lg:w-64 object-contain drop-shadow-xl hidden md:block"
        />
        <RegisterForm />
      </div>
    </Layout>
  );
}
