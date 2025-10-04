"use client"

import { motion } from "framer-motion"
import { ReactNode, ElementType } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: ElementType
}

// Wrapper reutilizable para animaciones de aparición.
export function FadeIn({ children, delay = 0, className, as: Tag = "div" }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {/** Render dinámico del contenedor */}
      {Tag ? <Tag>{children}</Tag> : <div>{children}</div>}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  delayChildren?: number
  stagger?: number
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0.1,
  stagger = 0.08,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
    >
      {children}
    </motion.div>
  )
}
