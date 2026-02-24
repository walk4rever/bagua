import { useMemo, useRef, useState } from 'react'
import zhouyi from './data/zhouyi.json'
import './App.css'

type HexagramEntry = {
  id: number
  title: string
  guaCi: string
  yaoCi: string[]
  tuan: string[]
  xiang: string[]
  wenyan: string[]
}

type Line = {
  value: 6 | 7 | 8 | 9
  yin: boolean
  changing: boolean
}

type HexagramResult = {
  lines: Line[]
  number: number
  entry: HexagramEntry | null
  advice: string[]
}

const entries = zhouyi as HexagramEntry[]

const trigramByBits: Record<number, string> = {
  0b111: 'tian',
  0b110: 'ze',
  0b101: 'huo',
  0b100: 'lei',
  0b011: 'feng',
  0b010: 'shui',
  0b001: 'shan',
  0b000: 'di',
}

const hexagramOrder = [
  'tian_tian',
  'tian_ze',
  'tian_huo',
  'tian_lei',
  'tian_feng',
  'tian_shui',
  'tian_shan',
  'tian_di',
  'ze_tian',
  'ze_ze',
  'ze_huo',
  'ze_lei',
  'ze_feng',
  'ze_shui',
  'ze_shan',
  'ze_di',
  'huo_tian',
  'huo_ze',
  'huo_huo',
  'huo_lei',
  'huo_feng',
  'huo_shui',
  'huo_shan',
  'huo_di',
  'lei_tian',
  'lei_ze',
  'lei_huo',
  'lei_lei',
  'lei_feng',
  'lei_shui',
  'lei_shan',
  'lei_di',
  'feng_tian',
  'feng_ze',
  'feng_huo',
  'feng_lei',
  'feng_feng',
  'feng_shui',
  'feng_shan',
  'feng_di',
  'shui_tian',
  'shui_ze',
  'shui_huo',
  'shui_lei',
  'shui_feng',
  'shui_shui',
  'shui_shan',
  'shui_di',
  'shan_tian',
  'shan_ze',
  'shan_huo',
  'shan_lei',
  'shan_feng',
  'shan_shui',
  'shan_shan',
  'shan_di',
  'di_tian',
  'di_ze',
  'di_huo',
  'di_lei',
  'di_feng',
  'di_shui',
  'di_shan',
  'di_di',
]

const hexagramNumbers = [
  1, 10, 13, 25, 44, 6, 33, 12, 43, 58, 49, 17, 28, 47, 31, 45, 14, 38, 30,
  21, 50, 64, 56, 35, 34, 54, 55, 51, 32, 40, 62, 16, 9, 61, 37, 42, 57, 59,
  53, 20, 5, 60, 63, 3, 48, 29, 39, 8, 26, 41, 21, 27, 18, 4, 52, 23, 11, 19,
  36, 24, 46, 7, 15, 2,
]

const hexagramMap = hexagramOrder.reduce<Record<string, number>>((map, key, index) => {
  map[key] = hexagramNumbers[index]
  return map
}, {})

const buildTrigramKey = (lines: Line[]) => {
  const bits =
    (lines[0].yin ? 0 : 1) +
    (lines[1].yin ? 0 : 2) +
    (lines[2].yin ? 0 : 4)
  return trigramByBits[bits]
}

const deriveAdvice = (lines: Line[]) => {
  const yinCount = lines.filter((line) => line.yin).length
  const yangCount = lines.length - yinCount
  const changeCount = lines.filter((line) => line.changing).length

  const balance =
    yinCount === yangCount
      ? '阴阳相济'
      : yinCount > yangCount
        ? '阴势偏盛'
        : '阳势偏盛'

  const movement =
    changeCount === 0
      ? '局势趋于稳定，可守可进'
      : changeCount <= 2
        ? '变化初起，宜顺势而行'
        : changeCount <= 4
          ? '变化加速，宜稳中求变'
          : '变动剧烈，宜谨慎收束'

  return [
    `当前形势呈现“${balance}”之象。`,
    `变爻数量为 ${changeCount}，${movement}。`,
    '先明内心所求，再定行动次序，切勿急于求成。',
  ]
}

const tossLine = (): Line => {
  const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 2 : 3))
  const sum = (coins[0] + coins[1] + coins[2]) as 6 | 7 | 8 | 9
  if (sum === 6) {
    return { value: 6, yin: true, changing: true }
  }
  if (sum === 7) {
    return { value: 7, yin: false, changing: false }
  }
  if (sum === 8) {
    return { value: 8, yin: true, changing: false }
  }
  return { value: 9, yin: false, changing: true }
}

function App() {
  const [result, setResult] = useState<HexagramResult | null>(null)
  const [isCasting, setIsCasting] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const hasResult = Boolean(result?.entry)

  const resetCast = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsCasting(false)
    setResult(null)
  }

  const handleCast = () => {
    if (hasResult || isCasting) {
      resetCast()
      return
    }
    const lines = Array.from({ length: 6 }, () => tossLine())
    const lower = buildTrigramKey(lines.slice(0, 3))
    const upper = buildTrigramKey(lines.slice(3, 6))
    const key = `${upper}_${lower}`
    const number = hexagramMap[key] ?? 1
    const entry = entries.find((item) => item.id === number) ?? null
    const advice = deriveAdvice(lines)
    const nextResult = { lines, number, entry, advice }
    setIsCasting(true)
    timeoutRef.current = window.setTimeout(() => {
      setResult(nextResult)
      setIsCasting(false)
      timeoutRef.current = null
    }, 3000)
  }

  const changingLines = useMemo(
    () =>
      result?.lines
        .map((line, index) => ({ line, index }))
        .filter((item) => item.line.changing) ?? [],
    [result]
  )

  const displayLines = result?.lines
    ? [...result.lines].reverse()
    : Array.from({ length: 6 }, () => null)

  return (
    <div className="app">
      <header className="hero">
        <div className="seal">卦</div>
        <div className="hero-text">
          <p className="subtitle">静心 · 观变 · 明行</p>
          <h1>八卦起心</h1>
          <p className="description">
            以阴阳为镜，照见内心之事。起卦前请平静情绪，想清楚所求，默念三遍即可。
          </p>
        </div>
      </header>

      <section className="panel cast-panel">
        <div className="cast-info">
          <div>
            <h2>起卦提示</h2>
            <p className="panel-tip">
              起卦遵循三枚铜钱法，共六爻自下而上。数得六（老阴）或九（老阳）为变爻，将用金纹标记。
            </p>
          </div>
          <button className="cast-button" onClick={handleCast}>
            {hasResult || isCasting ? '放空一下' : '八卦一下'}
          </button>
        </div>
      </section>

      {isCasting ? (
        <section className="panel casting-panel">
          <div className="casting-content">
            <div className="yin-yang-spinner" aria-hidden="true">
              <span className="dot dot-dark" />
              <span className="dot dot-light" />
            </div>
            <div>
              <h2>卦象生成中</h2>
              <p className="subtle">静心片刻，让卦象自然显现。</p>
            </div>
          </div>
        </section>
      ) : null}

      {hasResult ? (
        <>
          <main className="layout">
            <section className="panel result-panel">
              <div className="panel-header">
                <h2>卦象与解读</h2>
                <span className="badge">第 {result?.number} 卦</span>
              </div>

              <div className="result-body">
                <div className="hexagram">
                  <svg className="hexagram-image" viewBox="0 0 160 120" aria-hidden="true">
                    {displayLines.map((line, index) => {
                      if (!line) return null
                      const y = 6 + index * 18
                      const fill = line.changing ? '#f0c36a' : '#f3dcb2'
                      if (line.yin) {
                        return (
                          <g key={`svg-${index}`}>
                            <rect x="10" y={y} width="58" height="10" rx="5" fill={fill} />
                            <rect x="92" y={y} width="58" height="10" rx="5" fill={fill} />
                          </g>
                        )
                      }
                      return (
                        <rect
                          key={`svg-${index}`}
                          x="10"
                          y={y}
                          width="140"
                          height="10"
                          rx="5"
                          fill={fill}
                        />
                      )
                    })}
                  </svg>
                  <div className="lines">
                    {displayLines.map((line, index) => (
                      <div
                        key={`line-${index}`}
                        className={`line ${line ? (line.yin ? 'yin' : 'yang') : 'empty'} ${
                          line?.changing ? 'changing' : ''
                        }`}
                      >
                        {line ? (
                          line.yin ? (
                            <>
                              <span />
                              <span />
                            </>
                          ) : (
                            <span className="full" />
                          )
                        ) : (
                          <span className="full muted" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="line-caption">下卦 → 上卦</div>
                  {changingLines.length > 0 ? (
                    <div className="changing-lines">
                      变爻：
                      {changingLines.map((item) => (
                        <span key={`change-${item.index}`}>
                          第 {item.index + 1} 爻
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="changing-lines subtle">无变爻，宜守宜定</div>
                  )}
                </div>

                <div className="text-block">
                  <h3>{result?.entry?.title}</h3>
                  <div className="quote">{result?.entry?.guaCi}</div>

                  <div className="section">
                    <h4>卦辞</h4>
                    <p>{result?.entry?.guaCi}</p>
                  </div>

                  <div className="section">
                    <h4>爻辞</h4>
                    <ul>
                      {result?.entry?.yaoCi.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="section">
                    <h4>象传</h4>
                    <ul>
                      {result?.entry?.xiang.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="section">
                    <h4>彖传</h4>
                    <ul>
                      {result?.entry?.tuan.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  {result?.entry?.wenyan.length ? (
                    <div className="section">
                      <h4>文言</h4>
                      <ul>
                        {result?.entry?.wenyan.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </main>

          <section className="panel guidance-panel">
            <h2>行动指引</h2>
            <ul>
              {result?.advice.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}

export default App
