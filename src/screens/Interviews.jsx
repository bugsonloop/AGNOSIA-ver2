import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore, { CHARACTERS, INTERVIEW_SCRIPTS, EVIDENCE_DATA } from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import interrogationBg from '../assets/images/interrogation-room.jpg'

function ContradictionFlash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center">
        <div className="font-mono text-5xl font-bold text-crimson-light mb-3" style={{ textShadow: '0 0 30px rgba(192,57,43,0.8)' }}>
          CONTRADICTION
        </div>
        <p className="font-mono text-sm text-white/60">Statement conflicts with evidence!</p>
      </div>
    </motion.div>
  )
}

function CharacterSelector({ onSelect, unlockedInterviews }) {
  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-6 text-center">Select a subject to interview</p>
      <div className="grid grid-cols-2 gap-3">
        {Object.values(CHARACTERS).filter(c => c.id !== 'yuna').map(char => {
          const isUnlocked = unlockedInterviews.includes(char.id)
          return (
            <button
              key={char.id}
              onClick={() => isUnlocked && onSelect(char.id)}
              disabled={!isUnlocked}
              className={`flex items-center gap-4 p-4 border text-left transition-all ${
                isUnlocked
                  ? 'border-white/15 hover:border-crimson/50 hover:bg-crimson/5 cursor-pointer'
                  : 'border-white/5 opacity-30 cursor-not-allowed'
              }`}
            >
              {/* Portrait placeholder */}
              <div
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-white/10"
                style={{ background: char.portraitBg || '#111' }}
              >
                <span className="text-white/20 text-xs font-mono">{char.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white/80">{char.name}</p>
                <p className="font-mono text-xs text-white/30 mt-0.5">{char.role}</p>
                {!isUnlocked && (
                  <p className="font-mono text-xs text-white/20 mt-1">🔒 Find more evidence to unlock</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Interviews() {
  const {
    unlockedInterviews, interviewProgress, discoveredEvidence,
    recordInterviewAnswer, discoverEvidence, setScreen
  } = useGameStore()

  const [activeChar, setActiveChar] = useState(null)
  const [messages, setMessages] = useState([])
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [showContradiction, setShowContradiction] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEvidenceSelect, setShowEvidenceSelect] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startInterview = (charId) => {
    const script = INTERVIEW_SCRIPTS[charId]
    if (!script) return
    const progress = interviewProgress[charId] || { answered: [], contradictions: [] }
    const answered = progress.answered || []

    setActiveChar(charId)
    setMessages([{ role: 'system', text: script.intro, speaker: CHARACTERS[charId]?.name }])

    const initial = script.questions.filter(q => {
      const deps = script.questions.filter(sq => sq.unlocksQuestion === q.id)
      return deps.length === 0 || deps.some(d => answered.includes(d.id))
    })
    setAvailableQuestions(initial)
  }

  const askQuestion = async (question) => {
    const char = CHARACTERS[activeChar]
    const script = INTERVIEW_SCRIPTS[activeChar]

    // Add user question
    setMessages(prev => [...prev, { role: 'user', text: question.text, speaker: 'Yuna' }])
    setAvailableQuestions(prev => prev.filter(q => q.id !== question.id))
    setIsTyping(true)

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    setIsTyping(false)

    // Check contradiction
    let isContradiction = false
    if (question.contradictedBy && discoveredEvidence.includes(question.contradictedBy)) {
      isContradiction = true
      setShowContradiction(true)
    }

    // Add response
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: question.response,
      speaker: char?.name,
      isContradiction,
      isBreakthrough: question.isBreakthrough,
    }])

    // Record progress
    recordInterviewAnswer(activeChar, question.id, isContradiction)

    // Reveal new evidence
    if (question.revealsEvidence) {
      discoverEvidence(question.revealsEvidence)
    }

    // Unlock next questions
    if (question.unlocksQuestion) {
      const nextQ = script.questions.find(q => q.id === question.unlocksQuestion)
      if (nextQ) {
        setAvailableQuestions(prev => {
          if (prev.find(q => q.id === nextQ.id)) return prev
          return [...prev, nextQ]
        })
      }
    }
  }

  const handleCustomQuestion = async () => {
    if (!customInput.trim()) return
    const char = CHARACTERS[activeChar]

    setMessages(prev => [...prev, { role: 'user', text: customInput, speaker: 'Yuna' }])
    const userQ = customInput
    setCustomInput('')
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 700 + Math.random() * 500))
    setIsTyping(false)

    // Generic scripted fallback responses
    const genericResponses = [
      "I'm not sure what you mean by that.",
      "That's not something I want to discuss right now.",
      "You're going to have to be more specific.",
      "Why does that matter?",
      "I've already told you everything I know.",
    ]
    const response = genericResponses[Math.floor(Math.random() * genericResponses.length)]

    setMessages(prev => [...prev, {
      role: 'assistant',
      text: response,
      speaker: char?.name,
    }])
  }

  const char = activeChar ? CHARACTERS[activeChar] : null

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background */}
      {activeChar && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${interrogationBg})`, filter: 'brightness(0.2)' }}
        />
      )}

      {/* Top bar */}
      <div className="relative z-10 sticky top-0 flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => activeChar ? setActiveChar(null) : setScreen('hub')}
            className="font-mono text-xs text-white/40 hover:text-white transition-colors"
          >
            ← {activeChar ? 'Change Subject' : 'Hub'}
          </button>
          <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Interview Room</h1>
        </div>
        {char && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center border border-white/15 text-xs font-mono text-white/40"
              style={{ background: char.portraitBg || '#111' }}
            >
              {char.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-mono text-xs text-white/70">{char.name}</p>
              <p className="font-mono text-xs text-white/30">{char.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="relative z-10">
        {!activeChar ? (
          <CharacterSelector onSelect={startInterview} unlockedInterviews={unlockedInterviews} />
        ) : (
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div style={{ maxWidth: '65%' }}>
                      {msg.role !== 'user' && (
                        <p className="speaker-name mb-1">{msg.speaker}</p>
                      )}
                      <div
                        className={`${msg.role === 'user' ? 'bubble-right' : 'bubble-left'} ${
                          msg.isContradiction ? 'border border-crimson/60' : ''
                        } ${msg.isBreakthrough ? 'border border-yellow-400/50' : ''}`}
                      >
                        {msg.isContradiction && (
                          <div className="contradiction-badge mb-2 inline-block">CONTRADICTION</div>
                        )}
                        {msg.isBreakthrough && (
                          <div className="font-mono text-xs text-yellow-400 mb-2">⚡ BREAKTHROUGH</div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      {msg.role === 'user' && (
                        <p className="font-mono text-xs text-white/30 text-right mt-1">{msg.speaker}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bubble-left">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-white/10 bg-black/60 backdrop-blur-sm p-6 pb-24">
              {/* Suggested questions */}
              {availableQuestions.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-xs text-white/25 mb-2 uppercase tracking-wider">Ask about:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableQuestions.map(q => (
                      <button
                        key={q.id}
                        onClick={() => askQuestion(q)}
                        className="font-mono text-xs border border-white/20 text-white/50 hover:border-crimson/60 hover:text-white px-3 py-2 transition-all text-left max-w-xs"
                      >
                        {q.text}
                        {q.contradictedBy && discoveredEvidence.includes(q.contradictedBy) && (
                          <span className="ml-2 text-crimson-light">⚡</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCustomQuestion() }}
                  placeholder={`Ask ${char?.name?.split(' ')[0]} a question...`}
                  className="flex-1 bg-white/5 border border-white/15 text-white font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-crimson/50 placeholder-white/20"
                />
                <button
                  onClick={handleCustomQuestion}
                  disabled={!customInput.trim() || isTyping}
                  className="px-5 py-2.5 bg-crimson hover:bg-crimson-light disabled:opacity-30 font-mono text-xs text-white transition-colors"
                >
                  Ask
                </button>
              </div>

              {availableQuestions.length === 0 && messages.length > 1 && (
                <div className="text-center mt-4">
                  <p className="font-mono text-xs text-white/20 mb-4">
                    All available questions asked. Discover more evidence to unlock new questions.
                  </p>
                  <button
                    onClick={() => setScreen('hub')}
                    className="px-6 py-2.5 bg-crimson hover:bg-crimson-light font-mono text-xs text-white transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contradiction flash */}
      <AnimatePresence>
        {showContradiction && (
          <ContradictionFlash onDone={() => setShowContradiction(false)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
