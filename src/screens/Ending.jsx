import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import cemeteryBg from '../assets/images/cemetery-bg.jpg'

const CORRECT_ENDING_BEATS = [
  { char: 'Ethan', text: "He died trying to find the truth. He found it. He just didn't get to tell anyone." },
  { char: 'Richard Hart', text: "Arrested two weeks after Yuna submitted her findings to the police. Charged with manslaughter. The family he built crumbled around the truth he tried to bury." },
  { char: 'Damien', text: "Finally told investigators what he saw. His testimony was the missing piece. He visits Ethan's grave every week now." },
  { char: 'Lily', text: "Wrote the story. Published it in the university paper. It went national. She dedicated it to Ethan." },
  { char: 'Elena Hart', text: "Filed for divorce. Told Yuna she was proud of her. Some silences, she said, cost too much." },
  { char: 'Yuna', text: "She learned she had a brother. She learned she lost him before she ever knew his name. She keeps his photograph on her desk — the one from the observatory, where he was documenting his own truth, right up to the end." },
]

const WRONG_ENDING_BEATS = [
  { char: 'The Case', text: "The wrong person was accused. The investigation stalled. Ethan's file was sealed." },
  { char: 'Richard Hart', text: "He never faced justice. He continued his life as though nothing happened. Some men are very good at that." },
  { char: 'Yuna', text: "She couldn't let it go. She knew she was wrong. She'd have to start over." },
]

export default function Ending() {
  const { accusationResult, accusation, discoveredEvidence, placedEvents, notebookEntries, resetGame } = useGameStore()
  const isCorrect = accusationResult === 'correct'
  const beats = isCorrect ? CORRECT_ENDING_BEATS : WRONG_ENDING_BEATS
  const [shown, setShown] = useState(0)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (shown < beats.length) {
      const t = setTimeout(() => setShown(s => s + 1), 2800)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setShowStats(true), 1000)
      return () => clearTimeout(t)
    }
  }, [shown, beats.length])

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cemeteryBg})`, filter: 'brightness(0.15)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Result header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-16 pb-8 px-8"
        >
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">Case #001 — Resolution</p>
          <h1 className={`font-serif text-4xl mb-3 ${isCorrect ? 'text-white' : 'text-crimson-light'}`}>
            {isCorrect ? 'Case Solved.' : 'Wrong Accusation.'}
          </h1>
          {isCorrect ? (
            <p className="font-mono text-sm text-white/40">Richard Hart has been identified as the killer of Ethan Vale.</p>
          ) : (
            <div>
              <p className="font-mono text-sm text-white/40">Your accusation was incorrect.</p>
              <button
                onClick={resetGame}
                className="mt-4 font-mono text-xs border border-crimson/50 text-crimson-light px-6 py-2 hover:bg-crimson/10 transition-all"
              >
                Start Investigation Over
              </button>
            </div>
          )}
        </motion.div>

        {/* Character outcome beats */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-8 py-6 space-y-6">
          <AnimatePresence>
            {beats.slice(0, shown).map((beat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="border-l-2 border-white/20 pl-5"
              >
                <p className="font-mono text-xs text-white/30 mb-1 uppercase tracking-wider">{beat.char}</p>
                <p className="font-hand text-xl text-white/75 leading-8">{beat.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto w-full px-8 pb-16"
            >
              <div className="border border-white/10 bg-black/60 p-6">
                <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-5">Investigation Summary</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    ['Evidence Discovered', `${discoveredEvidence.length} / 12`],
                    ['Timeline Reconstructed', `${placedEvents.length} / 10`],
                    ['Notebook Entries', notebookEntries.length],
                    ['Outcome', isCorrect ? '✓ Correct' : '✗ Incorrect'],
                  ].map(([label, val]) => (
                    <div key={label} className="border border-white/5 p-3">
                      <p className="font-mono text-xs text-white/25 mb-1">{label}</p>
                      <p className={`font-mono text-base ${isCorrect && label === 'Outcome' ? 'text-green-400' : 'text-white/70'}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Evidence discovered list */}
                <div className="mb-6">
                  <p className="font-mono text-xs text-white/20 mb-2">Evidence Contact Sheet</p>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 12 }, (_, i) => {
                      const evId = `ev${String(i + 1).padStart(3, '0')}`
                      const found = discoveredEvidence.includes(evId)
                      return (
                        <div
                          key={evId}
                          className="aspect-square border flex items-center justify-center"
                          style={{ border: `1px solid ${found ? '#8B1A1A' : '#222'}`, background: found ? '#1a0000' : '#0a0a0a' }}
                        >
                          {found ? (
                            <span className="font-mono text-xs text-crimson/60">{i + 1}</span>
                          ) : (
                            <div className="w-full h-full bg-black/80" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Final quote */}
                {isCorrect && (
                  <div className="border-t border-white/10 pt-5 text-center">
                    <p className="font-hand text-lg text-white/40 italic">
                      "He just wanted someone to find out the truth."
                    </p>
                    <p className="font-mono text-xs text-white/20 mt-2">— Lily Brooke, The University Herald</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetGame}
                    className="flex-1 py-3 font-mono text-xs border border-white/20 text-white/50 hover:border-white/50 hover:text-white transition-all"
                  >
                    New Investigation
                  </button>
                  {!isCorrect && (
                    <button
                      onClick={() => useGameStore.getState().setScreen('accusation') || useGameStore.setState({ phase: 'game', accusation: null, accusationResult: null })}
                      className="flex-1 py-3 font-mono text-xs border border-crimson/50 text-crimson-light hover:bg-crimson/10 transition-all"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
