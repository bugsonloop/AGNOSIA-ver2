import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import diaryBg from '../assets/images/diary.jpg'

export default function Notebook() {
  const { notebookEntries, playerNotes, updatePlayerNotes, addPlayerNote, setScreen } = useGameStore()
  const [tab, setTab] = useState('auto')
  const [newNote, setNewNote] = useState('')
  const [search, setSearch] = useState('')
  const textRef = useRef(null)

  const filtered = notebookEntries.filter(e =>
    (tab === 'all' || e.type === tab) &&
    (!search || e.text.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addPlayerNote(newNote.trim())
    setNewNote('')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-sm px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('hub')} className="font-mono text-xs text-white/40 hover:text-white transition-colors">← Hub</button>
            <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Detective Notebook</h1>
          </div>
          <span className="font-mono text-xs text-white/30">{notebookEntries.length} entries</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — diary pages (auto entries) */}
        <div
          className="flex-1 overflow-y-auto p-8 pb-28"
          style={{
            backgroundImage: `url(${diaryBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-black/50 backdrop-blur-sm p-1 rounded mb-4 inline-flex gap-1">
            {[
              { id: 'auto', label: 'Case Notes' },
              { id: 'player', label: 'My Notes' },
              { id: 'all', label: 'All' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-mono text-xs px-3 py-1.5 rounded transition-all ${tab === t.id ? 'bg-crimson text-white' : 'text-white/40 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-black/40 backdrop-blur-sm border border-white/10 text-white font-mono text-xs px-4 py-2 focus:outline-none focus:border-crimson/50 placeholder-white/20"
            />
          </div>

          {/* Entries */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-hand text-xl text-white/20">Nothing written here yet.</p>
                  <p className="font-hand text-lg text-white/10 mt-2">Discover evidence to fill these pages.</p>
                </div>
              ) : (
                filtered.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-4 border-l-2 ${
                      entry.type === 'auto'
                        ? 'border-crimson/40 bg-black/30'
                        : 'border-blue-400/40 bg-black/20'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-xs ${entry.type === 'auto' ? 'text-crimson/60' : 'text-blue-400/60'}`}>
                        {entry.type === 'auto' ? '📋 Case note' : '✏️ My note'}
                      </span>
                      <span className="font-mono text-xs text-white/25">{entry.timestamp}</span>
                    </div>
                    {entry.subject && (
                      <p className="font-mono text-xs text-white/40 mb-1">{entry.subject}</p>
                    )}
                    <p className="font-hand text-base text-white/80 leading-7">{entry.text}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right — free notes panel */}
        <div className="w-80 border-l border-white/10 bg-black/80 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/10">
            <p className="font-mono text-xs text-white/40 uppercase tracking-wider">Free Notes</p>
            <p className="font-mono text-xs text-white/20 mt-1">Saved automatically</p>
          </div>

          <textarea
            ref={textRef}
            value={playerNotes}
            onChange={e => updatePlayerNotes(e.target.value)}
            placeholder="Write your own theories here..."
            className="flex-1 bg-transparent text-white font-hand text-base p-4 resize-none focus:outline-none placeholder-white/15 notebook-lines leading-8"
            style={{ minHeight: 300 }}
          />

          <div className="p-4 border-t border-white/10">
            <p className="font-mono text-xs text-white/30 mb-2">Quick note</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                placeholder="Add to log..."
                className="flex-1 bg-white/5 border border-white/10 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-crimson/50 placeholder-white/15"
              />
              <button
                onClick={handleAddNote}
                className="bg-crimson px-3 py-2 font-mono text-xs text-white hover:bg-crimson-light transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
