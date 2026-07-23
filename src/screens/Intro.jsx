import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'
import paperBg from '../assets/images/paper-bg.jpg'
import cemeteryBg from '../assets/images/cemetery-bg.jpg'
import interrogationBg from '../assets/images/interrogation-room.jpg'
import campusBg from '../assets/images/campus-bg.jpg'
import ethansRoom from '../assets/images/ethans-room.jpg'
import filmStrip from '../assets/images/film-strip.jpg'
import { CHARACTERS } from '../store/gameStore.js'

const INTRO_SLIDES = [
  // Slide 1 — Ethan's letter
  {
    id: 'letter',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'letter',
  },
  // Slide 2 — Yuna profile
  {
    id: 'yuna_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'yuna',
  },
  // Slide 3 — Ethan profile
  {
    id: 'ethan_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'ethan',
  },
  // Slide 4 — Lily profile
  {
    id: 'lily_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'lily',
  },
  // Slide 5 — Damien profile
  {
    id: 'damien_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'damien',
  },
  // Slide 6 — Richard profile
  {
    id: 'richard_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'richard',
  },
  // Slide 7 — Elena profile
  {
    id: 'elena_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'elena',
  },
  // Slide 8 — Sophia profile
  {
    id: 'sophia_profile',
    bg: null,
    bgColor: '#000',
    redLines: true,
    content: 'character_card',
    character: 'sophia',
  },
  // Slide 9 — Case file
  {
    id: 'case_file',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'case_file',
  },
  // Slide 10 — Film strip transition
  {
    id: 'film_transition',
    bg: null,
    bgColor: '#000',
    redLines: false,
    content: 'film_strip',
  },
  // Slide 11 — Cemetery monologue
  {
    id: 'cemetery_1',
    bg: cemeteryBg,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue',
    dialogue: "I- I can't believe he's actually gone. I just met him yesterday. And he was fine and he had something to tell me. It can't be him. No, this isn't him. He wouldn't do this. I knew him he would not.",
    speaker: null,
  },
  // Slide 12
  {
    id: 'cemetery_2',
    bg: cemeteryBg,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue',
    dialogue: "But the police said it was suicide... But if it were so why would he ask to meet me today? There's something wrong. I've got to figure this out.",
    speaker: null,
  },
  // Slide 13 — Interrogation room - Damien interview
  {
    id: 'damien_1',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Damien', side: 'left', text: "Why am I here?" },
      { speaker: 'Yuna', side: 'right', text: "It's about your brother. He didn't kill himself I'm sure of it!" },
      { speaker: 'Damien', side: 'left', text: "I don't want to hear about this." },
      { speaker: 'Yuna', side: 'right', text: "Why not? Where were you when he died?" },
    ],
  },
  // Slide 14
  {
    id: 'damien_2',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Damien', side: 'left', text: "That's none of your concern!" },
      { speaker: 'Yuna', side: 'right', text: "You always hated him didn't you. You blamed him for your mom's death!!" },
      { speaker: 'Damien', side: 'left', text: "I'm leaving. I better not hear a word more on this." },
    ],
    footer: 'Damien leaves.',
  },
  // Slide 15 — Ethan's room flashback
  {
    id: 'ethans_room_1',
    bg: ethansRoom,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue_timed',
    label: 'A MONTH AGO',
    dialogue: "My mom just passed away. I told her to stay away from gambling. Now its taken her away. Why was she so stressed that it caused her to die?",
    speaker: null,
  },
  // Slide 16
  {
    id: 'ethans_room_2',
    bg: ethansRoom,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue',
    dialogue: "(Rustling through the notebooks) What's that? (Picking it up) Is that- Is that a diary? My mom had a diary?",
    speaker: null,
  },
  // Slide 17 — Sophia's diary pages
  {
    id: 'diary_1',
    bg: null,
    bgColor: '#2a1a08',
    redLines: false,
    content: 'diary_page',
    date: 'March 14',
    left: "Today Ethan came home covered in mud again.\nHe smiled like nothing in the world could ever hurt him.\nSometimes I watch him laugh and wonder if he'll ever know how much of his happiness was borrowed from lies I told to protect him.",
    right: "Maybe one day he'll ask questions I can't answer.\n\nMaybe one day he'll hate me for it.\nFor now...\n\nI'd rather let him hate me than let him know the truth too soon.",
  },
  // Slide 18
  {
    id: 'diary_2',
    bg: null,
    bgColor: '#2a1a08',
    redLines: false,
    content: 'diary_page',
    date: 'August 2',
    left: "I saw him today.\nHe didn't see me.\nOr maybe he did...\nHe simply chose not to.\nFunny how someone can spend years pretending another life never existed.\n\nDid I deserve all of this?",
    right: "He looked happy.\nSuccessful.\nImportant.\nI almost walked over.\nI almost called his name.\nInstead I held Ethan's hand and walked away.\n\nSome ghosts are better left sleeping.",
  },
  // Slide 19
  {
    id: 'diary_3',
    bg: null,
    bgColor: '#2a1a08',
    redLines: false,
    content: 'diary_page',
    date: 'November 19',
    left: "The gambling is getting worse.\nEvery time I tell myself it's the last time.\nEvery time I lose.\nI keep thinking...\n\nIf only\n\nIf only I hadn't been there then. If only I didn't choose to do what I did.",
    right: "If only, I had enough money...\n\nmaybe Ethan and Damien could have the life they deserved.\n\nA ridiculous thought.\n\nLuck has never once chosen me.",
  },
  // Slide 20
  {
    id: 'diary_4',
    bg: null,
    bgColor: '#2a1a08',
    redLines: false,
    content: 'diary_page',
    date: 'October 3',
    left: "I have run out of courage. I can't continue with this.\n\nIf this diary is found by any of you my children, just know that I am very sorry.\n\nNot for loving you, never for that you deserve the world.",
    right: "I'm sorry for convincing myself that my silence would protect you. For lying to you both again and again.\n\nYou should know, that there is a man in this city who thinks that forgetting is enough that pretending makes everything well. Maybe it is... for him.",
  },
  // Slide 21
  {
    id: 'diary_5',
    bg: null,
    bgColor: '#2a1a08',
    redLines: false,
    content: 'diary_page',
    date: '',
    left: "If you ever decide to look for answers. Just promise me one thing.\n\nDon't let anger decide what kind of person you become.\n\nYou deserve better than the mistakes that made you. But I love every single mistake that led me to you Ethan, Damien.",
    right: "I'm sorry I wasn't strong enough to tell you the truth before laying on my deathbed I hope you can forgive me.\n\nI wish I had been strong enough, but I hope you two will be without me.\n\nI love you both.",
  },
  // Slide 22 — Ethan reacts
  {
    id: 'ethan_reacts',
    bg: ethansRoom,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue',
    dialogue: "What was that? Who is she talking about? Did she kill herself? She killed herself. She killed herself for the mistakes. What mistakes? That made us? I need to show this to Damien.",
    speaker: null,
  },
  // Slide 23 — Ethan and Damien
  {
    id: 'ethan_damien_1',
    bg: ethansRoom,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Damien', side: 'left', text: "You're still in the pile of notebooks?" },
      { speaker: 'Ethan', side: 'right', text: "Damien, I have to show you something. (Hands over the diary.)" },
      { speaker: 'Damien', side: 'left', text: "Put it back. Don't ever open it." },
      { speaker: 'Ethan', side: 'right', text: "What do you mean? Mom's telling us about something! We need to find out what!!" },
    ],
  },
  // Slide 24
  {
    id: 'ethan_damien_2',
    bg: ethansRoom,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Damien', side: 'left', text: "Mom's dead. Do you get it Ethan. She's dead. DEAD." },
      { speaker: 'Damien', side: 'left', text: "She can't tell us anything. You're being delusional." },
      { speaker: 'Ethan', side: 'right', text: "She killed herself. And you don't care, do you? Like everybody else, you do not care." },
      { speaker: 'Ethan', side: 'right', text: "I can't believe this. I'll figure it out on my own." },
    ],
    footer: 'Ethan leaves.',
    footerColor: '#8B1A1A',
  },
  // Slide 25 — Campus, Ethan monologue
  {
    id: 'campus_monologue',
    bg: campusBg,
    bgColor: '#000',
    redLines: false,
    content: 'dialogue',
    dialogue: "A man who forgot and pretends... Who forgot... the mistakes... what could she possibly mean? Who forgot us and why? What are these mistakes she keeps talking about? Was I- was I a mistake? No, it can't be, she would've told me. She would've.",
    speaker: null,
  },
  // Slide 26 — Campus, Ethan meets Lily
  {
    id: 'campus_lily',
    bg: campusBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'LILY', side: 'left', text: "I can't believe they ran out of- hey, you good?" },
      { speaker: 'Ethan', side: 'right', text: "Oh, Lily. Hey. How's it going?" },
      { speaker: 'LILY', side: 'left', text: "I mean you tell me you were pretty zoned out. What's on your mind?" },
      { speaker: 'Ethan', side: 'right', text: "Nothing. Uh actually no it is something. Can you help me Lily?" },
      { speaker: 'LILY', side: 'left', text: "Sure, why not. What's up." },
    ],
  },
  // Slide 27
  {
    id: 'campus_lily_2',
    bg: campusBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Ethan', side: 'right', text: "Do you think anyone in our town a male, is good at pretending?" },
      { speaker: 'Lily', side: 'left', text: "What do you mean Ethan? You're weird today." },
      { speaker: 'Ethan', side: 'right', text: "Oh its an effect of a murder mystery I saw today haha!" },
      { speaker: 'Lily', side: 'left', text: "Hmm weird. Well I think all business people are good at pretending and stealling from people." },
      { speaker: 'Ethan', side: 'right', text: "(Thinking) Businessmen.." },
    ],
  },
  // Slide 28 — Interrogation / Lily meets Yuna
  {
    id: 'lily_yuna',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Lily', side: 'left', text: "Hi, Yuna." },
      { speaker: 'Yuna', side: 'right', text: "Hi, Lily. I just wanted to ask some questions about Ethan." },
      { speaker: 'Lily', side: 'left', text: "Uh sure Yuna but you know he is dead right. This isn't going to help him." },
      { speaker: 'Yuna', side: 'right', text: "It might. Let's start?" },
    ],
  },
  // Slide 29
  {
    id: 'lily_yuna_2',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Yuna', side: 'right', text: "How was Ethan before he.. was found dead?" },
      { speaker: 'Lily', side: 'left', text: "He was actually acting a bit weird. He kept talking about a man who was pretending." },
      { speaker: 'Yuna', side: 'right', text: "Pretending? Who?" },
      { speaker: 'Lily', side: 'left', text: "I don't know he was zoned out mostly too and he just left when I answered." },
      { speaker: 'Yuna', side: 'right', text: "What did you say??" },
    ],
  },
  // Slide 30 — Final
  {
    id: 'lily_yuna_3',
    bg: interrogationBg,
    bgColor: '#000',
    redLines: false,
    content: 'chat',
    messages: [
      { speaker: 'Yuna', side: 'right', text: "So he was weird." },
      { speaker: 'Lily', side: 'left', text: "Why did he say anything to you too?" },
      { speaker: 'Yuna', side: 'right', text: "A little, yeah. I'll get back to you Lily." },
      { speaker: 'Lily', side: 'left', text: "Uh sure." },
    ],
  },
]

function CharacterCard({ character, onNext }) {
  const chars = {
    ...CHARACTERS,
    sophia: {
      id: 'sophia', name: 'Sophia Vale', age: 42, role: 'Victim\'s Mother (Deceased)',
      occupation: 'Unemployed', status: 'Deceased (prior to main events)',
      personality: 'Loving, unstable, emotionally dependent',
      family: 'Mother of Ethan and Damien. Raised them alone.',
      notable: 'Gambling addiction. Kept a secret that cost her and her son their lives.',
    }
  }
  const c = chars[character]
  if (!c) return null

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Red lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <line x1="0" y1="150" x2="1200" y2="700" stroke="#cc2200" strokeWidth="1.5" />
        <line x1="400" y1="0" x2="0" y2="800" stroke="#cc2200" strokeWidth="1" />
        <line x1="800" y1="0" x2="1400" y2="600" stroke="#cc2200" strokeWidth="1.5" />
        <line x1="200" y1="900" x2="1300" y2="100" stroke="#cc2200" strokeWidth="1" />
      </svg>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-8">
        {/* Paper card */}
        <div
          className="paper-card relative p-10 shadow-2xl"
          style={{ minHeight: 420 }}
        >
          <div className="flex gap-8">
            {/* Text content */}
            <div className="flex-1">
              <h2 className="font-mono text-2xl font-bold text-crimson mb-6">{c.name}</h2>
              <div className="font-mono text-sm leading-8 text-black/90 space-y-1">
                <p><span>Age: </span>{c.age}{c.age === 42 ? ' (at time of death)' : ''}</p>
                {c.id === 'yuna' && <p>Gender: Female</p>}
                {c.id !== 'yuna' && <p>Gender: {['ethan','damien','richard'].includes(c.id) ? 'Male' : 'Female'}</p>}
                <p>Occupation: {c.occupation}</p>
                {c.family && <p>Family: {c.family}</p>}
                <p>Personality: {c.personality}</p>
                {c.notable && <p>Notable: {c.notable}</p>}
                <p>Status: <span className={c.status?.includes('Deceased') || c.status?.includes('Suspect') ? 'text-crimson font-bold' : ''}>{c.status}</span></p>
              </div>
            </div>

            {/* Portrait placeholder */}
            <div className="flex-shrink-0">
              <div
                className="w-36 h-44 border border-black/20 flex items-center justify-center"
                style={{ background: c.portraitBg || '#e8e0d0' }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 opacity-30">
                    {['richard','damien','ethan'].includes(c.id) ? '👤' : '👤'}
                  </div>
                  <p className="font-mono text-xs text-white/50">PHOTO</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={onNext}
            className="absolute bottom-20 right-6 w-10 h-10 rounded-full border border-black/40 flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <span className="text-black/70 text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function DiaryPage({ date, left, right, onNext }) {
  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ backgroundImage: `url(${paperBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div
        className="w-full max-w-4xl mx-auto px-4 py-8"
        style={{
          backgroundImage: `url(${paperBg})`,
          backgroundSize: 'cover',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className="flex gap-12 px-12 py-8">
          {/* Left page */}
          <div className="flex-1">
            {date && <p className="font-hand text-2xl text-black/80 mb-6">{date}</p>}
            <p className="font-hand text-xl text-black/85 leading-9 whitespace-pre-line">{left}</p>
          </div>
          {/* Spine */}
          <div className="w-px bg-black/10" />
          {/* Right page */}
          <div className="flex-1 relative">
            <p className="font-hand text-xl text-black/85 leading-9 whitespace-pre-line">{right}</p>
            <button
              onClick={onNext}
              className="absolute bottom-20 right-0 w-10 h-10 rounded-full border border-black/30 flex items-center justify-center hover:bg-black/10 transition-colors"
            >
              <span className="text-black/60 text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatScene({ messages, footer, footerColor, onNext }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (shown < messages.length) {
      const t = setTimeout(() => setShown(s => s + 1), 900)
      return () => clearTimeout(t)
    }
  }, [shown, messages.length])

  return (
    <div className="relative flex flex-col justify-end h-full pb-8 px-8 gap-4">
      <AnimatePresence>
        {messages.slice(0, shown).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.side === 'right' ? 'justify-end' : 'justify-start'} w-full`}
            style={{ maxWidth: '75%', alignSelf: msg.side === 'right' ? 'flex-end' : 'flex-start' }}
          >
            <div className={msg.side === 'left' ? 'bubble-left' : 'bubble-right'} style={{ maxWidth: 480 }}>
              <div className="speaker-name">{msg.speaker}</div>
              <p>{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {footer && shown >= messages.length && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center font-mono text-sm"
          style={{ color: footerColor || '#e8e0d0' }}
        >
          {footer}
        </motion.p>
      )}

      {shown >= messages.length && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onNext}
          className="absolute bottom-24 right-8 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <span className="text-white/70 text-lg">→</span>
        </motion.button>
      )}
    </div>
  )
}

export default function Intro() {
  const [slideIdx, setSlideIdx] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)
  const { startInvestigation } = useGameStore()

  const slide = INTRO_SLIDES[slideIdx]
  const isLast = slideIdx === INTRO_SLIDES.length - 1

  const nextSlide = () => {
    if (isLast) {
      startInvestigation()
    } else {
      setFadeKey(k => k + 1)
      setSlideIdx(i => i + 1)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${slideIdx}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {slide.bg ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.bg})`, filter: 'brightness(0.4)' }}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: slide.bgColor || '#000' }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-30">
        <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="text-white/60 text-sm">←</span>
        </button>
        <span className="text-white font-mono text-sm tracking-widest">Agnosia</span>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`slide-${slideIdx}`}
          className="absolute inset-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: 70 }}
        >
          {slide.content === 'letter' && (
            <div className="flex items-center justify-center flex-1">
              {/* Red lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
                <line x1="0" y1="200" x2="1400" y2="600" stroke="#cc2200" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="0" y2="900" stroke="#cc2200" strokeWidth="1" />
                <line x1="900" y1="0" x2="200" y2="900" stroke="#cc2200" strokeWidth="1.5" />
                <line x1="600" y1="100" x2="1600" y2="500" stroke="#cc2200" strokeWidth="1" />
              </svg>
              <div className="relative z-10 w-full max-w-xl mx-auto px-8">
                <div className="paper-card p-12 shadow-2xl">
                  <p className="font-mono text-lg leading-9 text-black/85 mb-10">
                    By the Time you read this, I will probably be gone.
                    I hope you will find out the truth.
                  </p>
                  <button
                    onClick={nextSlide}
                    className="absolute bottom-6 right-6 w-10 h-10 rounded-full border border-black/30 flex items-center justify-center hover:bg-black/10 transition-colors"
                  >
                    <span className="text-black/60 text-lg">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {slide.content === 'character_card' && (
            <div className="flex-1">
              <CharacterCard character={slide.character} onNext={nextSlide} />
            </div>
          )}

          {slide.content === 'case_file' && (
            <div className="flex items-center justify-center flex-1">
              <div className="w-full max-w-2xl mx-auto px-8">
                <div className="paper-card p-10 shadow-2xl relative">
                  <h2 className="font-mono text-2xl font-bold text-crimson text-center mb-8">CASE FILE</h2>
                  <div className="font-mono text-sm leading-8 text-black/85">
                    <p className="mb-5">Ethan Vale, a 19-year-old photography student is found dead at an abandoned lakeside observatory on the outskirts of town. The official police report is quick and his death has been ruled as suicide.</p>
                    <p className="mb-5">No forced entry. No clear struggle. No immediate suspects. The case is closed before it truly begins. But not everything about Ethan Vale makes sense.</p>
                    <p>In the weeks leading up to his death, Ethan was not distant. He was not withdrawn. But he was searching for something obsessively. Something he believed would change everything. And then, suddenly… he was gone.</p>
                  </div>
                  {/* Closed stamp */}
                  <div className="absolute bottom-8 right-8 stamp text-lg">CLOSED</div>
                  <button onClick={nextSlide} className="absolute bottom-20 right-6 w-10 h-10 rounded-full border border-black/30 flex items-center justify-center hover:bg-black/10 transition-colors">
                    <span className="text-black/60 text-lg">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {slide.content === 'film_strip' && (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="absolute top-0 left-0 w-72 opacity-80" style={{ transform: 'rotate(-20deg) translate(-60px, -80px)' }}>
                <img src={filmStrip} alt="" className="w-full" />
              </div>
              <div className="absolute bottom-0 right-0 w-72 opacity-80" style={{ transform: 'rotate(20deg) translate(60px, 80px)' }}>
                <img src={filmStrip} alt="" className="w-full" />
              </div>
              <div className="text-center z-10">
                <p className="font-mono text-2xl text-white mb-3">The police called it suicide.</p>
                <div className="w-48 h-px bg-crimson mx-auto mb-6" />
                <p className="font-serif text-xl text-crimson italic">But I know him better.</p>
              </div>
              <button onClick={nextSlide} className="absolute bottom-24 right-8 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 z-10">
                <span className="text-white/60 text-lg">→</span>
              </button>
            </div>
          )}

          {slide.content === 'dialogue' && (
            <div className="flex items-end justify-start flex-1 px-8 pb-8">
              <div className="max-w-xl">
                <div className="bubble-left">
                  <p>{slide.dialogue}</p>
                </div>
                <button onClick={nextSlide} className="mt-4 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10">
                  <span className="text-white/60 text-lg">→</span>
                </button>
              </div>
            </div>
          )}

          {slide.content === 'dialogue_timed' && (
            <div className="flex flex-col flex-1 px-8 pb-8">
              {slide.label && (
                <p className="font-mono text-xl text-white font-bold mt-4 mb-auto">{slide.label}</p>
              )}
              <div className="max-w-xl">
                <div className="bubble-left">
                  <p>{slide.dialogue}</p>
                </div>
                <button onClick={nextSlide} className="mt-4 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10">
                  <span className="text-white/60 text-lg">→</span>
                </button>
              </div>
            </div>
          )}

          {slide.content === 'chat' && (
            <ChatScene
              messages={slide.messages}
              footer={slide.footer}
              footerColor={slide.footerColor}
              onNext={nextSlide}
            />
          )}

          {slide.content === 'diary_page' && (
            <DiaryPage date={slide.date} left={slide.left} right={slide.right} onNext={nextSlide} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <BottomNav />

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {INTRO_SLIDES.map((_, i) => (
          <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === slideIdx ? 'bg-crimson' : 'bg-white/20'}`} />
        ))}
      </div>
    </div>
  )
}
