import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore, { EVIDENCE_DATA, CHARACTERS, SUSPECTS } from '../store/gameStore.js'
import BottomNav from '../components/BottomNav.jsx'

const NODE_TYPES = {
  suspect: { color: '#ef4444', label: 'Suspect', icon: '👤' },
  evidence: { color: '#f59e0b', label: 'Evidence', icon: '🔍' },
  motive: { color: '#8b5cf6', label: 'Motive', icon: '💭' },
  location: { color: '#10b981', label: 'Location', icon: '📍' },
  timeline: { color: '#3b82f6', label: 'Timeline', icon: '⏱' },
}

const PREBUILT_NODES = [
  { id: 'pre-ethan', type: 'suspect', label: 'Ethan Vale (Victim)', x: 340, y: 120, fixed: true },
  { id: 'pre-richard', type: 'suspect', label: 'Richard Hart', x: 600, y: 280, fixed: false },
  { id: 'pre-damien', type: 'suspect', label: 'Damien Vale', x: 80, y: 280, fixed: false },
  { id: 'pre-observatory', type: 'location', label: 'Observatory', x: 340, y: 320, fixed: false },
  { id: 'pre-secret', type: 'motive', label: 'Hidden Family Secret', x: 340, y: 460, fixed: false },
]

export default function Deduction() {
  const {
    deductionNodes, deductionConnections,
    addDeductionNode, updateDeductionNode, removeDeductionNode,
    addDeductionConnection, removeDeductionConnection,
    discoveredEvidence, setScreen
  } = useGameStore()

  const svgRef = useRef(null)
  const [draggingNode, setDraggingNode] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState(null)
  const [connectionLabel, setConnectionLabel] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [newNodeType, setNewNodeType] = useState('evidence')
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize with prebuilt nodes if board is empty
  useEffect(() => {
    if (!initialized && deductionNodes.length === 0) {
      PREBUILT_NODES.forEach(n => addDeductionNode({ ...n, id: n.id + '-' + Date.now() + Math.random() }))
      setInitialized(true)
    }
  }, [])

  const allNodes = deductionNodes

  const getNodePos = (nodeId) => {
    const n = allNodes.find(n => n.id === nodeId)
    return n ? { x: n.x, y: n.y } : { x: 0, y: 0 }
  }

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation()
    if (connecting) {
      if (connecting !== nodeId) {
        addDeductionConnection(connecting, nodeId, connectionLabel)
        setConnecting(null)
        setConnectionLabel('')
      }
      return
    }
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const node = allNodes.find(n => n.id === nodeId)
    setDraggingNode(nodeId)
    setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y })
    setSelectedNode(nodeId === selectedNode ? null : nodeId)
    setSelectedConnection(null)
  }

  const handleMouseMove = useCallback((e) => {
    if (!draggingNode) return
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y
    updateDeductionNode(draggingNode, { x: Math.max(40, Math.min(880, x)), y: Math.max(30, Math.min(520, y)) })
  }, [draggingNode, dragOffset])

  const handleMouseUp = () => setDraggingNode(null)

  const addNode = () => {
    if (!newNodeLabel.trim()) return
    addDeductionNode({
      id: `node-${Date.now()}`,
      type: newNodeType,
      label: newNodeLabel.trim(),
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 250,
    })
    setNewNodeLabel('')
    setShowAddPanel(false)
  }

  const addEvidenceNode = (ev) => {
    addDeductionNode({
      id: `ev-node-${ev.id}`,
      type: 'evidence',
      label: ev.title,
      x: 150 + Math.random() * 500,
      y: 150 + Math.random() * 300,
    })
    setShowAddPanel(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur-sm px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('hub')} className="font-mono text-xs text-white/40 hover:text-white transition-colors">← Hub</button>
            <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">Deduction Board</h1>
          </div>
          <div className="flex items-center gap-2">
            {connecting && (
              <div className="flex items-center gap-2 bg-crimson/20 border border-crimson/40 px-3 py-1.5">
                <span className="font-mono text-xs text-crimson-light">Click another node to connect</span>
                <button onClick={() => { setConnecting(null); setConnectionLabel('') }} className="text-white/40 hover:text-white">✕</button>
              </div>
            )}
            <button
              onClick={() => setShowAddPanel(p => !p)}
              className="font-mono text-xs border border-white/20 px-3 py-1.5 hover:border-white/50 transition-colors"
            >
              + Add Node
            </button>
            <button
              onClick={() => connecting ? (setConnecting(null), setConnectionLabel('')) : null}
              className={`font-mono text-xs border px-3 py-1.5 transition-colors ${selectedNode ? 'border-crimson/50 text-crimson-light hover:border-crimson' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
              onClick={() => { if (selectedNode) { setConnecting(selectedNode); setSelectedNode(null) } }}
            >
              🕸 Connect
            </button>
          </div>
        </div>
      </div>

      {/* Add node panel */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-black/60 px-8 py-4 overflow-hidden flex-shrink-0"
          >
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <p className="font-mono text-xs text-white/30 mb-1">Type</p>
                <div className="flex gap-1">
                  {Object.entries(NODE_TYPES).map(([type, cfg]) => (
                    <button
                      key={type}
                      onClick={() => setNewNodeType(type)}
                      className={`font-mono text-xs px-3 py-1.5 border transition-all ${newNodeType === type ? 'border-current' : 'border-white/10 text-white/30 hover:text-white'}`}
                      style={newNodeType === type ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + '15' } : {}}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-mono text-xs text-white/30 mb-1">Label</p>
                <input
                  value={newNodeLabel}
                  onChange={e => setNewNodeLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNode()}
                  placeholder="Node label..."
                  className="w-full bg-white/5 border border-white/15 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-crimson/50 placeholder-white/20"
                />
              </div>
              <button
                onClick={addNode}
                className="bg-crimson px-4 py-2 font-mono text-xs text-white hover:bg-crimson-light transition-colors"
              >
                Add
              </button>
            </div>

            {/* Quick-add discovered evidence */}
            {discoveredEvidence.length > 0 && (
              <div className="mt-3">
                <p className="font-mono text-xs text-white/20 mb-2">Quick-add evidence:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EVIDENCE_DATA.filter(e => discoveredEvidence.includes(e.id)).map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => addEvidenceNode(ev)}
                      className="font-mono text-xs border border-yellow-500/20 text-yellow-500/40 hover:text-yellow-400 hover:border-yellow-400/50 px-2 py-1 transition-colors"
                    >
                      {ev.title.slice(0, 25)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#050505', minHeight: '500px' }}>
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#666" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: draggingNode ? 'grabbing' : connecting ? 'crosshair' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => { setSelectedNode(null); setSelectedConnection(null) }}
        >
          {/* Connection lines */}
          {deductionConnections.map(conn => {
            const from = getNodePos(conn.from)
            const to = getNodePos(conn.to)
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            const isSelected = selectedConnection === conn.id
            return (
              <g key={conn.id}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  className="string-line"
                  stroke={isSelected ? '#ff6b6b' : '#cc2200'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(204,34,0,0.5))', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedConnection(conn.id); setSelectedNode(null) }}
                />
                {conn.label && (
                  <text x={mx} y={my - 6} textAnchor="middle" fill="#cc2200" fontSize="10" fontFamily="monospace" opacity="0.7">
                    {conn.label}
                  </text>
                )}
                {isSelected && (
                  <g onClick={(e) => { e.stopPropagation(); removeDeductionConnection(conn.id); setSelectedConnection(null) }}
                     style={{ cursor: 'pointer' }}>
                    <circle cx={mx} cy={my} r={10} fill="#1a0000" stroke="#cc2200" strokeWidth="1" />
                    <text x={mx} y={my + 4} textAnchor="middle" fill="#cc2200" fontSize="12">✕</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {allNodes.map(node => {
            const cfg = NODE_TYPES[node.type] || NODE_TYPES.evidence
            const isSelected = selectedNode === node.id
            const isConnectFrom = connecting === node.id
            const words = node.label.split(' ')
            const lines = []
            let current = ''
            words.forEach(w => {
              if ((current + ' ' + w).length > 16 && current) { lines.push(current); current = w }
              else current = current ? current + ' ' + w : w
            })
            if (current) lines.push(current)

            const nodeW = Math.max(90, Math.min(140, node.label.length * 7 + 20))
            const nodeH = 32 + lines.length * 16

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - nodeW / 2}, ${node.y - nodeH / 2})`}
                className="deduction-node"
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              >
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={3}
                  fill="#0a0a0a"
                  stroke={isConnectFrom ? '#fff' : isSelected ? cfg.color : cfg.color + '60'}
                  strokeWidth={isSelected || isConnectFrom ? 2 : 1}
                  style={{ filter: isSelected ? `drop-shadow(0 0 8px ${cfg.color}60)` : 'none' }}
                />
                {/* Icon */}
                <text x={10} y={20} fontSize="12" fill={cfg.color} opacity={0.8}>{cfg.icon}</text>
                {/* Label */}
                {lines.map((line, i) => (
                  <text key={i} x={nodeW / 2} y={22 + i * 15} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="10" fontFamily="monospace">
                    {line}
                  </text>
                ))}
                {/* Delete button when selected */}
                {isSelected && (
                  <g onClick={(e) => { e.stopPropagation(); removeDeductionNode(node.id); setSelectedNode(null) }}>
                    <circle cx={nodeW - 8} cy={8} r={7} fill="#1a0000" stroke={cfg.color} strokeWidth="1" style={{ cursor: 'pointer' }} />
                    <text x={nodeW - 8} y={12} textAnchor="middle" fill={cfg.color} fontSize="10" style={{ cursor: 'pointer' }}>✕</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* Empty state */}
        {allNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-white/20 text-sm mb-2">Your deduction board is empty.</p>
              <p className="font-mono text-white/10 text-xs">Click "+ Add Node" to start connecting suspects, evidence and motives.</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-black/70 border border-white/10 p-3 space-y-1.5">
          {Object.entries(NODE_TYPES).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span className="font-mono text-xs text-white/40">{cfg.label}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-px" style={{ background: '#cc2200' }} />
              <span className="font-mono text-xs text-white/40">Connection</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="absolute bottom-4 left-4 font-mono text-xs text-white/20 space-y-1">
          <p>• Click node to select</p>
          <p>• Drag nodes to reposition</p>
          <p>• Select + click Connect to link</p>
          <p>• Click connection line to delete</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
