import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import type { ReportData } from '@/types/social-mirror'
import React from 'react'

export const dynamic = 'force-dynamic'

// Dimension colors for the card bars
const DIMENSION_COLORS: Record<string, string> = {
  leadership: '#8B5CF6',
  creativity: '#EC4899',
  empathy: '#34D399',
  ambition: '#F59E0B',
  humor: '#FB923C',
  trustworthiness: '#06B6D4',
  intelligence: '#818CF8',
  charisma: '#F472B6',
  resilience: '#10B981',
  loyalty: '#A78BFA',
  confidence: '#FBBF24',
  innovation: '#6366F1',
}

// Fetch a font file for satori rendering
async function loadFont(): Promise<ArrayBuffer> {
  // Use Inter from Google Fonts (static weight 700)
  const fontUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf'
  const res = await fetch(fontUrl)
  return res.arrayBuffer()
}

async function loadFontRegular(): Promise<ArrayBuffer> {
  // Inter 400
  const fontUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf'
  const res = await fetch(fontUrl)
  return res.arrayBuffer()
}

// GET /api/profiles/[slug]/card?pin=xxx — generate Social Identity Card as PNG
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const pin = request.nextUrl.searchParams.get('pin')

    if (!pin) {
      return new Response('PIN required', { status: 401 })
    }

    const supabase = await createClient()

    // 1. Get profile
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      return new Response('Profile not found', { status: 404 })
    }

    // 2. Verify PIN
    const pinValid = await bcrypt.compare(pin, profile.pin_hash)
    if (!pinValid) {
      return new Response('Incorrect PIN', { status: 401 })
    }

    // 3. Get cached report
    const { data: cachedReport } = await supabase
      .from('sm_reports')
      .select('report_data')
      .eq('profile_id', profile.id)
      .eq('report_type', 'standard')
      .single()

    if (!cachedReport) {
      return new Response('Report not generated yet', { status: 404 })
    }

    const report = cachedReport.report_data as ReportData

    // 4. Get top 4 scores
    const topScores = Object.entries(report.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 4)

    // 5. Load fonts
    const [fontBold, fontRegular] = await Promise.all([
      loadFont(),
      loadFontRegular(),
    ])

    // 6. Render card to SVG using satori
    const format = request.nextUrl.searchParams.get('format')
    const isStory = format === 'story'
    const cardWidth = isStory ? 540 : 480
    const cardHeight = isStory ? 960 : 640

    const svg = await satori(
      isStory 
      ? React.createElement('div', {
        style: {
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          background: '#090514',
          padding: '80px 48px 60px 48px',
          position: 'relative',
          fontFamily: 'Inter',
          overflow: 'hidden',
          color: '#FFFFFF',
        }
      },
        // Radial glows
        React.createElement('div', {
          style: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle 500px at 50% 25%, rgba(139, 92, 246, 0.35), transparent), radial-gradient(circle 400px at 50% 85%, rgba(236, 72, 153, 0.25), transparent)',
          }
        }),
        // Sparkles
        React.createElement('span', { style: { position: 'absolute', top: '10%', left: '10%', fontSize: '24px', opacity: 0.3 } }, '✨'),
        React.createElement('span', { style: { position: 'absolute', top: '25%', right: '12%', fontSize: '24px', opacity: 0.3 } }, '✨'),
        // Tagline
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 800,
            color: '#F472B6',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            marginBottom: '8px',
          }
        }, 'My Social Archetype'),
        // Archetype emoji
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '96px',
            lineHeight: 1,
            marginBottom: '20px',
          }
        }, report.archetype_emoji),
        // Archetype name
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textAlign: 'center' as const,
            marginBottom: '10px',
          }
        }, report.archetype),
        // Sub-text / responses
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#9CA3AF',
            fontWeight: 600,
            marginBottom: '80px',
          }
        }, `Based on ${report.response_count} friend responses`),
        // Score bars
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
          }
        }, ...topScores.map(([dim, score]) =>
          React.createElement('div', {
            key: dim,
            style: { display: 'flex', flexDirection: 'column', gap: '10px' }
          },
            React.createElement('div', {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            },
              React.createElement('span', {
                style: {
                  fontSize: '15px', color: '#E5E7EB', fontWeight: 600,
                  textTransform: 'capitalize' as const,
                }
              }, dim),
              React.createElement('span', {
                style: {
                  fontSize: '15px', fontWeight: 800,
                  color: DIMENSION_COLORS[dim] ?? '#818CF8',
                }
              }, `${score}%`)
            ),
            React.createElement('div', {
              style: {
                width: '100%', height: '12px',
                background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px',
                overflow: 'hidden', display: 'flex',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }
            },
              React.createElement('div', {
                style: {
                  width: `${score}%`, height: '100%',
                  background: DIMENSION_COLORS[dim] ?? '#818CF8',
                  borderRadius: '6px',
                }
              })
            )
          )
        )),
        // Footer brand
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }
        },
          React.createElement('span', {
            style: {
              fontSize: '13px', color: '#9CA3AF',
              letterSpacing: '0.25em', fontWeight: 700,
            }
          }, '🪞 SOCIAL MIRROR'),
          React.createElement('span', {
            style: {
              fontSize: '10px', color: '#6B7280',
              letterSpacing: '0.1em', fontWeight: 500,
            }
          }, 'Discover yours at socialmirror.vercel.app')
        )
      )
      : React.createElement('div', {
        style: {
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #fcfafc 100%)',
          borderRadius: '32px',
          padding: '48px 40px',
          position: 'relative',
          fontFamily: 'Inter',
          overflow: 'hidden',
        }
      },
        // Background gradient overlay
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse 80% 60% at 30% -10%, rgba(161,140,209,0.15), transparent), radial-gradient(ellipse 50% 50% at 80% 110%, rgba(244,114,182,0.15), transparent)',
          }
        }),
        // Archetype emoji
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '64px',
            lineHeight: 1,
            marginBottom: '12px',
          }
        }, report.archetype_emoji),
        // Archetype name
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #818CF8, #F472B6)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '8px',
          }
        }, report.archetype),
        // Response count
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '13px',
            color: '#A1A1AA',
            fontWeight: 600,
            marginBottom: '36px',
          }
        }, `Based on ${report.response_count} friend responses`),
        // Score bars
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
          }
        }, ...topScores.map(([dim, score]) =>
          React.createElement('div', {
            key: dim,
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            React.createElement('div', {
              style: { display: 'flex', justifyContent: 'space-between' }
            },
              React.createElement('span', {
                style: {
                  fontSize: '14px', color: '#52525B', fontWeight: 600,
                  textTransform: 'capitalize' as const,
                }
              }, dim),
              React.createElement('span', {
                style: {
                  fontSize: '14px', fontWeight: 800,
                  color: DIMENSION_COLORS[dim] ?? '#818CF8',
                }
              }, `${score}%`)
            ),
            React.createElement('div', {
              style: {
                width: '100%', height: '10px',
                background: '#F4F4F5', borderRadius: '5px',
                overflow: 'hidden', display: 'flex',
              }
            },
              React.createElement('div', {
                style: {
                  width: `${score}%`, height: '100%',
                  background: DIMENSION_COLORS[dim] ?? '#818CF8',
                  borderRadius: '5px',
                }
              })
            )
          )
        )),
        // Footer brand
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }
        },
          React.createElement('span', {
            style: {
              fontSize: '12px', color: '#A1A1AA',
              letterSpacing: '0.15em', fontWeight: 700,
            }
          }, '🪞 SOCIAL MIRROR')
        )
      ),
      {
        width: cardWidth,
        height: cardHeight,
        fonts: [
          {
            name: 'Inter',
            data: fontBold,
            weight: 700,
            style: 'normal' as const,
          },
          {
            name: 'Inter',
            data: fontRegular,
            weight: 400,
            style: 'normal' as const,
          },
        ],
      }
    )

    // 7. Convert SVG to PNG
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width' as const, value: cardWidth * 2 },
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    // 8. Return PNG image
    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="social-mirror-${slug}.png"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })

  } catch (err) {
    console.error('Card generation error:', err)
    return new Response('Failed to generate card', { status: 500 })
  }
}
