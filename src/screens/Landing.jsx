import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import homeBg from '../assets/images/home-bg.jpg'

export default function Landing() {
  const { startGame, gameStarted, phase } = useGameStore()
  const [hovered, setHovered] = useState(null)

  const handlePlay = () => startGame()
  const handleContinue = () => useGameStore.getState().setScreen('hub') || useGameStore.setState({ phase: 'game' })

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${homeBg})`, filter: 'brightness(0.35)' }}
      />

      {/* Red string overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
        <line x1="0" y1="200" x2="800" y2="500" stroke="#cc2200" strokeWidth="1.5" />
        <line x1="300" y1="0" x2="1400" y2="600" stroke="#cc2200" strokeWidth="1" />
        <line x1="900" y1="0" x2="200" y2="900" stroke="#cc2200" strokeWidth="1.5" />
        <line x1="600" y1="300" x2="1600" y2="200" stroke="#cc2200" strokeWidth="1" />
        <line x1="0" y1="600" x2="1200" y2="100" stroke="#cc2200" strokeWidth="0.8" />
      </svg>

      {/* Top nav bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10">
        <span className="text-white font-mono text-sm tracking-widest">Agnosia</span>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="ml-auto mr-24 text-right">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-mono text-6xl font-bold text-white tracking-[0.15em] mb-12"
          >
            AGNOSIA
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col gap-3 items-end"
          >
            {[
              { label: 'PLAY', action: handlePlay, primary: true },
              { label: 'HOW TO', action: null },
              { label: 'HELP', action: null },
              { label: 'EXIT', action: null },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                className={`font-mono text-xl tracking-[0.2em] transition-all duration-200 px-4 py-1 text-right ${
                  hovered === item.label ? 'text-white bg-crimson/30' : 'text-white/80'
                } ${item.primary ? 'text-white' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="font-mono text-sm text-white/60 tracking-widest italic">
          "You've seen it with your eyes"
        </p>
      </motion.div>
    </div>
  )
}
