// Updated text to reflect AidSight app marketing

import React from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { Button } from '../ui/button';
import { ThreeJsScene } from './three-js-scene';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroContent() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between h-[500px] pt-8 px-4 sm:px-6 lg:px-8 gap-8">
      {/* Hero Content */}
      <div className="lg:w-1/2 w-full max-w-4xl mx-auto lg:mx-0 space-y-6 text-center lg:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 relative rounded-full p-[1px] overflow-hidden border border-transparent bg-white mx-auto lg:mx-0 w-fit"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse opacity-50"></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-full py-2 px-4 text-center">
            <p className="text-xs font-medium">This project was cooked on <a href="https://crack.diy" className="hover:opacity-80 underline">crack.diy</a> 🎉</p>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter"
        >
          Financial Impact Dashboard for Displaced Populations
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-gray-600 max-w-xl"
        >
          AidSight uses data analytics and machine learning to estimate economic losses in conflict regions, helping NGOs and donors allocate resources more effectively and transparently.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start"
        >
          <AuthButton trigger={<Button size="lg">Get Started</Button>} dashboardTrigger={<Button size="lg">Dashboard</Button>} />
          <Link href="#features">
            <Button variant="ghost" size="lg">
              Learn more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* 3D Scene */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="lg:w-1/2 w-full lg:h-full mt-8 lg:mt-0 relative"
      >
        <ThreeJsScene />
        
        {/* Testimonial Overlays - Bottom Only */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-4 left-4 max-w-[200px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-md translate-y-4"
        >
          <div className="flex mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm font-medium">"Transformed how we allocate aid resources."</p>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">- Sarah K., NGO Director</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-4 right-4 max-w-[200px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-md -translate-y-4"
        >
          <div className="flex mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm font-medium">"The data insights have been invaluable for our work."</p>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">- Michael T., Humanitarian Aid</p>
        </motion.div>
      </motion.div>
    </div>
  );
}