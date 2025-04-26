// TODO: THIS IS THE LANDING PAGE THAT THE USER WILL ALWAYS FIRST SEE.
// Make sure that the marketing text in the HeroContent and FeaturesSection are always edited to reflect the app marketing

"use client"
import Image from "next/image";
import { AuthButton } from "@/components/auth/AuthButton";
import { ThreeJsScene } from "@/components/landing/three-js-scene";
import { HeroContent } from "@/components/landing/HeroContent";
import { Header } from "@/components/landing/Header";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="max-w-6xl mx-auto relative px-4">
        <Header />
        <HeroContent />
        <FeaturesSection />
      </div>
      <Footer />
    </motion.div>
  );
}
