import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore, { EVIDENCE_DATA } from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import paperBg from '../assets/images/paper-bg.jpg'

const CATEGORY_COLORS = {
  'Official Document': '#3b82f6',
  'Physical Evidence': '#f59e0b',
  'Personal Document': '#8b5cf6',
  'Handwritten Notes': '#10b981',
  'Digital Evidence': '#06b6d4',
  'Photography': '#ec4899',
  'Witness Statement': '#6b7280',
  'Financial Document': '#84cc16',
}

function EvidenceModal({ evidence, onClose }) {
  const { inspectEvidence, pinEvidence, pinnedEvidence, discoverEvidence } = useGameStore()
  const [zoomed, setZoomed] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [showMeta, setShowMeta] = useState(false)
  const isPinned = pinnedEvidence.includes(evidence.id)

  const handleInspect = () => {
    inspectEvidence(evidence.id)
    setShowHidden(false)
  }

  const handleRevealClue = () => {
    setShowHidden(true)
    // Discovering hidden clue might unlock next evidence
    if (evidence.id === 'ev001') discoverEvidence('ev003')
    if (evidence.id === 'ev004') discoverEvidence('ev005')
    if (evidence.id === 'ev006') discoverEvidence('ev007')
    if (evidence.id === 'ev007') discoverEvidence('ev008')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: '#111', border: '1px solid #333' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <span
              className="clue-tag mb-2 inline-block"
              style={{ borderColor: CATEGORY_COLORS[evidence.category] + '80', color: CATEGORY_COLORS[evidence.category] }}
            >
              {evidence.category}
            </span>
            <h2 className="font-mono text-xl text-white">{evidence.title}</h2>
            <p className="font-mono text-xs text-white/40 mt-1">{evidence.dateFound} • {evidence.id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl ml-4">✕</button>
        </div>

        {/* Photo placeholder */}
        <div
          className={`relative cursor-pointer overflow-hidden transition-all duration-300 ${zoomed ? 'h-96' : 'h-48'}`}
          style={{ background: '#1a1a1a' }}
          onClick={() => setZoomed(z => !z)}
        >
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-mono text-xs text-white/20">[{evidence.photoPlaceholder}]</p>
            <p className="font-mono text-xs text-white/10">Replace with actual photo</p>
          </div>
          <div className="absolute bottom-2 right-2 font-mono text-xs text-white/20">
            {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
          </div>
          {/* Magnifier icon */}
          <div className="absolute top-2 left-2">
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-2">Evidence Description</p>
            <p className="font-mono text-sm text-white/70 leading-7">{evidence.description}</p>
          </div>

          {/* Yuna's note */}
          <div className="border-l-2 border-crimson pl-4 py-2">
            <p className="font-mono text-xs text-white/30 mb-1">Yuna's Note</p>
            <p className="font-mono text-sm text-white/60 italic">"{evidence.yunaNote}"</p>
          </div>

          {/* Metadata if available */}
          {evidence.metadata && (
            <div>
              <button
                onClick={() => setShowMeta(m => !m)}
                className="font-mono text-xs text-crimson-light hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showMeta ? 'Hide' : 'View'} Metadata
              </button>
              {showMeta && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-black/40 border border-white/10 font-mono text-xs space-y-1"
                >
                  {Object.entries(evidence.metadata).map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-white/30 min-w-24">{k}:</span>
                      <span className={`text-white/60 ${k === 'modified' ? 'text-green-400' : ''}`}>{v}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Hidden clue reveal */}
          {evidence.hasHiddenClue && (
            <div>
              {!showHidden ? (
                <button
                  onClick={handleRevealClue}
                  className="flex items-center gap-2 font-mono text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors border border-yellow-400/20 hover:border-yellow-400/50 px-3 py-2 w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Look closer — inspect for hidden details
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-yellow-400/5 border border-yellow-400/30"
                >
                  <p className="font-mono text-xs text-yellow-400/60 mb-1">Hidden Clue Discovered</p>
                  <p className="font-mono text-sm text-yellow-400/80">{evidence.hiddenClue}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {evidence.tags.map(tag => (
              <span key={tag} className="clue-tag">{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => pinEvidence(evidence.id)}
              className={`flex-1 py-2 font-mono text-xs transition-all border ${
                isPinned
                  ? 'border-crimson bg-crimson/20 text-crimson-light'
                  : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white'
              }`}
            >
              {isPinned ? '📌 Pinned' : '📌 Pin to Board'}
            </button>
            <button
              onClick={handleInspect}
              className="flex-1 py-2 font-mono text-xs border border-white/20 text-white/50 hover:border-white/40 hover:text-white transition-all"
            >
              ✓ Mark as Inspected
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Evidence() {
  const {
    discoveredEvidence, inspectedEvidence, pinnedEvidence,
    discoverEvidence, setScreen
  } = useGameStore()

  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const available = EVIDENCE_DATA.filter(e =>
    e.isStarter || discoveredEvidence.includes(e.id)
  )

  const filtered = available.filter(e => {
    const matchFilter = filter === 'all' || e.category === filter || (filter === 'pinned' && pinnedEvidence.includes(e.id))
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const categories = [...new Set(EVIDENCE_DATA.map(e => e.category))]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('hub')} className="font-mono text-xs text-white/40 hover:text-white transition-colors">← Hub</button>
            <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Evidence Archive</h1>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-white/40">
            <span>{available.length} items discovered</span>
            <span className="text-white/20">·</span>
            <span>{inspectedEvidence.length} inspected</span>
            <span className="text-white/20">·</span>
            <span>{pinnedEvidence.length} pinned</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 pb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search evidence..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white font-mono text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-crimson/50 placeholder-white/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {['all', 'pinned', ...categories.slice(0, 3)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-mono text-xs px-3 py-1.5 border transition-all ${
                  filter === cat
                    ? 'border-crimson bg-crimson/20 text-crimson-light'
                    : 'border-white/10 text-white/30 hover:text-white hover:border-white/30'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'pinned' ? '📌' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence grid */}
      <div className="px-8 py-6 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-mono text-white/30 text-sm">No evidence matches your search.</p>
            <p className="font-mono text-white/20 text-xs mt-2">Keep investigating to discover more clues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(ev => {
              const isInspected = inspectedEvidence.includes(ev.id)
              const isPinned = pinnedEvidence.includes(ev.id)
              const catColor = CATEGORY_COLORS[ev.category] || '#666'

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(ev)}
                  className="evidence-card cursor-pointer border border-white/10 hover:border-white/25 bg-white/2 p-5"
                  style={{ borderLeft: `3px solid ${catColor}50` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="font-mono text-xs px-2 py-0.5"
                          style={{ color: catColor, background: catColor + '15', border: `1px solid ${catColor}30` }}
                        >
                          {ev.category}
                        </span>
                        {isInspected && <span className="font-mono text-xs text-green-500/60">✓ Inspected</span>}
                        {isPinned && <span className="font-mono text-xs text-yellow-500/60">📌 Pinned</span>}
                        {ev.hasHiddenClue && !isInspected && (
                          <span className="font-mono text-xs text-yellow-400/40">🔍 Examine closely</span>
                        )}
                      </div>
                      <h3 className="font-mono text-sm text-white/85 mb-1">{ev.title}</h3>
                      <p className="font-mono text-xs text-white/40 leading-5 line-clamp-2">{ev.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ev.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="font-mono text-xs text-white/25 bg-white/5 px-2 py-0.5">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-mono text-xs text-white/25">{ev.dateFound}</p>
                      <p className="font-mono text-xs text-white/15 mt-1">{ev.id}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Locked evidence hint */}
        {EVIDENCE_DATA.filter(e => !e.isStarter && !discoveredEvidence.includes(e.id)).length > 0 && (
          <div className="mt-6 border border-white/5 p-4 text-center">
            <p className="font-mono text-xs text-white/20">
              {EVIDENCE_DATA.filter(e => !e.isStarter && !discoveredEvidence.includes(e.id)).length} more pieces of evidence to discover.
            </p>
            <p className="font-mono text-xs text-white/15 mt-1">Interview witnesses and inspect clues to unlock them.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <EvidenceModal evidence={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
