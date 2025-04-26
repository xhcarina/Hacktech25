"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber"
import { OrbitControls, TorusKnot, Plane, Circle } from "@react-three/drei"
import * as THREE from "three"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import { motion } from "framer-motion"

// Extend Three.js objects to make them available as JSX elements
extend({ RectAreaLight: THREE.RectAreaLight, RectAreaLightHelper })

// Initialize RectAreaLightUniformsLib
RectAreaLightUniformsLib.init()

function Scene() {
  const knot = useRef<THREE.Mesh>(null)
  const redLightRef = useRef<THREE.RectAreaLight>(null)
  const greenLightRef = useRef<THREE.RectAreaLight>(null)
  const blueLightRef = useRef<THREE.RectAreaLight>(null)
  const { viewport } = useThree()
  const isMobile = viewport.width < 7.5 // Roughly equivalent to lg breakpoint

  useFrame(({ clock }) => {
    if (knot.current) {
      knot.current.rotation.y = clock.getElapsedTime() * 0.5
    }
  })

  // Create helpers after the lights are initialized
  useEffect(() => {
    if (redLightRef.current) {
      const helper = new RectAreaLightHelper(redLightRef.current)
      redLightRef.current.add(helper)
    }
    if (greenLightRef.current) {
      const helper = new RectAreaLightHelper(greenLightRef.current)
      greenLightRef.current.add(helper)
    }
    if (blueLightRef.current) {
      const helper = new RectAreaLightHelper(blueLightRef.current)
      blueLightRef.current.add(helper)
    }

    return () => {
      // Clean up helpers on unmount
      if (redLightRef.current) {
        const helper = redLightRef.current.children.find((child) => child instanceof RectAreaLightHelper)
        if (helper) redLightRef.current.remove(helper)
      }
      if (greenLightRef.current) {
        const helper = greenLightRef.current.children.find((child) => child instanceof RectAreaLightHelper)
        if (helper) greenLightRef.current.remove(helper)
      }
      if (blueLightRef.current) {
        const helper = blueLightRef.current.children.find((child) => child instanceof RectAreaLightHelper)
        if (helper) blueLightRef.current.remove(helper)
      }
    }
  }, [])

  return (
    <>
      {/* Lights */}
      <rectAreaLight
        ref={redLightRef}
        color="#ec4899"
        intensity={3.5}
        width={4}
        height={10}
        position={[-5, 5, 5]}
        lookAt={[0, 5, 0]}
      />
      <rectAreaLight
        ref={greenLightRef}
        color="#a855f7"
        intensity={3.5}
        width={4}
        height={10}
        position={[0, 5, 5]}
        lookAt={[0, 5, 0]}
      />
      <rectAreaLight
        ref={blueLightRef}
        color="#3b82f6"
        intensity={3.5}
        width={4}
        height={10}
        position={[5, 5, 5]}
        lookAt={[0, 5, 0]}
      />

      {/* Torus Knot */}
      <TorusKnot ref={knot} args={[1.5, 0.5, 200, 16]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} />
      </TorusKnot>

      {/* Controls */}
      <OrbitControls enablePan={false} enableZoom={false} minDistance={5} maxDistance={20} target={[0, 5, 0]}/>
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
        camera={{ position: [0, 5, -10], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </motion.div>
  )
}
