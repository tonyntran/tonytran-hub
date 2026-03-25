'use client'

export function PokemonTCGPreview() {
  const cards = [
    { name: 'Charizard ex', set: 'OBF', price: '$87.50', change: '+12.3%', up: true, color: '#EF4444', hot: false },
    { name: 'Lugia V Alt', set: 'SIT', price: '$214.00', change: '+5.8%', up: true, color: '#60A5FA', hot: true },
    { name: 'Mew VMAX', set: 'FST', price: '$42.30', change: '-3.1%', up: false, color: '#A78BFA', hot: false },
    { name: 'Umbreon VMAX', set: 'EVS', price: '$310.00', change: '+1.4%', up: true, color: '#FBBF24', hot: false },
    { name: 'Pikachu VMax', set: 'VIV', price: '$68.90', change: '-0.7%', up: false, color: '#FACC15', hot: false },
  ]

  const tickerItems = [
    { name: 'Zard ex', up: true },
    { name: 'Lugia V', up: true },
    { name: 'Mew VMax', up: false },
    { name: 'Umb VMAX', up: true },
    { name: 'Pika V', up: false },
    { name: 'Ray VMAX', up: true },
    { name: 'Gengar V', up: true },
    { name: 'Zard ex', up: true },
    { name: 'Lugia V', up: true },
    { name: 'Mew VMax', up: false },
  ]

  // Chart points — ascending trend with some volatility
  const chartPoints = [
    [0, 62], [12, 58], [24, 55], [36, 60], [48, 52],
    [60, 56], [72, 61], [84, 58], [96, 64], [108, 60],
    [120, 66], [132, 63], [144, 70], [156, 68], [168, 74],
    [180, 71], [192, 76], [204, 73], [216, 80], [228, 78],
    [240, 84],
  ] as const

  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const areaPath = `${linePath} L240,95 L0,95 Z`
  const lastPoint = chartPoints[chartPoints.length - 1]

  return (
    <div className="preview-pokemon">
      <style>{`
        .preview-pokemon {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          color: var(--landing-text);
          overflow: hidden;
          border-radius: 6px;
          position: relative;
          background: var(--landing-bg-card);
        }

        /* ── Top Bar ── */
        .preview-pokemon__topbar {
          display: flex;
          align-items: center;
          padding: 5px 8px;
          border-bottom: 1px solid var(--landing-border);
          gap: 8px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .preview-pokemon__logo {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .preview-pokemon__logo-icon {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          background: var(--landing-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .preview-pokemon__logo-text {
          font-size: 7px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--landing-text);
          white-space: nowrap;
        }

        .preview-pokemon__ticker {
          flex: 1;
          overflow: hidden;
          position: relative;
          height: 12px;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .preview-pokemon__ticker-track {
          display: flex;
          gap: 12px;
          align-items: center;
          white-space: nowrap;
          animation: preview-pokemon-scroll 18s linear infinite;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        @keyframes preview-pokemon-scroll {
          0% { transform: translateY(-50%) translateX(0); }
          100% { transform: translateY(-50%) translateX(-50%); }
        }

        .preview-pokemon__ticker-item {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 5.5px;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          color: var(--landing-text-muted);
        }

        .preview-pokemon__ticker-arrow {
          font-size: 6px;
          line-height: 1;
        }

        .preview-pokemon__ticker-arrow--up { color: #4ADE80; }
        .preview-pokemon__ticker-arrow--down { color: #F87171; }

        /* ── Body ── */
        .preview-pokemon__body {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Chart Section ── */
        .preview-pokemon__chart-section {
          flex: 6;
          display: flex;
          flex-direction: column;
          padding: 6px 8px 4px 8px;
          min-width: 0;
          overflow: hidden;
        }

        .preview-pokemon__chart-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .preview-pokemon__chart-title {
          font-size: 6.5px;
          font-weight: 600;
          color: var(--landing-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .preview-pokemon__chart-value {
          font-size: 8px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          color: var(--landing-text);
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .preview-pokemon__chart-change {
          font-size: 6px;
          font-weight: 600;
          color: #4ADE80;
        }

        .preview-pokemon__chart-wrap {
          flex: 1;
          position: relative;
          min-height: 0;
        }

        .preview-pokemon__chart-svg {
          width: 100%;
          height: 100%;
        }

        .preview-pokemon__chart-grid {
          stroke: var(--landing-border);
          stroke-width: 0.5;
          stroke-dasharray: 2 3;
        }

        .preview-pokemon__chart-axis-label {
          font-size: 5px;
          fill: var(--landing-text-dim);
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        }

        .preview-pokemon__chart-area {
          opacity: 0;
          animation: preview-pokemon-area-in 1s ease-out 1.2s forwards;
        }

        @keyframes preview-pokemon-area-in {
          to { opacity: 0.4; }
        }

        .preview-pokemon__chart-line {
          fill: none;
          stroke: var(--landing-accent);
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: preview-pokemon-line-draw 2s ease-out 0.3s forwards;
        }

        @keyframes preview-pokemon-line-draw {
          to { stroke-dashoffset: 0; }
        }

        .preview-pokemon__chart-dot {
          r: 2.5;
          fill: var(--landing-accent);
          opacity: 0;
          animation: preview-pokemon-dot-appear 0.3s ease-out 2.2s forwards;
        }

        @keyframes preview-pokemon-dot-appear {
          to { opacity: 1; }
        }

        .preview-pokemon__chart-dot-pulse {
          r: 2.5;
          fill: var(--landing-accent);
          opacity: 0;
          animation: preview-pokemon-dot-pulse 2s ease-in-out 2.4s infinite;
        }

        @keyframes preview-pokemon-dot-pulse {
          0% { opacity: 0.5; r: 2.5; }
          50% { opacity: 0; r: 6; }
          100% { opacity: 0; r: 6; }
        }

        /* ── Cards List Section ── */
        .preview-pokemon__cards-section {
          flex: 4;
          border-left: 1px solid var(--landing-border);
          padding: 6px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .preview-pokemon__cards-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .preview-pokemon__cards-title {
          font-size: 6.5px;
          font-weight: 700;
          color: var(--landing-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .preview-pokemon__live-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #4ADE80;
          animation: preview-pokemon-live 1.5s ease-in-out infinite;
        }

        @keyframes preview-pokemon-live {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .preview-pokemon__card-row {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 4px;
          border-radius: 3px;
          opacity: 0;
          transform: translateX(8px);
          animation: preview-pokemon-row-in 0.4s ease-out forwards;
          margin-bottom: 1px;
        }

        .preview-pokemon__card-row:nth-child(1) { animation-delay: 0.6s; }
        .preview-pokemon__card-row:nth-child(2) { animation-delay: 0.8s; }
        .preview-pokemon__card-row:nth-child(3) { animation-delay: 1.0s; }
        .preview-pokemon__card-row:nth-child(4) { animation-delay: 1.2s; }
        .preview-pokemon__card-row:nth-child(5) { animation-delay: 1.4s; }

        @keyframes preview-pokemon-row-in {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .preview-pokemon__card-row--hot {
          background: var(--landing-accent-bg);
          animation: preview-pokemon-row-in 0.4s ease-out 0.8s forwards,
                     preview-pokemon-hot-glow 2.5s ease-in-out 2s infinite;
        }

        @keyframes preview-pokemon-hot-glow {
          0%, 100% {
            box-shadow: none;
            background: var(--landing-accent-bg);
          }
          50% {
            box-shadow: 0 0 6px color-mix(in srgb, var(--landing-accent) 20%, transparent);
            background: color-mix(in srgb, var(--landing-accent) 18%, transparent);
          }
        }

        .preview-pokemon__card-thumb {
          width: 8px;
          height: 11px;
          border-radius: 1.5px;
          flex-shrink: 0;
        }

        .preview-pokemon__card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5px;
        }

        .preview-pokemon__card-name {
          font-size: 6px;
          font-weight: 600;
          color: var(--landing-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .preview-pokemon__card-row--hot .preview-pokemon__card-name {
          color: var(--landing-accent);
        }

        .preview-pokemon__card-set {
          font-size: 4.5px;
          color: var(--landing-text-dim);
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          letter-spacing: 0.3px;
        }

        .preview-pokemon__card-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5px;
          flex-shrink: 0;
        }

        .preview-pokemon__card-price-value {
          font-size: 6px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          color: var(--landing-text);
        }

        .preview-pokemon__card-price-change {
          font-size: 5px;
          font-weight: 600;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        }

        .preview-pokemon__card-price-change--up { color: #4ADE80; }
        .preview-pokemon__card-price-change--down { color: #F87171; }

        .preview-pokemon__hot-tag {
          font-size: 4px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: var(--landing-accent);
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .preview-pokemon__hot-tag::before {
          content: '🔥';
          font-size: 5px;
        }

        /* ── Bottom Sentiment Strip ── */
        .preview-pokemon__sentiment {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-top: 1px solid var(--landing-border);
          flex-shrink: 0;
        }

        .preview-pokemon__sentiment-label {
          font-size: 5px;
          font-weight: 600;
          color: var(--landing-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        }

        .preview-pokemon__sentiment-bar {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(to right, #F87171, #FBBF24, #4ADE80);
          position: relative;
          overflow: visible;
        }

        .preview-pokemon__sentiment-marker {
          position: absolute;
          top: 50%;
          left: 62%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          border: 1.5px solid #4ADE80;
          transform: translate(-50%, -50%);
          opacity: 0;
          animation: preview-pokemon-marker-in 0.5s ease-out 2.5s forwards;
          box-shadow: 0 0 4px rgba(74, 222, 128, 0.4);
        }

        @keyframes preview-pokemon-marker-in {
          0% { opacity: 0; left: 50%; }
          100% { opacity: 1; left: 62%; }
        }

        .preview-pokemon__sentiment-labels {
          display: flex;
          justify-content: space-between;
          flex-shrink: 0;
          gap: 0;
          width: 50px;
        }

        .preview-pokemon__sentiment-end {
          font-size: 4.5px;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          font-weight: 600;
        }

        .preview-pokemon__sentiment-end--bear { color: #F87171; }
        .preview-pokemon__sentiment-end--bull { color: #4ADE80; }
      `}</style>

      {/* Top Bar */}
      <div className="preview-pokemon__topbar">
        <div className="preview-pokemon__logo">
          <div className="preview-pokemon__logo-icon">TC</div>
          <span className="preview-pokemon__logo-text">TCG Market</span>
        </div>
        <div className="preview-pokemon__ticker">
          <div className="preview-pokemon__ticker-track">
            {tickerItems.concat(tickerItems).map((item, i) => (
              <span key={i} className="preview-pokemon__ticker-item">
                {item.name}
                <span className={`preview-pokemon__ticker-arrow preview-pokemon__ticker-arrow--${item.up ? 'up' : 'down'}`}>
                  {item.up ? '▲' : '▼'}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="preview-pokemon__body">
        {/* Chart Section */}
        <div className="preview-pokemon__chart-section">
          <div className="preview-pokemon__chart-header">
            <span className="preview-pokemon__chart-title">Market Index</span>
            <div className="preview-pokemon__chart-value">
              $184.2K
              <span className="preview-pokemon__chart-change">▲ 4.7%</span>
            </div>
          </div>
          <div className="preview-pokemon__chart-wrap">
            <svg className="preview-pokemon__chart-svg" viewBox="0 0 260 105" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pokemon-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line className="preview-pokemon__chart-grid" x1="0" y1="50" x2="260" y2="50" />
              <line className="preview-pokemon__chart-grid" x1="0" y1="70" x2="260" y2="70" />
              <line className="preview-pokemon__chart-grid" x1="0" y1="90" x2="260" y2="90" />

              {/* Y-axis labels */}
              <text className="preview-pokemon__chart-axis-label" x="2" y="53" textAnchor="start">$200</text>
              <text className="preview-pokemon__chart-axis-label" x="2" y="73" textAnchor="start">$150</text>
              <text className="preview-pokemon__chart-axis-label" x="2" y="93" textAnchor="start">$100</text>

              {/* X-axis labels */}
              <text className="preview-pokemon__chart-axis-label" x="24" y="103" textAnchor="middle">Jan</text>
              <text className="preview-pokemon__chart-axis-label" x="84" y="103" textAnchor="middle">Mar</text>
              <text className="preview-pokemon__chart-axis-label" x="144" y="103" textAnchor="middle">May</text>
              <text className="preview-pokemon__chart-axis-label" x="216" y="103" textAnchor="middle">Jul</text>

              {/* Area fill */}
              <path
                className="preview-pokemon__chart-area"
                d={areaPath}
                fill="url(#pokemon-chart-fill)"
              />

              {/* Line */}
              <path
                className="preview-pokemon__chart-line"
                d={linePath}
              />

              {/* End dot */}
              <circle
                className="preview-pokemon__chart-dot-pulse"
                cx={lastPoint[0]}
                cy={lastPoint[1]}
              />
              <circle
                className="preview-pokemon__chart-dot"
                cx={lastPoint[0]}
                cy={lastPoint[1]}
              />
            </svg>
          </div>
        </div>

        {/* Cards List */}
        <div className="preview-pokemon__cards-section">
          <div className="preview-pokemon__cards-header">
            <span className="preview-pokemon__cards-title">Trending Cards</span>
            <div className="preview-pokemon__live-dot" />
          </div>

          {cards.map((card) => (
            <div
              key={card.name}
              className={`preview-pokemon__card-row${card.hot ? ' preview-pokemon__card-row--hot' : ''}`}
            >
              <div
                className="preview-pokemon__card-thumb"
                style={{ background: card.color }}
              />
              <div className="preview-pokemon__card-info">
                <span className="preview-pokemon__card-name">
                  {card.name}
                  {card.hot && (
                    <>
                      {' '}
                      <span className="preview-pokemon__hot-tag">HOT</span>
                    </>
                  )}
                </span>
                <span className="preview-pokemon__card-set">{card.set}</span>
              </div>
              <div className="preview-pokemon__card-price">
                <span className="preview-pokemon__card-price-value">{card.price}</span>
                <span className={`preview-pokemon__card-price-change preview-pokemon__card-price-change--${card.up ? 'up' : 'down'}`}>
                  {card.up ? '↑' : '↓'} {card.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sentiment Strip */}
      <div className="preview-pokemon__sentiment">
        <span className="preview-pokemon__sentiment-label">Market Sentiment</span>
        <div className="preview-pokemon__sentiment-labels">
          <span className="preview-pokemon__sentiment-end preview-pokemon__sentiment-end--bear">BEAR</span>
          <span className="preview-pokemon__sentiment-end preview-pokemon__sentiment-end--bull">BULL</span>
        </div>
        <div className="preview-pokemon__sentiment-bar">
          <div className="preview-pokemon__sentiment-marker" />
        </div>
      </div>
    </div>
  )
}
