"use client"

import { motion } from "framer-motion"

const Animation = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 13,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: { duration: 0.444, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  )
}

export default Animation
