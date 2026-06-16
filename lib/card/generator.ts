import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import React from 'react'

let syneFontBuffer: ArrayBuffer | null = null
let dmSansFontBuffer: ArrayBuffer | null = null

// Helper to fetch fonts
async function loadFonts() {
  if (!syneFontBuffer) {
    const res = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/syne@latest/latin-700-normal.ttf')
    if (!res.ok) throw new Error('Failed to fetch Syne font')
    syneFontBuffer = await res.arrayBuffer()
  }
  if (!dmSansFontBuffer) {
    const res = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-400-normal.ttf')
    if (!res.ok) throw new Error('Failed to fetch DM Sans font')
    dmSansFontBuffer = await res.arrayBuffer()
  }
  return {
    syne: syneFontBuffer,
    dmSans: dmSansFontBuffer,
  }
}

interface GeneratorOptions {
  username: string
  displayName: string
  archetype: string
  roast: string
  scores: Record<string, number>
  type: 'story' | 'og'
}

export async function generateStoryCard({
  username,
  displayName,
  archetype,
  roast,
  scores,
  type = 'story',
}: GeneratorOptions): Promise<Buffer> {
  const fonts = await loadFonts()
  
  // Dimensions
  const width = type === 'story' ? 1080 : 1200
  const height = type === 'story' ? 1920 : 630

  // Trigonometry calculation for Satori SVG
  const cx = 150
  const cy = 150
  const r = 85
  const sides = 7

  const getCoordsString = (scale: number) => {
    return Array.from({ length: sides })
      .map((_, i) => {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const distance = r * scale
        const x = cx + distance * Math.cos(angle)
        const y = cy + distance * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Draw actual scores
  const scoreKeys = ['charisma', 'resilience', 'loyalty', 'innovation', 'confidence', 'warmth', 'wit']
  const scorePoints = scoreKeys
    .map((key, i) => {
      const score = scores[key] ?? 50
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
      const distance = r * (score / 100)
      const x = cx + distance * Math.cos(angle)
      const y = cy + distance * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')

  // Render Satori Tree
  const satoriTree = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF8F5',
        color: '#0F0D0B',
        fontFamily: 'DM Sans',
        padding: type === 'story' ? '80px 60px' : '40px 60px',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '500px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(250, 248, 245, 0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '500px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(250, 248, 245, 0) 70%)',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '32px', fontFamily: 'Syne', fontWeight: 'bold', color: '#8B5CF6' }}>
          Quizly✦
        </span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#6B6560', border: '1px solid #EBE7E0', borderRadius: '100px', padding: '6px 16px', backgroundColor: '#FFFFFF' }}>
          {type === 'story' ? 'Instagram Story' : 'Personality Radar'}
        </span>
      </div>

      {/* Main Content Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: type === 'story' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexGrow: 1,
          margin: '40px 0',
        }}
      >
        {/* Left / Top - Text Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: type === 'story' ? '100%' : '50%',
            alignItems: type === 'story' ? 'center' : 'flex-start',
            textAlign: type === 'story' ? 'center' : 'left',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#6B6560', marginBottom: '8px' }}>
            @{username} is classified as:
          </span>
          <h1 style={{ fontSize: type === 'story' ? '56px' : '44px', fontFamily: 'Syne', fontWeight: 'bold', color: '#0F0D0B', margin: '0 0 16px 0', lineHeight: 1.15 }}>
            {archetype}
          </h1>

          {/* Roast Callout */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#8B5CF6',
              padding: '24px',
              borderRadius: '16px',
              color: '#FFFFFF',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.15)',
              marginTop: '12px',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#DDD6FE', textTransform: 'uppercase', tracking: '0.1em', marginBottom: '8px' }}>
              The Friendly Roast 🔥
            </span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1.4, fontStyle: 'italic' }}>
              &ldquo;{roast}&ldquo;
            </span>
          </div>
        </div>

        {/* Right / Bottom - Radar Chart */}
        <div style={{ display: 'flex', position: 'relative', width: '300px', height: '300px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #EBE7E0', justifyContent: 'center', alignItems: 'center', padding: '10px', marginTop: type === 'story' ? '40px' : '0' }}>
          <svg width="300" height="300">
            {/* Concentric grids */}
            <polygon points={getCoordsString(0.25)} fill="none" stroke="#EBE7E0" strokeWidth="1" strokeDasharray="3,3" />
            <polygon points={getCoordsString(0.5)} fill="none" stroke="#EBE7E0" strokeWidth="1" strokeDasharray="3,3" />
            <polygon points={getCoordsString(0.75)} fill="none" stroke="#EBE7E0" strokeWidth="1" strokeDasharray="3,3" />
            <polygon points={getCoordsString(1.0)} fill="none" stroke="#EBE7E0" strokeWidth="1" />
            
            {/* Axes */}
            {Array.from({ length: sides }).map((_, i) => {
              const outer = getCoordsString(1.0).split(' ')[i].split(',')
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outer[0]}
                  y2={outer[1]}
                  stroke="#EBE7E0"
                  strokeWidth="1"
                />
              )
            })}

            {/* Score Polygon */}
            <polygon points={scorePoints} fill="rgba(236, 72, 153, 0.25)" stroke="#8B5CF6" strokeWidth="3" />
          </svg>

          {/* Dimension Labels */}
          {scoreKeys.map((key, i) => {
            const score = scores[key] ?? 50
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
            const labelDist = r * 1.25
            const x = cx + labelDist * Math.cos(angle)
            const y = cy + labelDist * Math.sin(angle)

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: `${(x / 300) * 100}%`,
                  top: `${(y / 300) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#6B6560', textTransform: 'uppercase' }}>
                  {key.slice(0, 3)}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0F0D0B' }}>
                  {score}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderTop: '1px solid #EBE7E0',
          paddingTop: '24px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#6B6560', marginBottom: '4px' }}>
          How do your friends perceive you?
        </span>
        <span style={{ fontSize: '22px', fontFamily: 'Syne', fontWeight: 'bold', color: '#8B5CF6' }}>
          quizly.app/{username}
        </span>
      </div>
    </div>
  )

  // Satori compiles to SVG
  const svg = await satori(satoriTree, {
    width,
    height,
    fonts: [
      {
        name: 'Syne',
        data: fonts.syne,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'DM Sans',
        data: fonts.dmSans,
        weight: 400,
        style: 'normal',
      },
    ],
  })

  // Render SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  })

  const pngData = resvg.render()
  return pngData.asPng()
}
