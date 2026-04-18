import { useEffect, useState } from 'react'

export function ProjectorBackground() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 768)
  }, [])

  if (!mounted) return <div className="app-background-option" aria-hidden />
  if (isMobile)
    return (
      <div
        className="app-background-option"
        aria-hidden
        style={{ background: 'var(--background)' }}
      />
    )

  const dustMotes = [
    { cx: 960, cy: 85, r: 1.4, i: 1 },
    { cx: 982, cy: 108, r: 1.2, i: 2 },
    { cx: 970, cy: 200, r: 2.2, i: 1 },
    { cx: 995, cy: 220, r: 1.9, i: 3 },
    { cx: 900, cy: 280, r: 2.8, i: 1 },
    { cx: 1060, cy: 265, r: 2.4, i: 3 },
    { cx: 1030, cy: 410, r: 2.2, i: 1 },
    { cx: 955, cy: 475, r: 3.2, i: 3 },
    { cx: 985, cy: 545, r: 2.5, i: 3 },
    { cx: 1050, cy: 560, r: 2.1, i: 1 },
    { cx: 955, cy: 860, r: 3.0, i: 3 },
    { cx: 930, cy: 800, r: 1.5, i: 1 },
    { cx: 1010, cy: 150, r: 1.6, i: 2 },
    { cx: 920, cy: 350, r: 2.0, i: 1 },
    { cx: 1080, cy: 450, r: 1.8, i: 3 },
    { cx: 940, cy: 650, r: 2.6, i: 2 },
    { cx: 1000, cy: 750, r: 2.3, i: 1 },
    { cx: 970, cy: 950, r: 1.7, i: 3 },
  ]

  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-projector">
        <svg
          className="bg-projector__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient
              id="projBeam"
              cx="50%"
              cy="12%"
              r="100%"
              fx="50%"
              fy="12%"
            >
              <stop offset="0%" className="bg-projector__beam-center" />
              <stop offset="55%" className="bg-projector__beam-mid" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter
              id="projBeamBlur"
              x="-40%"
              y="-10%"
              width="180%"
              height="130%"
            >
              <feGaussianBlur stdDeviation="40" />
            </filter>
            <filter
              id="projDustBlur"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>
          <g className="bg-projector__device">
            {/* Film reel left */}
            <circle cx={890} cy={12} r={30} fill="none" strokeWidth={2} />
            <circle cx={890} cy={12} r={20} fill="none" strokeWidth={1.5} />
            <circle cx={890} cy={12} r={6} fill="none" strokeWidth={1.5} />
            <line x1={890} y1={-18} x2={890} y2={42} strokeWidth={1} />
            <line x1={860} y1={12} x2={920} y2={12} strokeWidth={1} />
            <line x1={869} y1={-9} x2={911} y2={33} strokeWidth={1} />
            <line x1={911} y1={-9} x2={869} y2={33} strokeWidth={1} />

            <circle cx={1030} cy={12} r={30} fill="none" strokeWidth={2} />
            <circle cx={1030} cy={12} r={20} fill="none" strokeWidth={1.5} />
            <circle cx={1030} cy={12} r={6} fill="none" strokeWidth={1.5} />
            <line x1={1030} y1={-18} x2={1030} y2={42} strokeWidth={1} />
            <line x1={1000} y1={12} x2={1060} y2={12} strokeWidth={1} />
            <line x1={1009} y1={-9} x2={1051} y2={33} strokeWidth={1} />
            <line x1={1051} y1={-9} x2={1009} y2={33} strokeWidth={1} />

            <rect
              x={870}
              y={42}
              width={180}
              height={55}
              rx={8}
              fill="none"
              strokeWidth={2}
            />

            <line
              x1={890}
              y1={42}
              x2={890}
              y2={55}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <line
              x1={1030}
              y1={42}
              x2={1030}
              y2={55}
              strokeWidth={1}
              strokeDasharray="2 2"
            />

            <line
              x1={882}
              y1={55}
              x2={905}
              y2={55}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={882}
              y1={62}
              x2={905}
              y2={62}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={882}
              y1={69}
              x2={905}
              y2={69}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={882}
              y1={76}
              x2={905}
              y2={76}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={882}
              y1={83}
              x2={905}
              y2={83}
              strokeWidth={1}
              strokeLinecap="round"
            />

            <circle cx={1025} cy={70} r={8} fill="none" strokeWidth={1.5} />
            <line
              x1={1025}
              y1={62}
              x2={1025}
              y2={70}
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            <path
              d="M 935 97 L 935 110 Q 935 118 943 118 L 977 118 Q 985 118 985 110 L 985 97"
              fill="none"
              strokeWidth={2}
            />

            <ellipse
              cx={960}
              cy={118}
              rx={18}
              ry={4}
              fill="none"
              strokeWidth={1.5}
            />
            <ellipse
              cx={960}
              cy={122}
              rx={14}
              ry={3}
              fill="none"
              strokeWidth={1}
            />

            <ellipse
              cx={960}
              cy={122}
              rx={8}
              ry={2}
              fill="none"
              strokeWidth={0.5}
            />

            <rect
              x={938}
              y={30}
              width={44}
              height={12}
              rx={3}
              fill="none"
              strokeWidth={1.5}
            />

            <rect
              x={940}
              y={97}
              width={40}
              height={6}
              rx={2}
              fill="none"
              strokeWidth={1.5}
            />
          </g>

          <ellipse
            cx="960"
            cy="122"
            rx="380"
            ry="980"
            fill="url(#projBeam)"
            filter="url(#projBeamBlur)"
            className="bg-projector__beam"
          />
          <ellipse
            cx="960"
            cy="122"
            rx="160"
            ry="80"
            fill="url(#projBeam)"
            filter="url(#projBeamBlur)"
            className="bg-projector__halo"
          />
          {dustMotes.map((d) => (
            <circle
              key={`${d.cx}-${d.cy}`}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              filter="url(#projDustBlur)"
              className={`bg-projector__dust bg-projector__dust--${d.i}`}
            />
          ))}
          <g className="bg-projector__device">
            <rect
              x={870}
              y={-55}
              width={180}
              height={70}
              rx={10}
              fill="none"
              strokeWidth={2}
            />
            <path
              d="M 920 15 L 920 35 Q 920 42 927 42 L 993 42 Q 1000 42 1000 35 L 1000 15"
              fill="none"
              strokeWidth={2}
            />
            <ellipse
              cx={960}
              cy={42}
              rx={22}
              ry={5}
              fill="none"
              strokeWidth={1.5}
            />
            <ellipse
              cx={960}
              cy={44}
              rx={14}
              ry={3}
              fill="none"
              strokeWidth={1}
            />

            <circle cx={910} cy={-55} r={28} fill="none" strokeWidth={2} />
            <circle cx={910} cy={-55} r={18} fill="none" strokeWidth={1.5} />
            <circle cx={910} cy={-55} r={6} fill="none" strokeWidth={1.5} />

            <line x1={910} y1={-83} x2={910} y2={-27} strokeWidth={1} />
            <line x1={882} y1={-55} x2={938} y2={-55} strokeWidth={1} />

            <circle cx={1010} cy={-55} r={28} fill="none" strokeWidth={2} />
            <circle cx={1010} cy={-55} r={18} fill="none" strokeWidth={1.5} />
            <circle cx={1010} cy={-55} r={6} fill="none" strokeWidth={1.5} />

            <line x1={1010} y1={-83} x2={1010} y2={-27} strokeWidth={1} />
            <line x1={982} y1={-55} x2={1038} y2={-55} strokeWidth={1} />

            <line
              x1={938}
              y1={-55}
              x2={982}
              y2={-55}
              strokeWidth={1}
              strokeDasharray="2 2"
            />

            <rect
              x={940}
              y={-75}
              width={40}
              height={20}
              rx={4}
              fill="none"
              strokeWidth={1.5}
            />

            <line
              x1={885}
              y1={-35}
              x2={910}
              y2={-35}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={885}
              y1={-28}
              x2={910}
              y2={-28}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <line
              x1={885}
              y1={-21}
              x2={910}
              y2={-21}
              strokeWidth={1}
              strokeLinecap="round"
            />

            <circle cx={1020} cy={-20} r={8} fill="none" strokeWidth={1.5} />
            <line
              x1={1020}
              y1={-28}
              x2={1020}
              y2={-20}
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            <rect
              x={940}
              y={-15}
              width={40}
              height={8}
              rx={2}
              fill="none"
              strokeWidth={1.5}
            />
          </g>
        </svg>
        <div className="bg-projector__vignette" />
        <div className="bg-projector__grain" />
      </div>
    </div>
  )
}
