'use client'

export function FantasyFootballPreview() {
  const players = [
    { rank: 1, name: 'C. McCaffrey', pos: 'RB', value: '$68', highlight: false },
    { rank: 2, name: 'T. Hill', pos: 'WR', value: '$54', highlight: false },
    { rank: 3, name: 'J. Jefferson', pos: 'WR', value: '$52', highlight: true },
    { rank: 4, name: 'A. Ekeler', pos: 'RB', value: '$47', highlight: false },
    { rank: 5, name: 'K. Kelce', pos: 'TE', value: '$41', highlight: false },
    { rank: 6, name: 'J. Hurts', pos: 'QB', value: '$38', highlight: false },
  ]

  const myTeam = [
    { name: 'D. Henry', pos: 'RB' },
    { name: 'S. Diggs', pos: 'WR' },
    null,
    null,
  ]

  return (
    <div className="preview-ff">
      <style>{`
        .preview-ff {
          width: 100%;
          height: 100%;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          color: var(--landing-text);
          overflow: hidden;
          border-radius: 6px;
          position: relative;
        }

        /* ── Sidebar ── */
        .preview-ff__sidebar {
          width: 36px;
          min-width: 36px;
          background: color-mix(in srgb, var(--landing-bg-card) 80%, black 20%);
          border-right: 1px solid var(--landing-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 0;
          gap: 6px;
        }

        .preview-ff__logo {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: var(--landing-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }

        .preview-ff__logo-icon {
          font-size: 9px;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .preview-ff__nav-dot {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: var(--landing-border);
          transition: background 0.2s;
        }

        .preview-ff__nav-dot--active {
          background: var(--landing-accent-bg);
          border: 1px solid color-mix(in srgb, var(--landing-accent) 40%, transparent);
        }

        /* ── Main area ── */
        .preview-ff__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        /* ── Top bar ── */
        .preview-ff__topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          border-bottom: 1px solid var(--landing-border);
          gap: 6px;
          flex-shrink: 0;
        }

        .preview-ff__topbar-title {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--landing-text);
          white-space: nowrap;
        }

        .preview-ff__budget {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .preview-ff__budget-label {
          font-size: 6px;
          color: var(--landing-text-muted);
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          white-space: nowrap;
        }

        .preview-ff__budget-bar {
          width: 40px;
          height: 4px;
          background: var(--landing-border);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .preview-ff__budget-fill {
          height: 100%;
          background: var(--landing-accent);
          border-radius: 2px;
          width: 0%;
          animation: preview-ff-budget 2s ease-out 0.5s forwards;
        }

        @keyframes preview-ff-budget {
          to { width: 71%; }
        }

        /* ── Content ── */
        .preview-ff__content {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Table ── */
        .preview-ff__table-area {
          flex: 1;
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .preview-ff__table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .preview-ff__table-title {
          font-size: 6.5px;
          font-weight: 600;
          color: var(--landing-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .preview-ff__live-badge {
          font-size: 5px;
          color: var(--landing-accent);
          font-weight: 700;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .preview-ff__live-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--landing-accent);
          animation: preview-ff-live-pulse 1.5s ease-in-out infinite;
        }

        @keyframes preview-ff-live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .preview-ff__columns {
          display: grid;
          grid-template-columns: 18px 1fr 22px 28px;
          gap: 0 4px;
          padding: 2px 4px;
          margin-bottom: 2px;
        }

        .preview-ff__col-label {
          font-size: 5px;
          font-weight: 600;
          color: var(--landing-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .preview-ff__col-label--right {
          text-align: right;
        }

        .preview-ff__row {
          display: grid;
          grid-template-columns: 18px 1fr 22px 28px;
          gap: 0 4px;
          padding: 3px 4px;
          border-radius: 3px;
          opacity: 0;
          transform: translateY(4px);
          animation: preview-ff-row-in 0.4s ease-out forwards;
          align-items: center;
        }

        .preview-ff__row:nth-child(1) { animation-delay: 0.3s; }
        .preview-ff__row:nth-child(2) { animation-delay: 0.5s; }
        .preview-ff__row:nth-child(3) { animation-delay: 0.7s; }
        .preview-ff__row:nth-child(4) { animation-delay: 0.9s; }
        .preview-ff__row:nth-child(5) { animation-delay: 1.1s; }
        .preview-ff__row:nth-child(6) { animation-delay: 1.3s; }

        @keyframes preview-ff-row-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .preview-ff__row--highlight {
          background: var(--landing-accent-bg);
          animation: preview-ff-row-in 0.4s ease-out 0.7s forwards,
                     preview-ff-glow 2.5s ease-in-out 1.5s infinite;
        }

        @keyframes preview-ff-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 transparent;
            background: var(--landing-accent-bg);
          }
          50% {
            box-shadow: 0 0 6px color-mix(in srgb, var(--landing-accent) 20%, transparent);
            background: color-mix(in srgb, var(--landing-accent) 18%, transparent);
          }
        }

        .preview-ff__cell {
          font-size: 6.5px;
          color: var(--landing-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .preview-ff__cell--rank {
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 6px;
          color: var(--landing-text-muted);
          font-weight: 600;
        }

        .preview-ff__cell--name {
          font-weight: 600;
          font-size: 6.5px;
        }

        .preview-ff__cell--pos {
          font-size: 5.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
          text-align: center;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1.3;
        }

        .preview-ff__cell--pos-rb { background: color-mix(in srgb, #3B82F6 20%, transparent); color: #60A5FA; }
        .preview-ff__cell--pos-wr { background: color-mix(in srgb, #10B981 20%, transparent); color: #34D399; }
        .preview-ff__cell--pos-te { background: color-mix(in srgb, #F59E0B 20%, transparent); color: #FBBF24; }
        .preview-ff__cell--pos-qb { background: color-mix(in srgb, #EF4444 20%, transparent); color: #F87171; }

        .preview-ff__cell--value {
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 6.5px;
          font-weight: 600;
          text-align: right;
          color: var(--landing-accent);
        }

        .preview-ff__row--highlight .preview-ff__cell--name {
          color: var(--landing-accent);
        }

        /* ── Right panel ── */
        .preview-ff__panel {
          width: 72px;
          min-width: 72px;
          border-left: 1px solid var(--landing-border);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow: hidden;
        }

        .preview-ff__panel-title {
          font-size: 6px;
          font-weight: 700;
          color: var(--landing-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .preview-ff__team-slot {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 2px 3px;
          border-radius: 2px;
          background: color-mix(in srgb, var(--landing-border) 50%, transparent);
        }

        .preview-ff__team-slot--empty {
          border: 1px dashed var(--landing-text-dim);
          background: transparent;
          min-height: 12px;
        }

        .preview-ff__team-pos {
          font-size: 5px;
          font-weight: 700;
          color: var(--landing-text-dim);
          width: 14px;
          flex-shrink: 0;
        }

        .preview-ff__team-name {
          font-size: 5.5px;
          font-weight: 600;
          color: var(--landing-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Ring chart ── */
        .preview-ff__ring-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          margin-top: auto;
        }

        .preview-ff__ring-label {
          font-size: 5px;
          color: var(--landing-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .preview-ff__ring-wrap {
          position: relative;
          width: 32px;
          height: 32px;
        }

        .preview-ff__ring-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .preview-ff__ring-bg {
          fill: none;
          stroke: var(--landing-border);
          stroke-width: 3;
        }

        .preview-ff__ring-fill {
          fill: none;
          stroke: var(--landing-accent);
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 75.4;
          stroke-dashoffset: 75.4;
          animation: preview-ff-ring 1.8s ease-out 1s forwards;
        }

        @keyframes preview-ff-ring {
          to { stroke-dashoffset: 56.55; }
        }

        .preview-ff__ring-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          color: var(--landing-text);
        }

        /* ── Best Value tag ── */
        .preview-ff__best-tag {
          font-size: 4.5px;
          font-weight: 700;
          color: var(--landing-accent);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .preview-ff__best-tag::before {
          content: '★';
          font-size: 5px;
        }

        /* ── Stat chips in topbar ── */
        .preview-ff__stat-chips {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .preview-ff__stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        .preview-ff__stat-value {
          font-size: 7px;
          font-weight: 700;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          color: var(--landing-text);
        }

        .preview-ff__stat-label {
          font-size: 4.5px;
          color: var(--landing-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }
      `}</style>

      {/* Sidebar */}
      <div className="preview-ff__sidebar">
        <div className="preview-ff__logo">
          <span className="preview-ff__logo-icon">FF</span>
        </div>
        <div className="preview-ff__nav-dot preview-ff__nav-dot--active" />
        <div className="preview-ff__nav-dot" />
        <div className="preview-ff__nav-dot" />
        <div className="preview-ff__nav-dot" />
      </div>

      {/* Main */}
      <div className="preview-ff__main">
        {/* Top bar */}
        <div className="preview-ff__topbar">
          <div className="preview-ff__topbar-title">Draft Room</div>
          <div className="preview-ff__stat-chips">
            <div className="preview-ff__stat-chip">
              <span className="preview-ff__stat-value">Rd 4</span>
              <span className="preview-ff__stat-label">Round</span>
            </div>
          </div>
          <div className="preview-ff__budget">
            <span className="preview-ff__budget-label">$142 / $200</span>
            <div className="preview-ff__budget-bar">
              <div className="preview-ff__budget-fill" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="preview-ff__content">
          {/* Table area */}
          <div className="preview-ff__table-area">
            <div className="preview-ff__table-header">
              <span className="preview-ff__table-title">Player Rankings</span>
              <span className="preview-ff__live-badge">
                <span className="preview-ff__live-dot" />
                LIVE
              </span>
            </div>

            <div className="preview-ff__columns">
              <span className="preview-ff__col-label">#</span>
              <span className="preview-ff__col-label">Player</span>
              <span className="preview-ff__col-label">Pos</span>
              <span className="preview-ff__col-label preview-ff__col-label--right">Value</span>
            </div>

            {players.map((p) => (
              <div
                key={p.rank}
                className={`preview-ff__row${p.highlight ? ' preview-ff__row--highlight' : ''}`}
              >
                <span className="preview-ff__cell preview-ff__cell--rank">{p.rank}</span>
                <span className="preview-ff__cell preview-ff__cell--name">
                  {p.name}
                  {p.highlight && (
                    <>
                      {' '}
                      <span className="preview-ff__best-tag">Best Value</span>
                    </>
                  )}
                </span>
                <span
                  className={`preview-ff__cell preview-ff__cell--pos preview-ff__cell--pos-${p.pos.toLowerCase()}`}
                >
                  {p.pos}
                </span>
                <span className="preview-ff__cell preview-ff__cell--value">{p.value}</span>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="preview-ff__panel">
            <span className="preview-ff__panel-title">My Team</span>

            {myTeam.map((slot, i) =>
              slot ? (
                <div key={i} className="preview-ff__team-slot">
                  <span className="preview-ff__team-pos">{slot.pos}</span>
                  <span className="preview-ff__team-name">{slot.name}</span>
                </div>
              ) : (
                <div key={i} className="preview-ff__team-slot preview-ff__team-slot--empty">
                  <span className="preview-ff__team-pos">{i === 2 ? 'WR' : 'FL'}</span>
                </div>
              ),
            )}

            {/* Ring chart */}
            <div className="preview-ff__ring-section">
              <span className="preview-ff__ring-label">Roster</span>
              <div className="preview-ff__ring-wrap">
                <svg className="preview-ff__ring-svg" viewBox="0 0 32 32">
                  <circle className="preview-ff__ring-bg" cx="16" cy="16" r="12" />
                  <circle className="preview-ff__ring-fill" cx="16" cy="16" r="12" />
                </svg>
                <div className="preview-ff__ring-text">2/8</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
