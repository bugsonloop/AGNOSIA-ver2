import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import interrogationBg from '../assets/images/interrogation-room-2.jpg'

const MENU_ITEMS = [
  {
    id: 'evidence',
    label: 'Evidence Archive',
    sub: 'Inspect clues, photos, documents',
    icon: '🔍',
  },
  {
    id: 'interviews',
    label: 'Interview Room',
    sub: 'Question witnesses and suspects',
    icon: '🎙️',
  },
  {
    id: 'timeline',
    label: 'Timeline Reconstruction',
    sub: "Rebuild Ethan's final days",
    icon: '🎞️',
  },
  {
    id: 'deduction',
    label: 'Deduction Board',
    sub: 'Connect suspects, motives, evidence',
    icon: '🕸️',
  },
  {
    id: 'notebook',
    label: 'Detective Notebook',
    sub: 'Your notes and discoveries',
    icon: '📓',
  },
  {
    id: 'accusation',
    label: 'Make Accusation',
    sub: 'Submit your conclusion',
    icon: '⚖️',
  },
]

export default function Hub() {
  const { goToScreen, discoveredEvidence, foundContradictions, placedEvents, notebookEntries, gameStarted } = useGameStore()

  const progress = {
    evidence: `${discoveredEvidence.length}/12`,
    contradictions: foundContradictions.length,
    timeline: `${placedEvents.length}/10`,
    notes: notebookEntries.length,
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${interrogationBg})`, filter: 'brightness(0.25)' }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-20 border-b border-white/5">
        <div>
          <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Case File #001</p>
          <h1 className="font-serif text-lg text-white/90">Who Killed Ethan Vale?</h1>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-white/40">
          <span>Evidence: <span className="text-white/70">{progress.evidence}</span></span>
          <span>Contradictions: <span className="text-crimson-light">{progress.contradictions}</span></span>
          <span>Timeline: <span className="text-white/70">{progress.timeline}</span></span>
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pt-16">
        <div className="w-full max-w-2xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-6 text-center">
              Where do you want to investigate?
            </p>

            <div className="grid grid-cols-1 gap-2">
              {MENU_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => goToScreen(item.id)}
                  className="group flex items-center gap-4 px-6 py-4 border border-white/10 hover:border-crimson/60 bg-black/40 hover:bg-crimson/10 transition-all duration-200 text-left"
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-mono text-sm text-white/80 group-hover:text-white transition-colors">{item.label}</p>
                    <p className="font-mono text-xs text-white/30 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="font-mono text-xs text-white/20 group-hover:text-crimson-light transition-colors">→</span>
                </motion.button>
              ))}
            </div>

            {/* Quick stats */}
            {notebookEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 border-l-2 border-crimson/40 pl-4"
              >
                <p className="font-mono text-xs text-white/30 mb-1">Latest notebook entry</p>
                <p className="font-mono text-xs text-white/50 italic">
                  "{notebookEntries[notebookEntries.length - 1]?.text?.slice(0, 80)}..."
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
