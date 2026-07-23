import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore, { SUSPECTS, EVIDENCE_DATA } from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'

export default function Accusation() {
  const { discoveredEvidence, submitAccusation, placedEvents, setScreen } = useGameStore()
  const [killerId, setKillerId] = useState('')
  const [motive, setMotive] = useState('')
  const [method, setMethod] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const availableEvidence = EVIDENCE_DATA.filter(e => discoveredEvidence.includes(e.id))

  const toggleEvidence = (id) => {
    setSelectedEvidence(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const canSubmit = killerId && motive.trim() && method.trim() && selectedEvidence.length >= 2

  const handleSubmit = () => {
    if (!canSubmit) {
      setError('You need: a suspect, a motive, a method, and at least 2 pieces of evidence.')
      return
    }
    if (!confirmed) {
      setConfirmed(true)
      setError('')
      return
    }
    submitAccusation({ killerId, motive, method, evidenceIds: selectedEvidence, timelineIds: placedEvents })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-sm px-8 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('hub')} className="font-mono text-xs text-white/40 hover:text-white transition-colors">← Hub</button>
          <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Final Accusation</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-3">Case #001</p>
            <h2 className="font-serif text-3xl text-white/90 mb-2">Who Killed Ethan Vale?</h2>
            <p className="font-mono text-sm text-white/40">Submit your conclusion. Make sure you have the evidence to support it.</p>
          </div>

          {/* Suspect */}
          <div className="mb-6">
            <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-3">The Killer</p>
            <div className="grid grid-cols-1 gap-2">
              {SUSPECTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setKillerId(s.id); setConfirmed(false) }}
                  className={`p-4 border text-left transition-all ${
                    killerId === s.id
                      ? 'border-crimson bg-crimson/10 suspect-card accused'
                      : 'border-white/15 hover:border-white/40 suspect-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm text-white/85">{s.name}</p>
                      <p className="font-mono text-xs text-white/35 mt-1">{s.motive}</p>
                    </div>
                    {killerId === s.id && (
                      <span className="stamp text-xs">ACCUSED</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motive */}
          <div className="mb-6">
            <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-3">The Motive</p>
            <textarea
              value={motive}
              onChange={e => { setMotive(e.target.value); setConfirmed(false) }}
              placeholder="Why did they kill Ethan? What were they protecting?"
              rows={3}
              className="w-full bg-black/55 border border-white/10 text-white caret-crimson font-mono text-sm px-4 py-3 focus:outline-none focus:border-crimson/50 focus:bg-black/70 placeholder-white/35 resize-none"
            />
          </div>

          {/* Method */}
          <div className="mb-6">
            <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-3">The Method</p>
            <textarea
              value={method}
              onChange={e => { setMethod(e.target.value); setConfirmed(false) }}
              placeholder="How did they do it? What happened at the observatory?"
              rows={3}
              className="w-full bg-black/55 border border-white/10 text-white caret-crimson font-mono text-sm px-4 py-3 focus:outline-none focus:border-crimson/50 focus:bg-black/70 placeholder-white/35 resize-none"
            />
          </div>

          {/* Evidence selection */}
          <div className="mb-8">
            <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-1">Supporting Evidence</p>
            <p className="font-mono text-xs text-white/20 mb-3">Select 2–3 key pieces of evidence</p>
            {availableEvidence.length === 0 ? (
              <p className="font-mono text-xs text-white/20 border border-white/5 p-4">No evidence discovered yet. Investigate first.</p>
            ) : (
              <div className="space-y-2">
                {availableEvidence.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => { toggleEvidence(ev.id); setConfirmed(false) }}
                    className={`w-full p-3 border text-left transition-all flex items-center gap-3 ${
                      selectedEvidence.includes(ev.id)
                        ? 'border-crimson/60 bg-crimson/5'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedEvidence.includes(ev.id) ? 'border-crimson bg-crimson' : 'border-white/30'
                    }`}>
                      {selectedEvidence.includes(ev.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-white/70">{ev.title}</p>
                      <p className="font-mono text-xs text-white/30 mt-0.5 line-clamp-1">{ev.description.slice(0, 60)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 border border-yellow-500/30 bg-yellow-500/5 p-3">
              <p className="font-mono text-xs text-yellow-400">{error}</p>
            </motion.div>
          )}

          {/* Confirm warning */}
          <AnimatePresence>
            {confirmed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 border border-crimson/40 bg-crimson/5 p-4"
              >
                <p className="font-mono text-sm text-crimson-light font-bold mb-2">⚠️ Are you certain?</p>
                <p className="font-mono text-xs text-white/50">
                  You are accusing <strong className="text-white/80">{SUSPECTS.find(s => s.id === killerId)?.name}</strong> of murdering Ethan Vale.
                  Once submitted, the case will close. This cannot be undone.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!killerId}
            className={`w-full py-4 font-mono text-sm tracking-widest uppercase transition-all ${
              confirmed
                ? 'bg-crimson text-white hover:bg-crimson-light border-2 border-crimson-light'
                : canSubmit
                ? 'border border-crimson/60 text-crimson-light hover:bg-crimson/10'
                : 'border border-white/10 text-white/20 cursor-not-allowed'
            }`}
          >
            {confirmed ? '⚖️ CONFIRM ACCUSATION' : 'Submit Accusation'}
          </button>

          <p className="font-mono text-xs text-white/15 text-center mt-4">
            {discoveredEvidence.length}/12 clues · {placedEvents.length}/10 timeline events
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
