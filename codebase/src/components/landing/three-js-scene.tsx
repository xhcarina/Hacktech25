"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber"
import { OrbitControls, TorusKnot } from "@react-three/drei"
import * as THREE from "three"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import { motion } from "framer-motion"

// Extend Three.js objects to make them available as JSX elements
extend({ RectAreaLight: THREE.RectAreaLight, RectAreaLightHelper })

// Initialize RectAreaLightUniformsLib
RectAreaLightUniformsLib.init()

function Scene() {
  const torusKnotRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.RectAreaLight>(null)
  const { viewport } = useThree()
  const isMobile = viewport.width < 7.5 // Roughly equivalent to lg breakpoint

  // Create helper after the light is initialized
  useEffect(() => {
    if (lightRef.current) {
      const helper = new RectAreaLightHelper(lightRef.current)
      lightRef.current.add(helper)
    }

    return () => {
      // Clean up helper on unmount
      if (lightRef.current) {
        const helper = lightRef.current.children.find((child) => child instanceof RectAreaLightHelper)
        if (helper) lightRef.current.remove(helper)
      }
    }
  }, [])

  useFrame(({ clock }) => {
    if (torusKnotRef.current) {
      // Rotate the torus knot
      torusKnotRef.current.rotation.x = clock.getElapsedTime() * 0.5
      torusKnotRef.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <>
      {/* Light */}
      <rectAreaLight
        ref={lightRef}
        color="#0e7490"
        intensity={1.5}
        width={10}
        height={10}
        position={[0, 0, 5]}
        lookAt={[0, 0, 0]}
      />

      {/* Ambient light for better visibility */}
      <ambientLight intensity={0.2} />

      {/* Torus Knot */}
      <TorusKnot
        ref={torusKnotRef}
        args={[1, 0.3, 128, 32]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.1}
          metalness={0.8}
        />
      </TorusKnot>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={5}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function ThreeJsScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Canvas
        gl={{ alpha: true }} // Transparent background
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </motion.div>
  )
}