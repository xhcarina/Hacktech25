'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <motion.header 
      className="w-full py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-extrabold bg-gradient-to-r from-primary via-accent to-[#5D3FD3] bg-clip-text text-transparent">
          Live Aid
        </Link>
        <nav>
          <AuthButton />
        </nav>
      </div>
    </motion.header>
  )
}