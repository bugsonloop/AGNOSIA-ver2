import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useGameStore from './store/gameStore.js'

import Landing from './screens/Landing.jsx'
import Intro from './screens/Intro.jsx'
import Hub from './screens/Hub.jsx'
import Evidence from './screens/Evidence.jsx'
import Interviews from './screens/Interviews.jsx'
import Timeline from './screens/Timeline.jsx'
import Deduction from './screens/Deduction.jsx'
import Notebook from './screens/Notebook.jsx'
import Accusation from './screens/Accusation.jsx'
import Ending from './screens/Ending.jsx'

function GameScreenRouter() {
  const currentScreen = useGameStore(s => s.currentScreen)
  const screens = {
    hub: <Hub />,
    evidence: <Evidence />,
    interviews: <Interviews />,
    timeline: <Timeline />,
    deduction: <Deduction />,
    notebook: <Notebook />,
    accusation: <Accusation />,
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
      >
        {screens[currentScreen] || <Hub />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const { phase } = useGameStore()
  return (
    <div className="w-full min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Landing />
          </motion.div>
        )}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Intro />
          </motion.div>
        )}
        {phase === 'game' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full min-h-screen">
            <GameScreenRouter />
          </motion.div>
        )}
        {phase === 'ending' && (
          <motion.div key="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Ending />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
