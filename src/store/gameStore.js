import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── All game state ────────────────────────────────────────────────────────────
const useGameStore = create(
  persist(
    (set, get) => ({
      // Phase tracking
      phase: 'landing', // landing | intro | game | ending
      currentScreen: 'hub',
      gameStarted: false,

      // Evidence
      discoveredEvidence: [],
      inspectedEvidence: [],
      pinnedEvidence: [],

      // Characters & interviews
      unlockedInterviews: ['lily', 'damien'], // start with two available
      interviewProgress: {}, // charId -> { answered: [questionIds], contradictions: [ids] }

      // Notebook
      notebookEntries: [], // { id, text, timestamp, type:'auto'|'player', evidenceId? }
      playerNotes: '', // free text notes

      // Timeline
      placedEvents: [], // event ids the player has placed
      timelineComplete: false,

      // Deduction board
      deductionNodes: [], // { id, type, label, x, y, color }
      deductionConnections: [], // { from, to, label }

      // Suspects
      suspectRankings: {}, // id -> score 0-100
      accusation: null, // { killerId, motive, method, evidenceIds, timelineIds }
      accusationResult: null, // 'correct' | 'wrong'

      // Contradictions found
      foundContradictions: [],

      // Visited scenes (for progress)
      visitedScreens: [],

      // Actions ─────────────────────────────────────────────────────────────────
      startGame: () => set({ phase: 'intro', gameStarted: true }),
      startInvestigation: () => set({ phase: 'game', currentScreen: 'hub' }),

      goToLanding: () => set({
        phase: 'landing',
        currentScreen: 'hub',
        gameStarted: false,
      }),

      goToScreen: (screen) => set(s => ({
        phase: 'game',
        gameStarted: true,
        currentScreen: screen,
        visitedScreens: s.visitedScreens.includes(screen) ? s.visitedScreens : [...s.visitedScreens, screen]
      })),

      setScreen: (screen) => set(s => ({
        currentScreen: screen,
        visitedScreens: s.visitedScreens.includes(screen) ? s.visitedScreens : [...s.visitedScreens, screen]
      })),

      discoverEvidence: (id) => {
        const { discoveredEvidence, notebookEntries } = get()
        if (discoveredEvidence.includes(id)) return
        const ev = EVIDENCE_DATA.find(e => e.id === id)
        set({
          discoveredEvidence: [...discoveredEvidence, id],
          notebookEntries: [...notebookEntries, {
            id: `auto-${Date.now()}`,
            text: ev ? `Found: ${ev.title}. ${ev.yunaNote}` : `New evidence discovered.`,
            timestamp: new Date().toLocaleDateString('en-GB'),
            type: 'auto',
            evidenceId: id,
          }]
        })
        // Auto-unlock interviews based on evidence
        get()._checkUnlocks(id)
      },

      inspectEvidence: (id) => {
        const { inspectedEvidence } = get()
        if (!inspectedEvidence.includes(id)) {
          set({ inspectedEvidence: [...inspectedEvidence, id] })
        }
      },

      pinEvidence: (id) => {
        const { pinnedEvidence } = get()
        set({
          pinnedEvidence: pinnedEvidence.includes(id)
            ? pinnedEvidence.filter(e => e !== id)
            : [...pinnedEvidence, id]
        })
      },

      addPlayerNote: (text) => {
        const { notebookEntries } = get()
        set({
          notebookEntries: [...notebookEntries, {
            id: `note-${Date.now()}`,
            text,
            timestamp: new Date().toLocaleDateString('en-GB'),
            type: 'player',
          }]
        })
      },

      updatePlayerNotes: (text) => set({ playerNotes: text }),

      recordInterviewAnswer: (charId, questionId, foundContradiction) => {
        const { interviewProgress, foundContradictions, notebookEntries } = get()
        const prev = interviewProgress[charId] || { answered: [], contradictions: [] }
        const newProgress = {
          ...interviewProgress,
          [charId]: {
            answered: [...new Set([...prev.answered, questionId])],
            contradictions: foundContradiction
              ? [...new Set([...prev.contradictions, questionId])]
              : prev.contradictions,
          }
        }
        let newContradictions = foundContradictions
        let newNotes = notebookEntries
        if (foundContradiction && !foundContradictions.includes(`${charId}-${questionId}`)) {
          newContradictions = [...foundContradictions, `${charId}-${questionId}`]
          newNotes = [...notebookEntries, {
            id: `contra-${Date.now()}`,
            text: `CONTRADICTION FOUND: ${charId}'s statement conflicts with evidence.`,
            timestamp: new Date().toLocaleDateString('en-GB'),
            type: 'auto',
          }]
        }
        set({ interviewProgress: newProgress, foundContradictions: newContradictions, notebookEntries: newNotes })
      },

      placeTimelineEvent: (eventId) => {
        const { placedEvents } = get()
        if (!placedEvents.includes(eventId)) {
          const newPlaced = [...placedEvents, eventId]
          set({
            placedEvents: newPlaced,
            timelineComplete: newPlaced.length >= 8,
          })
        }
      },

      addDeductionNode: (node) => {
        set(s => ({ deductionNodes: [...s.deductionNodes, node] }))
      },

      updateDeductionNode: (id, updates) => {
        set(s => ({ deductionNodes: s.deductionNodes.map(n => n.id === id ? { ...n, ...updates } : n) }))
      },

      removeDeductionNode: (id) => {
        set(s => ({
          deductionNodes: s.deductionNodes.filter(n => n.id !== id),
          deductionConnections: s.deductionConnections.filter(c => c.from !== id && c.to !== id),
        }))
      },

      addDeductionConnection: (from, to, label = '') => {
        set(s => {
          const exists = s.deductionConnections.find(c =>
            (c.from === from && c.to === to) || (c.from === to && c.to === from)
          )
          if (exists) return s
          return { deductionConnections: [...s.deductionConnections, { from, to, label, id: `conn-${Date.now()}` }] }
        })
      },

      removeDeductionConnection: (id) => {
        set(s => ({ deductionConnections: s.deductionConnections.filter(c => c.id !== id) }))
      },

      rankSuspect: (id, score) => {
        set(s => ({ suspectRankings: { ...s.suspectRankings, [id]: score } }))
      },

      submitAccusation: (accusation) => {
        const isCorrect = accusation.killerId === 'richard_hart'
        set({
          accusation,
          accusationResult: isCorrect ? 'correct' : 'wrong',
          phase: 'ending',
        })
      },

      unlockInterview: (charId) => {
        set(s => ({
          unlockedInterviews: s.unlockedInterviews.includes(charId)
            ? s.unlockedInterviews
            : [...s.unlockedInterviews, charId]
        }))
      },

      _checkUnlocks: (evidenceId) => {
        const { unlockedInterviews, discoveredEvidence } = get()
        const newUnlocked = [...unlockedInterviews]
        // Unlock Ethan's journal -> unlock more characters
        if (['ev003', 'ev004'].includes(evidenceId) && !newUnlocked.includes('elena')) newUnlocked.push('elena')
        if (['ev005', 'ev006'].includes(evidenceId) && !newUnlocked.includes('richard')) newUnlocked.push('richard')
        if (evidenceId === 'ev007' && !newUnlocked.includes('sophia_memory')) newUnlocked.push('sophia_memory')
        set({ unlockedInterviews: newUnlocked })
      },

      resetGame: () => set({
        phase: 'landing', currentScreen: 'hub', gameStarted: false,
        discoveredEvidence: [], inspectedEvidence: [], pinnedEvidence: [],
        unlockedInterviews: ['lily', 'damien'], interviewProgress: {},
        notebookEntries: [], playerNotes: '', placedEvents: [], timelineComplete: false,
        deductionNodes: [], deductionConnections: [], suspectRankings: {},
        accusation: null, accusationResult: null, foundContradictions: [], visitedScreens: [],
      }),
    }),
    {
      name: 'agnosia-v2',
      version: 3,
      migrate: (persistedState) => ({
        ...persistedState,
        phase: 'landing',
        currentScreen: 'hub',
        gameStarted: false,
      }),
      partialize: (s) => ({
        discoveredEvidence: s.discoveredEvidence, inspectedEvidence: s.inspectedEvidence,
        pinnedEvidence: s.pinnedEvidence, unlockedInterviews: s.unlockedInterviews,
        interviewProgress: s.interviewProgress, notebookEntries: s.notebookEntries,
        playerNotes: s.playerNotes, placedEvents: s.placedEvents,
        deductionNodes: s.deductionNodes, deductionConnections: s.deductionConnections,
        suspectRankings: s.suspectRankings, accusation: s.accusation,
        accusationResult: s.accusationResult, foundContradictions: s.foundContradictions,
        visitedScreens: s.visitedScreens,
      }),
    }
  )
)

export default useGameStore

// ─── Evidence data ─────────────────────────────────────────────────────────────
export const EVIDENCE_DATA = [
  {
    id: 'ev001', title: 'Police Incident Report', category: 'Official Document',
    tags: ['official', 'death', 'police', 'suicide'],
    description: 'Official campus police report. Ruling: suicide by hanging. Time of death redacted. No signs of struggle. Case closed before forensics arrived.',
    yunaNote: "They closed the case in 4 hours. Four hours. He had plans to meet me tomorrow.",
    dateFound: 'March 14', chapter: 1, isStarter: true,
    hasHiddenClue: true,
    hiddenClue: 'The time of death field has been manually redacted — this is unusual for a public document. Someone wanted that window invisible.',
    photoPlaceholder: 'police-report',
    metadata: null,
  },
  {
    id: 'ev002', title: "Ethan's Camera — Lens Cap On", category: 'Physical Evidence',
    tags: ['camera', 'lens cap', 'staged', 'key clue'],
    description: "Ethan's Canon camera was found around his neck with the lens cap firmly attached. Lily confirms he called lens caps 'fear of seeing' and never used them. Not once in 3 years.",
    yunaNote: "He never put the lens cap on. Whoever staged the scene didn't know that.",
    dateFound: 'March 14', chapter: 1, isStarter: true,
    hasHiddenClue: true,
    hiddenClue: 'This is the killer\'s fingerprint. They dressed the scene but betrayed their ignorance of Ethan\'s habits.',
    photoPlaceholder: 'camera',
    metadata: null,
  },
  {
    id: 'ev003', title: "Sophia's Diary — March 14 Entry", category: 'Personal Document',
    tags: ['diary', 'sophia', 'secret', 'family'],
    description: "Sophia Vale's diary, found among Ethan's belongings after her death. The March entry speaks of a man who 'forgot and pretends' — someone who abandoned them. She writes of guilt for protecting a secret.",
    yunaNote: "She kept something from him his whole life. What did she do?",
    dateFound: 'March 15', chapter: 1, isStarter: false,
    hasHiddenClue: false,
    hiddenClue: null,
    photoPlaceholder: 'diary-page',
    metadata: null,
  },
  {
    id: 'ev004', title: "Sophia's Diary — August 2 Entry", category: 'Personal Document',
    tags: ['diary', 'sophia', 'richard', 'father', 'secret'],
    description: "August entry: 'I saw him today. He didn't see me. He held Ethan's hand and walked away. Some ghosts are better left sleeping.' She refers to a man in town who 'thinks forgetting is enough.'",
    yunaNote: "She saw someone. Someone who knew Ethan and pretended not to. Who holds a child's hand and walks away?",
    dateFound: 'March 15', chapter: 2, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "The phrase 'held Ethan's hand' — Ethan was young here. This man knew him as a child. This was before the university.",
    photoPlaceholder: 'diary-page-2',
    metadata: null,
  },
  {
    id: 'ev005', title: "Sophia's Final Entry — October 3", category: 'Personal Document',
    tags: ['diary', 'sophia', 'confession', 'father', 'richard'],
    description: "Sophia's last entry before her death: 'There is a man in this city who thinks forgetting is enough.' She names no one but writes she was 'not strong enough to tell the truth before laying on my deathbed.'",
    yunaNote: "She died keeping someone's secret. That secret killed her son too.",
    dateFound: 'March 16', chapter: 2, isStarter: false,
    hasHiddenClue: false,
    hiddenClue: null,
    photoPlaceholder: 'diary-final',
    metadata: null,
  },
  {
    id: 'ev006', title: "Ethan's Research Notes", category: 'Handwritten Notes',
    tags: ['ethan', 'investigation', 'father', 'businessman'],
    description: "Pages torn from Ethan's notebook. He was tracking a 'businessman who pretends.' Notes include: 'R.H. — same face as the photo. Confirmed address. He has another family.' Written 3 weeks before his death.",
    yunaNote: "R.H. He found him. He was so close to the truth.",
    dateFound: 'March 16', chapter: 2, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "'R.H.' — initials. In Lily's testimony she mentions Ethan asking if anyone in town was good at pretending. Businessmen who steal from people. He was testing the theory.",
    photoPlaceholder: 'research-notes',
    metadata: null,
  },
  {
    id: 'ev007', title: "Meeting Request — Ethan's Phone", category: 'Digital Evidence',
    tags: ['phone', 'message', 'meeting', 'day of death'],
    description: "SMS recovered from Ethan's phone. Sent night before death: 'I need to meet you. I know who you are. I know what you did to my mother. Tomorrow. The observatory. — E.V.'",
    yunaNote: "He confronted someone. That's why he's dead. He sent this the night before.",
    dateFound: 'March 17', chapter: 2, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "The observatory. The police report says he was found at 'an abandoned lakeside observatory.' This was not random. He chose that location for this meeting.",
    photoPlaceholder: 'phone-screen',
    metadata: { timestamp: 'March 13, 11:47 PM', recipient: 'Unknown number (burner phone)', delivered: true },
  },
  {
    id: 'ev008', title: "Richard Hart — Business Records", category: 'Financial Document',
    tags: ['richard', 'businessman', 'financial', 'secret'],
    description: "Richard Hart, 45, owner of Hart Enterprises. His office address matches a building Ethan photographed repeatedly. Bank records show irregular cash withdrawals beginning 19 years ago — around Ethan's birth year.",
    yunaNote: "Yuna's father. Nineteen years ago. He's been hiding something since before Ethan was born.",
    dateFound: 'March 18', chapter: 3, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "The withdrawals match the amount Sophia needed for Ethan's care. Richard Hart was paying her. Buying her silence.",
    photoPlaceholder: 'business-records',
    metadata: null,
  },
  {
    id: 'ev009', title: "Observatory Visitor Log", category: 'Official Document',
    tags: ['observatory', 'location', 'evidence', 'richard'],
    description: "The abandoned observatory's visitor log, recovered by Yuna. Last two entries: 'E. Vale, March 14 — 9:00 AM' and 'R. Hart, March 14 — 9:15 AM.' Richard Hart was there. He arrived 15 minutes after Ethan.",
    yunaNote: "He was there. He signed the log. Either he's stupid or he never expected anyone to check.",
    dateFound: 'March 19', chapter: 3, isStarter: false,
    hasHiddenClue: false,
    hiddenClue: null,
    photoPlaceholder: 'visitor-log',
    metadata: null,
  },
  {
    id: 'ev010', title: "Ethan's Photograph — The Businessman", category: 'Photography',
    tags: ['photograph', 'richard', 'ethan', 'proof'],
    description: "A photograph taken by Ethan, found in a hidden folder on his camera's memory card. Shows Richard Hart entering the observatory. Timestamp: March 14, 9:14 AM. One minute before the visitor log entry.",
    yunaNote: "He photographed everything. Even at the end, he was documenting the truth.",
    dateFound: 'March 20', chapter: 3, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "In the bottom reflection of the glass door — Ethan's reflection. He took this from hiding. He was afraid. The photo angle shows he hadn't yet been seen.",
    photoPlaceholder: 'observatory-photo',
    metadata: { timestamp: 'March 14, 09:14:23 AM', camera: 'Canon EOS R5', location: 'Lake Observatory, North Gate', modified: 'NEVER — original file' },
  },
  {
    id: 'ev011', title: "Damien's Testimony — Memory Gap", category: 'Witness Statement',
    tags: ['damien', 'testimony', 'alibi', 'suspicious'],
    description: "Damien states he was home all morning on March 14. However, his phone location data (obtained by Yuna) shows his device pinging a tower near the observatory at 9:30 AM. He arrived shortly after Richard.",
    yunaNote: "He lied about where he was. But why would Damien be at the observatory?",
    dateFound: 'March 21', chapter: 3, isStarter: false,
    hasHiddenClue: true,
    hiddenClue: "Damien arrived after Richard. Not before. He may have seen something — or someone leaving. This could make him a witness, not a suspect.",
    photoPlaceholder: 'phone-location',
    metadata: { location: '3.2km from observatory', time: '9:31 AM', source: 'Cell tower log' },
  },
  {
    id: 'ev012', title: "Lily's Statement — The Last Conversation", category: 'Witness Statement',
    tags: ['lily', 'testimony', 'ethan', 'last words'],
    description: "Lily's full account: Ethan told her he had 'found the man who made his mother cry for 19 years.' He said he was going to confront him the next day. He seemed scared but determined. He said 'if anything happens to me, Yuna needs to know.'",
    yunaNote: "He knew it was dangerous. He did it anyway. For his mother. For the truth.",
    dateFound: 'March 22', chapter: 3, isStarter: false,
    hasHiddenClue: false,
    hiddenClue: null,
    photoPlaceholder: 'lily-statement',
    metadata: null,
  },
]

// ─── Character data ───────────────────────────────────────────────────────────
export const CHARACTERS = {
  yuna: {
    id: 'yuna', name: 'Yuna Hart', age: 18, role: 'Protagonist',
    occupation: 'Music Major (University Student)',
    status: 'Student / Case Investigator',
    personality: 'Quiet, observant, emotionally reserved',
    family: 'Only child (as far as she knows)',
    notable: 'Frequently experiences memory gaps and lost time',
    color: '#8B1A1A',
    portraitBg: '#2a1a1a',
  },
  ethan: {
    id: 'ethan', name: 'Ethan Vale', age: 19, role: 'Victim',
    occupation: 'Photography Student',
    status: 'Deceased',
    personality: 'Curious, empathetic, persistent',
    family: 'Mother (Sophia Vale, deceased), Brother (Damien), Unknown father',
    notable: 'Was investigating his biological family history',
    color: '#555',
    portraitBg: '#1a1a2a',
  },
  lily: {
    id: 'lily', name: 'Lily Brooke', age: 19, role: 'Witness',
    occupation: 'Journalism Student',
    status: 'Witness / Person of Interest',
    personality: 'Intelligent, analytical, emotionally expressive',
    family: 'Unknown',
    notable: 'Ethan\'s closest friend. Last person he confided in.',
    color: '#4a7a4a',
    portraitBg: '#1a2a1a',
  },
  damien: {
    id: 'damien', name: 'Damien Vale', age: 24, role: 'Person of Interest',
    occupation: 'Sports Athlete',
    status: 'Person of Interest',
    personality: 'Aggressive, protective, short-tempered',
    family: 'Brother (Ethan Vale, deceased), Mother (Sophia Vale, deceased)',
    notable: 'Frequently involved in fights. Present near the observatory on March 14.',
    color: '#5a4a2a',
    portraitBg: '#2a1a0a',
  },
  richard: {
    id: 'richard', name: 'Richard Hart', age: 45, role: 'Prime Suspect',
    occupation: 'Business',
    status: 'Person of Interest → Prime Suspect',
    personality: 'Controlled, secretive, authoritative',
    family: 'Father of Yuna Hart. Past relationship with Sophia Vale.',
    notable: 'Present at the observatory March 14. Made secret payments to Sophia Vale for years.',
    color: '#8B1A1A',
    portraitBg: '#2a0a0a',
  },
  elena: {
    id: 'elena', name: 'Elena Hart', age: 43, role: 'Witness',
    occupation: 'Homemaker / Former Administrative Worker',
    status: 'Witness / Person of Interest',
    personality: 'Calm, emotionally distant, observant',
    family: 'Mother of Yuna Hart. Wife of Richard Hart.',
    notable: 'Privy to long-hidden family matters. Avoids confrontation.',
    color: '#4a4a6a',
    portraitBg: '#1a1a2a',
  },
}

// ─── Interview questions (scripted, offline) ──────────────────────────────────
export const INTERVIEW_SCRIPTS = {
  lily: {
    intro: "Hi, Yuna. I can't believe he's gone either. Ask me anything.",
    questions: [
      {
        id: 'lily_q1', text: 'How was Ethan acting before he died?',
        response: "He was acting weird. Like, excited but scared at the same time. He kept talking about a man — someone in town who was 'pretending.' I didn't understand what he meant at first.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: 'lily_q2',
      },
      {
        id: 'lily_q2', text: 'What did he say about this man?',
        response: "He asked me — totally out of nowhere — if I thought businessmen in town were good at pretending. I said yeah, they all steal from people. He just went quiet and said 'businessmen...' like I'd confirmed something. Then he left.",
        revealsEvidence: 'ev006', isContradiction: false,
        unlocksQuestion: 'lily_q3',
      },
      {
        id: 'lily_q3', text: 'Did he say anything about his mother?',
        response: "Yes. He said he found 'the man who made his mother cry for 19 years.' He was going to confront him the next morning. I begged him not to go alone. He said he had to. He said... if anything happened to him, Yuna needed to know.",
        revealsEvidence: 'ev012', isContradiction: false,
        unlocksQuestion: 'lily_q4',
      },
      {
        id: 'lily_q4', text: 'Why did he mention me specifically?',
        response: "He was very specific about you, Yuna. He said 'Yuna has a right to know who her father really is.' I didn't understand then. I think I'm starting to now.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: null,
      },
    ],
  },
  damien: {
    intro: "Why am I here? I already told the police everything.",
    questions: [
      {
        id: 'damien_q1', text: "Ethan didn't kill himself. I'm sure of it.",
        response: "I don't want to hear about this. (pause) ...I know he didn't. But what are you going to do? The case is closed.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: 'damien_q2',
      },
      {
        id: 'damien_q2', text: 'Where were you on the morning of March 14?',
        response: "I was home. All morning. I didn't go anywhere until I got the call about Ethan.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: 'damien_q3',
        statementToCheck: 'Home all morning on March 14.',
        contradictedBy: 'ev011',
      },
      {
        id: 'damien_q3', text: 'Your phone was near the observatory at 9:30 AM.',
        response: "(Long silence) You checked my location. You actually— (sighs) Okay. Yes. I followed Ethan. He got up early, he was jumpy, he wouldn't tell me where he was going. So I followed. I got there after it was already... after he was already gone. I saw a car leaving. Black Mercedes. I panicked and left.",
        revealsEvidence: 'ev011', isContradiction: true,
        unlocksQuestion: 'damien_q4',
      },
      {
        id: 'damien_q4', text: 'Did you see who was driving the Mercedes?',
        response: "I couldn't see the face clearly. But I saw the plates. Partial: R-H something. I didn't know what it meant. I didn't think — I should have stayed. I should have called someone. (voice breaks) I'm sorry, Ethan.",
        revealsEvidence: 'ev009', isContradiction: false,
        unlocksQuestion: null,
      },
    ],
  },
  elena: {
    intro: "Yuna, sweetheart. I know you're upset. Please sit down.",
    questions: [
      {
        id: 'elena_q1', text: 'Mom, did you know Ethan Vale?',
        response: "I... heard about the poor boy at the university. Terrible thing. Why are you asking me this?",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: 'elena_q2',
        statementToCheck: 'Only knew Ethan as a name in the news.',
        contradictedBy: 'ev008',
      },
      {
        id: 'elena_q2', text: "Dad has been making payments to Sophia Vale for years. I found the records.",
        response: "(Goes very still) Where did you see those records? That's your father's private business.",
        revealsEvidence: null, isContradiction: true,
        unlocksQuestion: 'elena_q3',
      },
      {
        id: 'elena_q3', text: 'Is Ethan related to us?',
        response: "(Closes her eyes) Your father had a relationship before me. A woman named Sophia. He ended it when they had a child. He gave her money to disappear. I found out years later. I chose to stay. I chose to protect this family. I chose you. I'm sorry, Yuna. I'm so sorry.",
        revealsEvidence: 'ev008', isContradiction: false,
        unlocksQuestion: 'elena_q4',
      },
      {
        id: 'elena_q4', text: 'Does Dad know that Ethan went looking for him?',
        response: "(Whispers) He mentioned it. He was... very upset. He said Ethan had 'gone too far.' I didn't ask what he meant. God help me, I didn't ask.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: null,
      },
    ],
  },
  richard: {
    intro: "Yuna. Sit down. Whatever you think you know—",
    questions: [
      {
        id: 'richard_q1', text: 'Were you at the observatory on March 14?',
        response: "I don't know what you're talking about. I was at the office that morning.",
        revealsEvidence: null, isContradiction: false,
        unlocksQuestion: 'richard_q2',
        statementToCheck: 'Was at the office on the morning of March 14.',
        contradictedBy: 'ev009',
      },
      {
        id: 'richard_q2', text: 'Your name is in the visitor log.',
        response: "(Pause) That's— that's not possible. Someone must have— (stops himself)",
        revealsEvidence: 'ev009', isContradiction: true,
        unlocksQuestion: 'richard_q3',
      },
      {
        id: 'richard_q3', text: 'Ethan sent you a message the night before. He knew who you were.',
        response: "(Voice drops) Yes. He found me. I went to talk to him. To explain. To offer him — I don't know. Money. A quiet settlement. I am not a violent man, Yuna.",
        revealsEvidence: 'ev007', isContradiction: false,
        unlocksQuestion: 'richard_q4',
      },
      {
        id: 'richard_q4', text: 'What happened at the observatory?',
        response: "(Long silence) He wouldn't take the money. He said he was going to tell you everything. He said you had a right to know you had a brother. I — I pushed him. He fell. He hit his head on the railing. I panicked. I made it look like — I didn't mean to. I didn't mean for any of this.",
        revealsEvidence: 'ev010', isContradiction: false,
        unlocksQuestion: null,
        isBreakthrough: true,
      },
    ],
  },
}

// ─── Timeline events ──────────────────────────────────────────────────────────
export const TIMELINE_EVENTS = [
  { id: 'tl001', date: '19 years ago', title: 'Richard abandons Sophia', description: "Richard Hart ends his relationship with Sophia Vale after she becomes pregnant. He begins secret cash payments to buy her silence.", requiresEvidence: 'ev008', type: 'past' },
  { id: 'tl002', date: 'One month ago', title: "Sophia Vale's death", description: "Sophia Vale dies — officially from health complications worsened by stress. Ethan discovers her diary.", requiresEvidence: 'ev003', type: 'past' },
  { id: 'tl003', date: '3 weeks ago', title: 'Ethan begins research', description: "Ethan starts tracking 'R.H.' — piecing together his mother's secret from the diary entries.", requiresEvidence: 'ev006', type: 'investigation' },
  { id: 'tl004', date: '2 weeks ago', title: 'Ethan confirms identity', description: "Ethan identifies Richard Hart as his biological father. He begins photographing Hart's office and movements.", requiresEvidence: 'ev010', type: 'investigation' },
  { id: 'tl005', date: 'Last week', title: 'Lily conversation', description: "Ethan tells Lily he's found 'the man.' He asks her cryptic questions about businessmen. He seems frightened but resolved.", requiresEvidence: 'ev012', type: 'event' },
  { id: 'tl006', date: 'March 13, night', title: 'Ethan sends the message', description: "Ethan sends a message to Richard Hart's burner phone: 'I know who you are. Tomorrow. The observatory.'", requiresEvidence: 'ev007', type: 'critical' },
  { id: 'tl007', date: 'March 14, 9:00 AM', title: 'Ethan arrives at the observatory', description: "Ethan arrives first. He is photographing the entrance when Richard Hart arrives 15 minutes later.", requiresEvidence: 'ev010', type: 'critical' },
  { id: 'tl008', date: 'March 14, ~9:20 AM', title: 'The confrontation', description: "Richard Hart pushes Ethan during the confrontation. Ethan falls, hits the railing. Richard stages it as a suicide.", requiresEvidence: 'ev009', type: 'critical' },
  { id: 'tl009', date: 'March 14, 9:30 AM', title: 'Damien arrives — too late', description: "Damien, who followed Ethan, arrives to find his brother dead. He sees a black Mercedes leaving. He panics and leaves without calling police.", requiresEvidence: 'ev011', type: 'event' },
  { id: 'tl010', date: 'March 14, afternoon', title: 'Case closed', description: "Police arrive, rule it suicide within 4 hours. Time of death is redacted from the public report.", requiresEvidence: 'ev001', type: 'official' },
]

// ─── Suspects ─────────────────────────────────────────────────────────────────
export const SUSPECTS = [
  { id: 'richard_hart', name: 'Richard Hart', motive: 'Silence Ethan before he exposed the secret family', means: 'Physical confrontation — pushed victim at isolated location', opportunity: 'Confirmed present at observatory at time of death', evidence: ['ev008', 'ev009', 'ev010', 'ev007'] },
  { id: 'damien_vale', name: 'Damien Vale', motive: 'Anger over Ethan blaming him for their mother\'s death', means: 'Physical capability — known violent history', opportunity: 'Near observatory at 9:30 AM — arrived after crime', evidence: ['ev011'] },
  { id: 'unknown', name: 'Unknown Third Party', motive: 'Unknown', means: 'Unknown', opportunity: 'Unknown', evidence: [] },
]
