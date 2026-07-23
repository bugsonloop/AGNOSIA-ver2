
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore, { TIMELINE_EVENTS, EVIDENCE_DATA } from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import filmStripImg from '../assets/images/film-strip.jpg'

const TYPE_COLORS = {
  past: '#6b7280',
  investigation: '#8b5cf6',
  event: '#3b82f6',
  critical: '#ef4444',
  official: '#6b7280',
}

const TYPE_LABELS = {
  past: 'Historical',
  investigation: 'Investigation',
  event: 'Key Event',
  critical: 'Critical',
  official: 'Official Record',
}

export default function Timeline() {
  const { discoveredEvidence, placedEvents, placeTimelineEvent, setScreen } = useGameStore()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [dragging, setDragging] = useState(null)

  const available = TIMELINE_EVENTS.filter(e =>
    !e.requiresEvidence || discoveredEvidence.includes(e.requiresEvidence)
  )

  const placed = TIMELINE_EVENTS.filter(e => placedEvents.includes(e.id)).sort((a, b) => {
    const order = ['19 years ago', 'One month ago', '3 weeks ago', '2 weeks ago', 'Last week', 'March 13, night', 'March 14, 9:00 AM', 'March 14, ~9:20 AM', 'March 14, 9:30 AM', 'March 14, afternoon']
    return order.indexOf(a.date) - order.indexOf(b.date)
  })

  const unplaced = available.filter(e => !placedEvents.includes(e.id))

  const handleDrop = (eventId) => {
    if (eventId) {
      placeTimelineEvent(eventId)
    }
    setDragOver(null)
    setDragging(null)
  }

  const completion = Math.round((placedEvents.length / TIMELINE_EVENTS.length) * 100)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('hub')} className="font-mono text-xs text-white/40 hover:text-white transition-colors">← Hub</button>
            <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Timeline Reconstruction</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-crimson transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <span className="font-mono text-xs text-white/40">{completion}% complete</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 pb-28">
        {/* Film strip header */}
        <div className="relative mb-8 overflow-hidden h-16 opacity-20 pointer-events-none">
          <img src={filmStripImg} alt="" className="absolute -top-4 left-0 w-full" style={{ filter: 'invert(1)' }} />
        </div>

        {/* Instructions */}
        {unplaced.length > 0 && (
          <div className="mb-6 border border-white/10 p-4 bg-white/2">
            <p className="font-mono text-xs text-white/40 mb-1">How to use</p>
            <p className="font-mono text-sm text-white/60">
              Click events below to place them on the timeline. Events only appear when you've found the relevant evidence.
              Reconstruct Ethan's final days in chronological order.
            </p>
          </div>
        )}

        {/* The Timeline */}
        <div className="mb-10">
          <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-4">Timeline</p>

          {placed.length === 0 ? (
            <div className="border border-dashed border-white/10 p-8 text-center">
              <p className="font-mono text-xs text-white/20">No events placed yet. Click events below to add them.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-crimson/20" />

              <div className="space-y-4 pl-12">
                {placed.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative cursor-pointer"
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    {/* Dot */}
                    <div
                      className="absolute -left-10 top-3 w-3 h-3 rounded-full border-2"
                      style={{ borderColor: TYPE_COLORS[event.type], background: '#000' }}
                    />

                    <div
                      className="border border-white/10 p-4 hover:border-white/25 transition-all"
                      style={{ borderLeft: `3px solid ${TYPE_COLORS[event.type]}40` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-mono text-xs px-2 py-0.5"
                              style={{ color: TYPE_COLORS[event.type], background: TYPE_COLORS[event.type] + '15', border: `1px solid ${TYPE_COLORS[event.type]}30` }}
                            >
                              {TYPE_LABELS[event.type]}
                            </span>
                          </div>
                          <h3 className="font-mono text-sm text-white/80">{event.title}</h3>
                          <p className="font-mono text-xs text-white/40 mt-0.5">{event.date}</p>
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedEvent?.id === event.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="font-mono text-xs text-white/55 mt-3 leading-6 border-t border-white/10 pt-3">
                              {event.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unplaced events */}
        {unplaced.length > 0 && (
          <div>
            <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-4">Events to place ({unplaced.length})</p>
            <div className="grid grid-cols-1 gap-2">
              {unplaced.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => placeTimelineEvent(event.id)}
                  className="border border-white/10 border-dashed p-4 cursor-pointer hover:border-crimson/40 hover:bg-crimson/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: TYPE_COLORS[event.type] }}
                    />
                    <div className="flex-1">
                      <p className="font-mono text-sm text-white/60">{event.title}</p>
                      <p className="font-mono text-xs text-white/30 mt-0.5">{event.date}</p>
                    </div>
                    <span className="font-mono text-xs text-white/20">Click to place →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked events */}
        {TIMELINE_EVENTS.filter(e => e.requiresEvidence && !discoveredEvidence.includes(e.requiresEvidence) && !placedEvents.includes(e.id)).length > 0 && (
          <div className="mt-6">
            <p className="font-mono text-xs text-white/15 uppercase tracking-widest mb-3">
              {TIMELINE_EVENTS.filter(e => e.requiresEvidence && !discoveredEvidence.includes(e.requiresEvidence)).length} events locked
              — find more evidence to reveal them
            </p>
          </div>
        )}

        {/* Complete message */}
        {placedEvents.length === TIMELINE_EVENTS.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border border-green-500/30 bg-green-500/5 p-6 text-center"
          >
            <p className="font-mono text-sm text-green-400">Timeline reconstruction complete.</p>
            <p className="font-mono text-xs text-green-400/60 mt-2">You now have a full picture of what happened to Ethan.</p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
