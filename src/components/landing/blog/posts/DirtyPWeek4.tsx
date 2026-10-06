'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import './dirtyp-week4.css'

const MINE = 'Rb1'

/* ------------------------------------------------------------------ data --- */

interface TeamAllPlay {
  t: string
  rec: string
  win: number
  apw: number
  apl: number
  ap: number
}

// Win% vs all-play%. Gap = ap - win; negative means the record flatters the team.
const ALL_PLAY: TeamAllPlay[] = [
  { t: 'What r u doing step-substation?', rec: '3-1', win: 75, apw: 13, apl: 23, ap: 36.1 },
  { t: 'Skatteboys', rec: '3-1', win: 75, apw: 24, apl: 12, ap: 66.7 },
  { t: 'The Disturbance Regime', rec: '1-3', win: 25, apw: 8, apl: 28, ap: 22.2 },
  { t: 'Rb1', rec: '1-3', win: 25, apw: 9, apl: 27, ap: 25 },
  { t: 'The Question Master', rec: '1-3', win: 25, apw: 9, apl: 27, ap: 25 },
  { t: 'Tanjiro Kamado', rec: '2-2', win: 50, apw: 19, apl: 17, ap: 52.8 },
  { t: 'Austin Clout Demons', rec: '3-1', win: 75, apw: 29, apl: 7, ap: 80.6 },
  { t: 'JahJonJacory Jameson', rec: '2-2', win: 50, apw: 20, apl: 16, ap: 55.6 },
  { t: 'THE San Diego Football Team', rec: '3-1', win: 75, apw: 30, apl: 6, ap: 83.3 },
  { t: 'My Njigba Hurts', rec: '1-3', win: 25, apw: 19, apl: 17, ap: 52.8 },
]

interface BenchRow {
  t: string
  act: number
  opt: number
  eff: number
}

const BENCH: BenchRow[] = [
  { t: 'Rb1', act: 94.48, opt: 133.98, eff: 70.5 },
  { t: 'THE San Diego Football Team', act: 97.12, opt: 126.12, eff: 77 },
  { t: 'JahJonJacory Jameson', act: 87.9, opt: 116.2, eff: 75.6 },
  { t: 'What r u doing step-substation?', act: 82.54, opt: 110.04, eff: 75 },
  { t: 'Austin Clout Demons', act: 94.82, opt: 117.76, eff: 80.5 },
  { t: 'The Question Master', act: 96.92, opt: 117.72, eff: 82.3 },
  { t: 'Tanjiro Kamado', act: 143.56, opt: 158.06, eff: 90.8 },
  { t: 'Skatteboys', act: 156.18, opt: 163.88, eff: 95.3 },
  { t: 'The Disturbance Regime', act: 104.18, opt: 110.38, eff: 94.4 },
  { t: 'My Njigba Hurts', act: 102.72, opt: 102.72, eff: 100 },
]

interface RankRow {
  t: string
  standings: number
  rec: string
  ap: string
  apn: number
  idx: number
  fwd: number
  lineup: number
  bye: number
  sched: number
  twice: string
  wk: number[]
  txt: string
}

const RANKS: RankRow[] = [
  {
    t: 'Austin Clout Demons', standings: 1, rec: '3-1', ap: '29-7 · 80.6%', apn: 80.6,
    idx: 70.1, fwd: 149.1, lineup: 152.6, bye: -4.28, sched: 0.75,
    twice: 'The Disturbance Regime', wk: [170.8, 131.5, 137.6, 94.82],
    txt: 'Where they belong, and the correction that put them here matters. Austin has the most productive startable lineup in the league at 152.6 points per week, the best points-for total, and a 29-7 all-play record. Josh Allen is the single most valuable asset in fantasy right now — QB1, 305 projected points the rest of the way. Jeremiyah Love’s snap share being managed down to 46% is a genuine concern and Rice’s hamstring is worse, but the bench absorbs it: DK Metcalf, Jordan Addison and Bryce Young are all sitting. They get The Disturbance Regime twice, the softest double in the league.',
  },
  {
    t: 'THE San Diego Football Team', standings: 2, rec: '3-1', ap: '30-6 · 83.3%', apn: 83.3,
    idx: 66.3, fwd: 146.2, lineup: 151.1, bye: -3.92, sched: -0.95,
    twice: 'JahJonJacory Jameson', wk: [142.2, 131.2, 144.18, 97.12],
    txt: 'The best all-play record in the league at 83.3% — they would beat 30 of 36 opponents on a neutral schedule. Bijan Robinson is consensus RB2 and just went 145 and two scores on Monday night; Amon-Ra St. Brown is WR3, Zay Flowers WR7. What keeps them second is the schedule: the second-hardest run remaining at −0.95 points per week, because they drew JahJonJacory Jameson — the fourth-ranked roster here — twice. Kelce’s bye bites in Week 5.',
  },
  {
    t: 'Skatteboys', standings: 3, rec: '3-1', ap: '24-12 · 66.7%', apn: 66.7,
    idx: 64.8, fwd: 147.9, lineup: 150.6, bye: -3.09, sched: 0.34,
    twice: 'What r u doing step-substation?', wk: [89.8, 122.6, 103.64, 156.18],
    txt: 'Second-best forward value in the league (147.9) and the lowest bye exposure of any contender — only 3.09 points per week lost, because their stars are spread across bye weeks rather than bunched. Brock Bowers is the consensus TE1, CeeDee Lamb WR5, McMillan WR14 and rising fast after 38.2. Third rather than first only because all-play says 66.7% while the two above them are over 80. They also drew step-substation twice, which is the most favourable double any contender got.',
  },
  {
    t: 'JahJonJacory Jameson', standings: 6, rec: '2-2', ap: '20-16 · 55.6%', apn: 55.6,
    idx: 61.1, fwd: 147.2, lineup: 151.8, bye: -3.51, sched: -1.04,
    twice: 'THE San Diego Football Team', wk: [113.2, 117.7, 118.44, 87.9],
    txt: 'The most underrated team in the league and the only one that climbs two slots. Their startable lineup is worth 151.8 points per week — third-best, within a point of San Diego’s — because Jahmyr Gibbs is the consensus RB1, Jonathan Taylor RB4 and Mahomes QB5. A single catastrophic week (87.9, a league-worst 27.8-point miss) is doing all the work in that 2-2 record. They also have the hardest remaining schedule in the league at −1.04, drawing San Diego twice. Dalton Kincaid is the one real hole: 2.8 and 1.2 with Mark Andrews behind him. Buy this team.',
  },
  {
    t: 'Tanjiro Kamado', standings: 5, rec: '2-2', ap: '19-17 · 52.8%', apn: 52.8,
    idx: 56.9, fwd: 145, lineup: 147.8, bye: -4.06, sched: 1.17,
    twice: 'The Question Master', wk: [110.6, 104.8, 81.86, 143.56],
    txt: 'The easiest remaining schedule in the league by a clear margin — +1.17 points per week, and they get The Question Master, the league’s weakest roster, twice. That is the gift that keeps them fifth, because the roster itself is top-heavy: Chase WR2, Nacua WR4 and Walker RB3 sit above exactly one tight end (Juwan Johnson, TE11) and nothing at running back after Walker, which forces Alvin Kamara at RB38 into a starting slot. Highest bye cost of any contender at −4.06, starting with Walker in Week 5. Four of the league’s six trades bought stars, not depth.',
  },
  {
    t: 'My Njigba Hurts', standings: 7, rec: '1-3', ap: '19-17 · 52.8%', apn: 52.8,
    idx: 45.3, fwd: 137.4, lineup: 139.7, bye: -3.08, sched: 0.8,
    twice: 'Rb1', wk: [97.6, 92.8, 107.38, 102.72],
    txt: 'The best-managed 1-3 team you will ever see, and the formula still can’t lift them past sixth, because the roster is genuinely thin — 139.7 points per week, eighth. Jaxon Smith-Njigba is the consensus WR1; A.J. Brown has fallen all the way to WR23. A perfect lineup in Week 4, 96.7% efficiency across two weeks, two roster moves all season, 480.24 points conceded, expected wins 2.11, actual wins 1. They are extracting everything available from a middling roster and getting nothing for it.',
  },
  {
    t: 'What r u doing step-substation?', standings: 4, rec: '3-1', ap: '13-23 · 36.1%', apn: 36.1,
    idx: 38.1, fwd: 135.4, lineup: 138.2, bye: -2.13, sched: -0.66,
    twice: 'Skatteboys', wk: [120.5, 100.3, 87.2, 82.54],
    txt: 'Still the story of the season, and it survives the formula change intact: 3-1 and ranked seventh. 36.1% all-play puts them below three 1-3 teams, and their startable lineup is worth 138.2 points per week, seventh. They have the league’s lowest bye exposure at −2.13, which sounds like an advantage and is actually a diagnosis — losing their starters costs less than anyone else’s. The schedule stops carrying them now: they drew Skatteboys twice, in Week 5 and again in Week 14.',
  },
  {
    t: 'Rb1', standings: 8, rec: '1-3', ap: '9-27 · 25.0%', apn: 25,
    idx: 34.4, fwd: 134.8, lineup: 137.1, bye: -2.88, sched: 0.64,
    twice: 'My Njigba Hurts', wk: [85.2, 84.7, 93.58, 94.48],
    txt: 'Lowest point total in the league and the flattest team in it — 85.2, 84.7, 93.6, 94.5, never once past 95. Ninth in forward value. There is real receiver equity here (Nico Collins WR9, Drake London WR8, George Pickens WR12) sitting on top of nothing at all: Breece Hall is week-to-week and both halves of the Miami backfield split are on the same roster. Twenty roster moves produced the league’s worst Week 4 efficiency. Jayden Daniels returning is the one genuine lever, and a soft schedule with My Njigba Hurts twice is the one piece of luck.',
  },
  {
    t: 'The Disturbance Regime', standings: 9, rec: '1-3', ap: '8-28 · 22.2%', apn: 22.2,
    idx: 31.8, fwd: 133.5, lineup: 139, bye: -4.68, sched: -0.81,
    twice: 'Austin Clout Demons', wk: [76.5, 73.7, 73.52, 104.18],
    txt: 'Last in all-play at 22.2% and saddled with the worst bye exposure in the league — 4.68 points per week, worse than any contender, with Weeks 6 and 11 both gutting the lineup. They also drew Austin twice. The encouraging part: their raw lineup is worth 139.0 per week, better than four teams above them, and they broke 100 for the first time all year in Week 4 without Justin Jefferson, who is still the consensus WR10 and is expected back. Kyler Murray missing projection every single week is the actual problem.',
  },
  {
    t: 'The Question Master', standings: 10, rec: '1-3', ap: '9-27 · 25.0%', apn: 25,
    idx: 31.3, fwd: 132.8, lineup: 135.9, bye: -2.94, sched: -0.24,
    twice: 'Tanjiro Kamado', wk: [77.5, 55.5, 96.88, 96.92],
    txt: 'The least valuable roster in the league at 132.8 points per week, and the schedule offers no relief — they get Tanjiro Kamado, the superteam, twice. Burrow is QB7 and has been excellent at 22.6 and 23.7, and beating the top points-for team while losing Barkley and DJ Moore to injuries before halftime was a genuinely good win. But Barkley has fallen to RB15 and misses Week 5, and the four-for-four they appeared to win on paper sent Puka Nacua the other way. Last, and not unluckily so.',
  },
]

/* --------------------------------------------------------------- helpers --- */

const LO = 20
const HI = 90
const pos = (v: number) => ((v - LO) / (HI - LO)) * 100
const sgn = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}`

function Sparkline({ values }: { values: number[] }) {
  const W = 92
  const H = 30
  const P = 3
  const lo = 55
  const hi = 175
  const pts = values.map((v, i) => {
    const x = P + (i / (values.length - 1)) * (W - P * 2)
    const y = H - P - ((v - lo) / (hi - lo)) * (H - P * 2)
    return [x, y] as const
  })
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path
        d={d}
        fill="none"
        stroke="var(--dp-muted)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last[0].toFixed(1)}
        cy={last[1].toFixed(1)}
        r="3.2"
        fill="var(--dp-amber)"
        stroke="var(--dp-surface)"
        strokeWidth="2"
      />
    </svg>
  )
}

interface TipState {
  x: number
  y: number
  title: string
  lines: string[]
}

function useTooltip() {
  const [tip, setTip] = useState<TipState | null>(null)
  const show = (e: MouseEvent, title: string, lines: string[]) =>
    setTip({ x: e.clientX, y: e.clientY, title, lines })
  const hide = () => setTip(null)
  const node = tip ? (
    <div
      className="dirtyp-tip"
      role="status"
      style={{
        left: Math.min(tip.x + 14, typeof window === 'undefined' ? tip.x : window.innerWidth - 250),
        top: tip.y + 14,
      }}
    >
      <b>{tip.title}</b>
      {tip.lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  ) : null
  return { show, hide, node }
}

/* ---------------------------------------------------------------- charts --- */

function FraudGap() {
  const { show, hide, node } = useTooltip()
  const sorted = [...ALL_PLAY].sort((a, b) => a.ap - a.win - (b.ap - b.win))
  const byAp = [...ALL_PLAY].sort((a, b) => b.ap - a.ap)

  return (
    <figure className="dirtyp-fig">
      <div className="dirtyp-fig-head dirtyp-col">
        <div className="dirtyp-fig-title">Record vs. Reality</div>
        <div className="dirtyp-fig-sub">
          Winning percentage against all-play percentage, through Week 4. All-play = 36 games
          per team.
        </div>
      </div>
      <div className="dirtyp-legend dirtyp-col">
        <span>
          <i className="dirtyp-dot dirtyp-dot-a" /> Record (win %)
        </span>
        <span>
          <i className="dirtyp-dot dirtyp-dot-s" /> All-play %
        </span>
      </div>
      <div className="dirtyp-db">
        {sorted.map((d) => {
          const gap = d.ap - d.win
          const pw = pos(d.win)
          const pa = pos(d.ap)
          const conn =
            gap < -0.05 ? 'var(--dp-amber)' : gap > 0.05 ? 'var(--dp-steel)' : 'var(--dp-rule)'
          return (
            <div
              key={d.t}
              className="dirtyp-db-row"
              tabIndex={0}
              onMouseMove={(e) =>
                show(e, d.t, [
                  `Record ${d.rec} (${d.win.toFixed(1)}%)`,
                  `All-play ${d.apw}-${d.apl} (${d.ap.toFixed(1)}%)`,
                  `Gap ${sgn(gap)} pts`,
                ])
              }
              onMouseLeave={hide}
              onBlur={hide}
            >
              <div className={`dirtyp-team${d.t === MINE ? ' dirtyp-me' : ''}`}>{d.t}</div>
              <div className="dirtyp-track">
                <div
                  className="dirtyp-conn"
                  style={{
                    left: `${Math.min(pw, pa)}%`,
                    width: `${Math.abs(pa - pw)}%`,
                    background: conn,
                  }}
                />
                <div className="dirtyp-pt dirtyp-pt-s" style={{ left: `${pa}%` }} />
                <div className="dirtyp-pt dirtyp-pt-a" style={{ left: `${pw}%` }} />
              </div>
              <div
                className={`dirtyp-gap${
                  gap < -0.05 ? ' dirtyp-gap-neg' : gap > 0.05 ? ' dirtyp-gap-pos' : ''
                }`}
              >
                {sgn(gap)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="dirtyp-axis">
        <div />
        <div className="dirtyp-axis-inner">
          {[20, 40, 60, 80].map((v) => (
            <div key={v} className="dirtyp-tick" style={{ left: `${pos(v)}%` }}>
              {v}%
            </div>
          ))}
        </div>
        <div />
      </div>
      <details className="dirtyp-col">
        <summary>View as table</summary>
        <div className="dirtyp-tscroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th className="dirtyp-n">Record</th>
                <th className="dirtyp-n">Win %</th>
                <th className="dirtyp-n">All-play</th>
                <th className="dirtyp-n">All-play %</th>
                <th className="dirtyp-n">Gap</th>
              </tr>
            </thead>
            <tbody>
              {byAp.map((d) => {
                const gap = d.ap - d.win
                return (
                  <tr key={d.t} className={d.t === MINE ? 'dirtyp-tr-mine' : undefined}>
                    <td className="dirtyp-td-team">{d.t}</td>
                    <td className="dirtyp-n">{d.rec}</td>
                    <td className="dirtyp-n">{d.win.toFixed(1)}</td>
                    <td className="dirtyp-n">{`${d.apw}-${d.apl}`}</td>
                    <td className="dirtyp-n">{d.ap.toFixed(1)}</td>
                    <td
                      className={`dirtyp-n ${
                        gap < -0.05 ? 'dirtyp-cold' : gap > 0.05 ? 'dirtyp-hot' : ''
                      }`}
                    >
                      {sgn(gap)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </details>
      {node}
    </figure>
  )
}

function BenchReport() {
  const { show, hide, node } = useTooltip()
  const MAX = 40
  return (
    <figure className="dirtyp-fig">
      <div className="dirtyp-fig-head dirtyp-col">
        <div className="dirtyp-fig-title">Points left on the bench — Week 4</div>
        <div className="dirtyp-fig-sub">
          Optimal lineup minus actual lineup. My Njigba Hurts left nothing, the only perfect
          lineup of the season.
        </div>
      </div>
      <div className="dirtyp-bars">
        {BENCH.map((d) => {
          const left = d.opt - d.act
          const zero = left < 0.05
          return (
            <div
              key={d.t}
              className="dirtyp-bar-row"
              onMouseMove={(e) =>
                show(e, d.t, [
                  `Started ${d.act.toFixed(2)}`,
                  `Optimal ${d.opt.toFixed(2)}`,
                  `Left ${left.toFixed(1)} · ${d.eff.toFixed(1)}% eff`,
                ])
              }
              onMouseLeave={hide}
            >
              <div className={`dirtyp-team${d.t === MINE ? ' dirtyp-me' : ''}`}>{d.t}</div>
              <div className="dirtyp-bar-track">
                <div
                  className={`dirtyp-bar-fill${zero ? ' dirtyp-bar-fill-zero' : ''}`}
                  style={{ width: `${Math.max((left / MAX) * 100, zero ? 0.6 : 1)}%` }}
                />
              </div>
              <div className="dirtyp-bar-val">{left.toFixed(1)}</div>
            </div>
          )
        })}
      </div>
      <details className="dirtyp-col">
        <summary>View as table</summary>
        <div className="dirtyp-tscroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th className="dirtyp-n">Started</th>
                <th className="dirtyp-n">Optimal</th>
                <th className="dirtyp-n">Left</th>
                <th className="dirtyp-n">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {BENCH.map((d) => (
                <tr key={d.t} className={d.t === MINE ? 'dirtyp-tr-mine' : undefined}>
                  <td className="dirtyp-td-team">{d.t}</td>
                  <td className="dirtyp-n">{d.act.toFixed(2)}</td>
                  <td className="dirtyp-n">{d.opt.toFixed(2)}</td>
                  <td className="dirtyp-n">{(d.opt - d.act).toFixed(1)}</td>
                  <td className="dirtyp-n">{d.eff.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {node}
    </figure>
  )
}

function PowerRankings() {
  return (
    <>
      <details className="dirtyp-col">
        <summary>Component breakdown — all ten teams</summary>
        <div className="dirtyp-tscroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th className="dirtyp-n">Index</th>
                <th className="dirtyp-n">Fwd value</th>
                <th className="dirtyp-n">Lineup</th>
                <th className="dirtyp-n">Byes</th>
                <th className="dirtyp-n">Schedule</th>
                <th className="dirtyp-n">All-play%</th>
                <th>Plays twice</th>
              </tr>
            </thead>
            <tbody>
              {RANKS.map((d) => (
                <tr key={d.t} className={d.t === MINE ? 'dirtyp-tr-mine' : undefined}>
                  <td className="dirtyp-td-team">{d.t}</td>
                  <td className="dirtyp-n">
                    <b>{d.idx.toFixed(1)}</b>
                  </td>
                  <td className="dirtyp-n">{d.fwd.toFixed(1)}</td>
                  <td className="dirtyp-n">{d.lineup.toFixed(1)}</td>
                  <td className="dirtyp-n dirtyp-cold">{d.bye.toFixed(2)}</td>
                  <td className={`dirtyp-n ${d.sched > 0 ? 'dirtyp-hot' : 'dirtyp-cold'}`}>
                    {sgn(d.sched)}
                  </td>
                  <td className="dirtyp-n">{d.apn.toFixed(1)}</td>
                  <td style={{ fontSize: '.84rem' }}>{d.twice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dirtyp-table-note">
          Lineup, byes, schedule and forward value are all points per week. Each team plays ten
          games against nine opponents, so exactly one opponent gets played twice — which is
          where almost all remaining-schedule variation comes from. Opponent strength is
          measured against a neutral baseline (the mean of the other nine teams), because never
          having to play yourself otherwise hands good teams a fake-easy schedule.
        </p>
      </details>

      <div className="dirtyp-rks">
        {RANKS.map((d, i) => {
          const rank = i + 1
          const mv = d.standings - rank
          const label = mv === 0 ? '— holds' : `${mv > 0 ? '▲ ' + mv : '▼ ' + Math.abs(mv)} vs standings`
          const cls = mv === 0 ? 'dirtyp-mv-even' : mv > 0 ? 'dirtyp-mv-up' : 'dirtyp-mv-dn'
          return (
            <article className="dirtyp-rk" key={d.t}>
              <div className="dirtyp-rk-pos">
                <div className="dirtyp-rk-n">{rank}</div>
                <div className={`dirtyp-rk-mv ${cls}`}>{label}</div>
              </div>
              <div className="dirtyp-rk-main">
                <div className={`dirtyp-rk-name${d.t === MINE ? ' dirtyp-me' : ''}`}>{d.t}</div>
                <div className="dirtyp-rk-line">
                  {`${d.rec} · ${d.ap} · fwd ${d.fwd.toFixed(1)} pts/wk`}
                </div>
                <p className="dirtyp-rk-txt">{d.txt}</p>
              </div>
              <div className="dirtyp-rk-side">
                <div className="dirtyp-rk-idx">{d.idx.toFixed(1)}</div>
                <div className="dirtyp-rk-idx-lab">Index</div>
                <Sparkline values={d.wk} />
                <div className="dirtyp-rk-spark-lab">
                  {d.wk.map((v) => v.toFixed(0)).join(' · ')}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

/* -------------------------------------------------------------- capsules --- */

interface CapsuleProps {
  home: string
  homePts: number
  away: string
  awayPts: number
  tag: string
  cool?: boolean
  children: ReactNode
}

function Capsule({ home, homePts, away, awayPts, tag, cool, children }: CapsuleProps) {
  const homeWon = homePts > awayPts
  const side = (name: string, pts: number, won: boolean, awaySide: boolean) => (
    <div className={`dirtyp-cap-side${awaySide ? ' dirtyp-cap-side-away' : ''}`}>
      <div
        className={`dirtyp-cap-team${won ? ' dirtyp-cap-win' : ''}${
          name === MINE ? ' dirtyp-me' : ''
        }`}
      >
        {name}
      </div>
      <div className={`dirtyp-cap-pts${won ? '' : ' dirtyp-cap-lose'}`}>{pts.toFixed(2)}</div>
    </div>
  )
  return (
    <article className="dirtyp-cap">
      <div className="dirtyp-cap-score">
        {side(home, homePts, homeWon, false)}
        <div className="dirtyp-cap-v">vs</div>
        {side(away, awayPts, !homeWon, true)}
      </div>
      <div className="dirtyp-cap-body">
        <span className={`dirtyp-tag${cool ? ' dirtyp-tag-cool' : ''}`}>{tag}</span>
        {children}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ page --- */

export function DirtyPWeek4() {
  return (
    <div className="dirtyp-w4">
      <div className="dirtyp-wrap">
        <header className="dirtyp-mast">
          <div className="dirtyp-mast-name">The Dirty P Beat</div>
          <div className="dirtyp-mast-meta">Week 4 · 2026 · Filed Oct 6</div>
        </header>

        <div className="dirtyp-hero">
          <h1>
            The Standings
            <br />
            Are <span className="dirtyp-lie">Lying</span> To You
          </h1>
          <p className="dirtyp-deck">
            Four weeks in, this league&rsquo;s record column has almost nothing to do with how
            good its teams are. The 4-seed is a fraud. The best-managed roster in the league is
            1-3.
          </p>
          <div className="dirtyp-byline">
            Week 4 Recap &amp; Power Rankings · 10-Team ESPN · No K, No D/ST
          </div>
        </div>

        {/* ---- lede ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-col">
            <p className="dirtyp-lede">
              Week 4 was not a bad week of football. That is the first thing to get straight,
              because it felt like one. The Dirty P put up 106.04 points per team — the
              second-highest average of the season, a hair above the 105.08 we&rsquo;ve run all
              year. Nobody bottomed out; the lowest score of the week was 82.54, the highest
              floor any week has produced. The biggest score since opening Sunday happened on
              Sunday.
            </p>
            <p>
              And yet six of ten managers finished under projection, the two best teams in the
              league posted their worst games of the year, and the team with the most points
              scored lost to the team with the fewest. Week 4 didn&rsquo;t lower the league. It
              rearranged it.
            </p>
            <p>
              What it exposed is something that has been true for a while and is now impossible
              to ignore: four weeks of results have produced a standings table that is, in at
              least two places, simply wrong.
            </p>
          </div>

          <div className="dirtyp-strip">
            <div className="dirtyp-stat">
              <div className="dirtyp-stat-v">106.04</div>
              <div className="dirtyp-stat-l">Week 4 avg — 2nd highest of season</div>
            </div>
            <div className="dirtyp-stat">
              <div className="dirtyp-stat-v dirtyp-stat-s">156.18</div>
              <div className="dirtyp-stat-l">Skatteboys — best score since Week 1</div>
            </div>
            <div className="dirtyp-stat">
              <div className="dirtyp-stat-v dirtyp-stat-a">6 of 10</div>
              <div className="dirtyp-stat-l">Teams under projection</div>
            </div>
            <div className="dirtyp-stat">
              <div className="dirtyp-stat-v dirtyp-stat-a">196.4</div>
              <div className="dirtyp-stat-l">Points left on benches</div>
            </div>
          </div>
        </section>

        {/* ---- the fraud gap ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">The Thesis</div>
            <h2>The Fraud Gap</h2>
          </div>
          <div className="dirtyp-col">
            <p>
              Head-to-head records in a ten-team league are noise wearing a suit. You play one
              opponent a week; whether you win depends as much on which of nine possible
              schedules you drew as on what your roster did. So throw the schedule out.
            </p>
            <p>
              <strong>All-play</strong> asks a simpler question: each week, how many of the other
              nine teams would you have beaten? Over four weeks that&rsquo;s 36 games per team — a
              sample nine times larger than the one the standings use. It is the closest thing to
              an honest answer this early.
            </p>
            <p>
              Below, every team&rsquo;s actual winning percentage sits next to its all-play
              percentage. Where the amber dot is far to the right of the blue one, the record is
              flattering. Where blue leads, the team is better than its record and has been
              robbed.
            </p>
          </div>

          <FraudGap />

          <div className="dirtyp-col">
            <p>Two teams break the chart.</p>
            <p>
              <strong>What r u doing step-substation?</strong> is 3-1 and sits fourth. Their
              all-play record is <span className="dirtyp-num">13-23</span> — 36.1%, worse than
              every single 1-3 team in the league. They have scored fewer points than four teams
              with worse records. They have declined in all four weeks: 120.5, then 100.3, then
              87.2, then 82.5. They have the worst lineup efficiency in the league in both of the
              last two weeks. There is nothing under the record. It is a 38.9-point gap between
              what the table says and what the roster is.
            </p>
            <p>
              <strong>My Njigba Hurts</strong> is the inverse and it is almost unfair.{' '}
              <span className="dirtyp-num">19-17</span> all-play, a 52.8% clip that puts them
              sixth in the league on merit — and they are 1-3. They have surrendered{' '}
              <span className="dirtyp-num">480.24</span> points, the most in the league by 16.
              Their own scoring is the second-steadiest in the league — a standard deviation of{' '}
              <span className="dirtyp-num">5.5</span>, behind only Rb1&rsquo;s 4.6, and Rb1 is
              steady the way a flatline is steady. And in Week 4 they set a{' '}
              <strong>perfect lineup</strong> — 100% of their roster&rsquo;s available points, the
              only optimal lineup anyone has managed all season — and lost by 41.
            </p>
            <div className="dirtyp-pull">
              They have made two roster moves all year. They are managing better than anyone in
              this league and they have one win.
              <cite>On My Njigba Hurts</cite>
            </div>
          </div>
        </section>

        {/* ---- capsules ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">Five Games</div>
            <h2>How Week 4 Happened</h2>
          </div>

          <div className="dirtyp-caps">
            <Capsule
              home="Austin Clout Demons"
              homePts={94.82}
              away="The Question Master"
              awayPts={96.92}
              tag="Upset of the week"
            >
              <p>
                The team with the most points scored in the league lost to the team with the
                fewest, by 2.1, in a game where{' '}
                <strong>both managers lost a starter in the first quarter</strong>.
              </p>
              <p>
                Austin&rsquo;s was <strong>Rashee Rice</strong>, and it was brutal. On a
                first-and-10 from Mahomes he picked up seven yards, came up gimpy grabbing at his
                left leg, and initially refused to leave the field before walking to the locker
                room. A non-contact hamstring. He finished with{' '}
                <strong>zero catches on zero targets in six offensive snaps</strong> and was
                downgraded to doubtful. <span className="dirtyp-num">0.00</span> points, and
                nothing a manager could have done about it.
              </p>
              <p>
                Austin&rsquo;s other problem was quieter: <strong>Jeremiyah Love</strong> tweaked
                the opposite ankle to his preseason injury and saw his snap share fall from 64% in
                Week 3 to 46%. Tyler Allgeier out-snapped him 36 to 30 and was on the field for
                the final drive. Love said afterward his body is &ldquo;tired,&rdquo; that this
                will &ldquo;probably be the longest year of my life,&rdquo; and that taking more
                work would &ldquo;hinder the team.&rdquo; Six points from a player who had 26
                touches a week earlier.
              </p>
              <p>
                The Question Master got hit just as hard and won anyway.{' '}
                <strong>Saquon Barkley</strong> pulled up after a six-yard run on the second
                offensive drive, grabbed the back of his right hamstring, went to the blue tent and
                then the locker room — <span className="dirtyp-num">1.5</span> points, and
                he&rsquo;ll miss Week 5. <strong>DJ Moore</strong> went into the tent with a
                shoulder late in the second quarter and did not return —{' '}
                <span className="dirtyp-num">2.2</span>. That is two starters gone by halftime.
              </p>
              <p>
                They survived on Joe Burrow (23.7, after 22.6 the week before) and{' '}
                <strong>Emanuel Wilson&rsquo;s 25.5</strong> — a player they had dropped on Sept.
                25 and re-added two days later. Austin, meanwhile, left 22.9 on the bench including
                Bryce Young&rsquo;s 21.5, in a game decided by two.
              </p>
            </Capsule>

            <Capsule
              home="Skatteboys"
              homePts={156.18}
              away="The Disturbance Regime"
              awayPts={104.18}
              tag="The best lineup of the year"
              cool
            >
              <p>
                This was a demolition. <strong>Three Skatteboys starters cleared 25 points</strong>{' '}
                — Tetairoa McMillan 38.2, CeeDee Lamb 32.8, Chuba Hubbard 25.4 — and those three
                alone, <span className="dirtyp-num">96.4</span> points, would have outscored the
                full starting lineups of six teams in this league. Brock Bowers added 17.6, Lamar
                Jackson 18.9. Six of eight starters hit double digits.
              </p>
              <p>
                McMillan&rsquo;s 38.2 was the best individual game of Week 4 and came{' '}
                <em>seven days after he scored 2.7</em>. The 156.18 team total is the highest
                anyone has posted since opening weekend — only Austin&rsquo;s 170.8 in Week 1 has
                been bigger — and it came at 95.3% efficiency, meaning almost nothing was wasted.
              </p>
              <p>
                Worth remembering where McMillan came from: Skatteboys sent{' '}
                <strong>Stefon Diggs and David Montgomery</strong> to San Diego for him on Sept. 9.
                Diggs put up 6.0 and Montgomery 4.3 for their new team on Sunday. That trade is
                starting to look like the defining transaction of the season.
              </p>
              <p>
                The Disturbance Regime deserves better than the box score suggests. They finally
                broke 100 after opening the year at 76.5, 73.7 and 73.5 — and they did it{' '}
                <strong>without Justin Jefferson</strong>, who sprained his right ankle in Week 3,
                did not practice all week, and was declared inactive. Kyren Williams&rsquo; 31.7
                was wasted in a 52-point loss. Jefferson is reportedly hopeful for Week 5.
              </p>
            </Capsule>

            <Capsule
              home="My Njigba Hurts"
              homePts={102.72}
              away="Tanjiro Kamado"
              awayPts={143.56}
              tag="The superteam arrives"
              cool
            >
              <p>
                This is the perfect-lineup loss. My Njigba Hurts left nothing on the bench — not a
                single point — and got run off the field, because Tanjiro Kamado has spent two
                weeks buying everyone.
              </p>
              <p>
                <strong>Puka Nacua</strong>, acquired in the Sept. 24 four-for-four with The
                Question Master, went 23.2. <strong>Malik Nabers</strong>, acquired from
                JahJonJacory Jameson four days before this game, went 20.2. Kenneth Walker III went
                30.4 and Alvin Kamara 20.3. Drake Maye, who scored 3.8 in Week 3, scored 26.2. They
                did it with <strong>Ja&rsquo;Marr Chase leaving with a concussion</strong> for 4.2
                — losing a top-five receiver cost them nothing.
              </p>
              <p>
                Tanjiro has made four of the league&rsquo;s six trades and has four total adds and
                drops. They are not streaming their way to a title; they are consolidating.
              </p>
            </Capsule>

            <Capsule
              home="JahJonJacory Jameson"
              homePts={87.9}
              away="Rb1"
              awayPts={94.48}
              tag="Won it wrong"
            >
              <p>
                A 94.48 that should be an embarrassment. Rb1 started{' '}
                <strong>Jaylen Wright for 0.7</strong> while{' '}
                <strong>Brian Robinson Jr. scored 25.2</strong> and{' '}
                <strong>Ollie Gordon II scored 17.0</strong> on the bench — and started Christian
                Watson&rsquo;s 6.2 over Rome Odunze&rsquo;s 12.4. The optimal lineup was 133.98.
                They left <span className="dirtyp-num">39.5</span> points behind, the worst figure
                of either week, posted a 70.5% efficiency, and won by 6.6 anyway.
              </p>
              <p>
                Credit where it&rsquo;s due: Nico Collins&rsquo; 27.3 and Sam LaPorta&rsquo;s 18.4
                were real, and this was the first time in either of the last two weeks Rb1 beat its
                projection. It is also the fourth straight week they have failed to reach 95 points.
              </p>
              <p>
                For JahJonJacory Jameson, a 27.8-point miss against projection — the worst in the
                league — and a loss to the lowest-scoring team in the league. Dalton Kincaid has
                produced 2.8 and 1.2 at tight end while <strong>Mark Andrews</strong>, just
                acquired, watched from the bench. They also traded away Nabers and Matthew Golden,
                who promptly scored 20.2 and 10.2 for the other guy.
              </p>
            </Capsule>

            <Capsule
              home="What r u doing step-substation?"
              homePts={82.54}
              away="THE San Diego Football Team"
              awayPts={97.12}
              tag="Decided on Monday night"
            >
              <p>
                This one went to the final game of the week, and it was the cleanest head-to-head
                of the season:{' '}
                <strong>
                  step-substation&rsquo;s quarterback against San Diego&rsquo;s running back, in
                  the same stadium, on Monday night.
                </strong>{' '}
                Tyler Shough&rsquo;s Saints hosted Bijan Robinson&rsquo;s Falcons, and whoever won
                that game won this one.
              </p>
              <p>
                Bijan won it decisively —{' '}
                <strong>145 yards and two touchdowns on 19 carries</strong> in a 45&ndash;24
                Atlanta rout where the Falcons tied a team record with five rushing scores.{' '}
                <span className="dirtyp-num">27.2</span> fantasy points. Shough threw 48 times for
                286 yards and one touchdown, a garbage-time strike to Devaughn Vele, and finished
                with <span className="dirtyp-num">15.9</span>. An 11-point swing in a game decided
                by 14.6.
              </p>
              <p>
                San Diego needed it, because the rest of the roster was dreadful: Travis Kelce 2.5,
                Garrett Wilson 4.2, David Montgomery 4.3. They left 29.0 on the bench including Dak
                Prescott&rsquo;s 18.1 and Deebo Samuel&rsquo;s 15.5 — and won anyway, which is what
                good teams get to do.
              </p>
              <p>
                For step-substation, 82.54 was the worst total of Week 4, and the self-inflicted
                part is the part that stings: <strong>Kyle Monangai scored 27.5 on their bench</strong>,
                the single most expensive benching of the season. <strong>Ladd McConkey</strong>{' '}
                entered questionable with a foot injury, played just 24 snaps, aggravated the same
                foot and was ruled out in the third quarter with no catches on two targets —{' '}
                <span className="dirtyp-num">0.00</span>. Efficiency: 75.0%, last in the league. And
                the one touchdown Shough did throw went to Devaughn Vele, who was sitting on The
                Question Master&rsquo;s bench.
              </p>
            </Capsule>
          </div>
        </section>

        {/* ---- studs and duds ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">Week 4 Individuals</div>
            <h2>Helmet Stickers &amp; Hard Lessons</h2>
          </div>
          <div className="dirtyp-sd-grid">
            <div className="dirtyp-sd-card dirtyp-sd-up">
              <h3>Top Performers</h3>
              <div className="dirtyp-sd-list">
                {[
                  ['Tetairoa McMillan', 'CAR', 'Skatteboys', '38.2'],
                  ['CeeDee Lamb', 'DAL', 'Skatteboys', '32.8'],
                  ['Kyren Williams', 'LAR', 'The Disturbance Regime', '31.7'],
                  ['Kenneth Walker III', 'KC', 'Tanjiro Kamado', '30.4'],
                  ['Javonte Williams', 'DAL', 'Austin Clout Demons', '28.8'],
                  ['Nico Collins', 'HOU', 'Rb1', '27.3'],
                  ['Bijan Robinson', 'ATL', 'THE San Diego Football Team', '27.2'],
                ].map(([name, tm, team, pts]) => (
                  <div className="dirtyp-sd-item" key={name}>
                    <div className="dirtyp-sd-who">
                      <b>{name}</b> {tm}
                      <small>{team}</small>
                    </div>
                    <div className="dirtyp-sd-pts">{pts}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dirtyp-sd-card dirtyp-sd-dn">
              <h3>Starters Who Gave Nothing</h3>
              <div className="dirtyp-sd-list">
                {[
                  ['Rashee Rice', 'KC', 'Austin · hamstring, 6 snaps, 1st qtr', '0.0'],
                  ['Ladd McConkey', 'LAC', 'step-substation · foot, out in the 3rd', '0.0'],
                  ['Jaylen Wright', 'MIA', 'Rb1 · B-Rob had 25.2 on the bench', '0.7'],
                  ['Courtland Sutton', 'DEN', 'The Disturbance Regime · healthy, just bad', '0.9'],
                  ['Dalton Kincaid', 'BUF', 'JahJonJacory Jameson · 2nd week in a row', '1.2'],
                  ['Saquon Barkley', 'PHI', 'The Question Master · hamstring, 1st qtr', '1.5'],
                  ['DJ Moore', 'BUF', 'The Question Master · shoulder, 2nd qtr', '2.2'],
                  ['Ja’Marr Chase', 'CIN', 'Tanjiro Kamado · concussion', '4.2'],
                ].map(([name, tm, team, pts]) => (
                  <div className="dirtyp-sd-item" key={name}>
                    <div className="dirtyp-sd-who">
                      <b>{name}</b> {tm}
                      <small>{team}</small>
                    </div>
                    <div className="dirtyp-sd-pts">{pts}</div>
                  </div>
                ))}
              </div>
              <p className="dirtyp-sd-foot">
                Five of these eight were in-game injuries, not bad calls. Week 4 was less a week of
                mismanagement than a week of medical tents.
              </p>
            </div>

            <div className="dirtyp-sd-card dirtyp-sd-dn">
              <h3>Best Game You Didn&rsquo;t Start</h3>
              <div className="dirtyp-sd-list">
                {[
                  ['Kyle Monangai', 'CHI', 'What r u doing step-substation?', '27.5'],
                  ['Brian Robinson Jr.', 'ATL', 'Rb1 · three touchdowns', '25.2'],
                  ['Bryce Young', 'CAR', 'Austin Clout Demons', '21.5'],
                  ['Dak Prescott', 'DAL', 'THE San Diego Football Team', '18.1'],
                  ['Ollie Gordon II', 'MIA', 'Rb1', '17.0'],
                  ['Carnell Tate', 'TEN', 'Tanjiro Kamado', '17.0'],
                  ['Deebo Samuel Sr.', 'SF', 'THE San Diego Football Team', '15.5'],
                ].map(([name, tm, team, pts]) => (
                  <div className="dirtyp-sd-item" key={name}>
                    <div className="dirtyp-sd-who">
                      <b>{name}</b> {tm}
                      <small>{team}</small>
                    </div>
                    <div className="dirtyp-sd-pts">{pts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- bench report ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">The Bench Report</div>
            <h2>196 Points Nobody Used</h2>
          </div>
          <div className="dirtyp-col">
            <p>
              Every week each manager leaves something on the bench; the question is how much.
              Below is the gap between what each team started and the best lineup available to it
              in Week 4 — hindsight, yes, but hindsight applied equally to everyone.
            </p>
          </div>

          <BenchReport />

          <div className="dirtyp-col">
            <p>
              The pattern underneath this is worth sitting with.{' '}
              <strong>
                The two least active teams in the league have the two best efficiency figures
              </strong>{' '}
              — My Njigba Hurts (2 roster moves all season, 96.7% average) and Tanjiro Kamado (4
              moves, 84.1% and rising). The most active team in the league, Rb1, has 20 moves and
              just posted the worst efficiency of the season at 70.5%.
            </p>
            <p>Churn is not management. Setting the right eight is.</p>
          </div>
        </section>

        {/* ---- power rankings ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">Week 5 Power Rankings</div>
            <h2>Ranked On Roster, Not Record</h2>
          </div>
          <div className="dirtyp-col">
            <p>
              <strong>The formula.</strong> Two components, both pointed forward:
            </p>
            <div className="dirtyp-formula">
              <span className="dirtyp-fw">0.65</span> × forward value{' '}
              <span className="dirtyp-fsub">(points per week)</span>
              <br />
              <span className="dirtyp-fw">0.35</span> × all-play %{' '}
              <span className="dirtyp-fsub">(demonstrated)</span>
            </div>
            <p>
              <strong>Forward value</strong> is what a team should actually score from here: the
              points-per-week of its best startable lineup under this league&rsquo;s
              QB/RB/RB/WR/WR/TE/FLEX/FLEX format, averaged across the ten remaining weeks so bye
              weeks enter as the real reduction in output they are, then adjusted for the strength
              of the remaining schedule. Player values are FantasyPros&rsquo;{' '}
              <strong>ROS Half PPR</strong> expert consensus, updated Oct. 6 — which matches this
              league&rsquo;s actual scoring: <strong>0.5 PPR</strong>, 4-point passing touchdowns,
              6-point rushing and receiving scores, 0.1 per yard, &minus;2 for interceptions and
              lost fumbles.
            </p>
            <p>
              <strong>All-play %</strong> is the merit measure from earlier — the only
              backward-looking input, and the one that catches a roster underperforming its talent.
            </p>
            <div className="dirtyp-pull dirtyp-note">
              <strong>What changed, and why.</strong> An earlier version of this index included a
              third component called &ldquo;trajectory&rdquo; — last-two-week scoring average minus
              first-two. It was wrong and it has been cut. Trajectory punishes <em>level</em>:
              Austin Clout Demons dropped from 151.2 points per week to 116.2 and got docked 5.2
              index points for it, even though 116.2 would still be the third-best scoring rate in
              the league. A metric that penalises a team for falling from elite to very good is
              measuring the wrong thing.
              <cite>Correction to the Week 4 index</cite>
            </div>
            <p>
              Bye exposure very nearly repeated the same mistake. Measured as a standalone penalty
              it <em>rewards</em> having replaceable starters — step-substation has the
              league&rsquo;s lowest bye cost (&minus;2.13 points per week) precisely because losing
              their players costs the least, while Austin&rsquo;s is &minus;4.28 because theirs are
              good. Folding byes into the points projection instead of scoring them separately
              fixes that: a bye becomes a small, honest reduction in expected output rather than a
              punishment for owning useful players.
            </p>
            <p>
              Both components are z-scored before weighting. Within forward value, everything stays
              denominated in points, which keeps the small effects small — lineup quality spans{' '}
              <span className="dirtyp-num">16.7</span> points per week across the league, byes{' '}
              <span className="dirtyp-num">2.6</span> and schedule{' '}
              <span className="dirtyp-num">2.2</span>. Z-scoring those three separately would have
              inflated two minor signals into co-equals.
            </p>
            <p>
              The <strong>index</strong> column is <span className="dirtyp-num">50 + 15z</span>: 50
              is league average, every 15 points is one standard deviation.
            </p>
          </div>

          <PowerRankings />
        </section>

        {/* ---- week 5 ---- */}
        <section className="dirtyp-section">
          <div className="dirtyp-sec-head dirtyp-col">
            <div className="dirtyp-eyebrow">Week 5</div>
            <h2>What&rsquo;s Coming</h2>
          </div>
          <div className="dirtyp-col">
            <p>
              <strong>Byes: Kansas City and Carolina.</strong> That&rsquo;s Mahomes, Travis Kelce,
              Rashee Rice, Xavier Worthy, Kenneth Walker III, Chuba Hubbard and Tetairoa McMillan
              all off the board — which hits Skatteboys and Tanjiro Kamado hardest, right as both
              were peaking.
            </p>
            <div className="dirtyp-tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Home</th>
                    <th>Away</th>
                    <th className="dirtyp-td-wrap">The angle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="dirtyp-td-team">Skatteboys</td>
                    <td className="dirtyp-td-team">What r u doing step-substation?</td>
                    <td className="dirtyp-td-wrap">
                      Hottest team in the league vs. the most exposed 3-1. Skatteboys lose McMillan
                      and Hubbard to byes.
                    </td>
                  </tr>
                  <tr>
                    <td className="dirtyp-td-team">THE San Diego Football Team</td>
                    <td className="dirtyp-td-team">JahJonJacory Jameson</td>
                    <td className="dirtyp-td-wrap">Kelce and Mahomes both on bye. Bijan decides it.</td>
                  </tr>
                  <tr>
                    <td className="dirtyp-td-team">The Disturbance Regime</td>
                    <td className="dirtyp-td-team">Austin Clout Demons</td>
                    <td className="dirtyp-td-wrap">
                      The second of two Austin meetings. Disturbance&rsquo;s lineup is better than
                      its record; Austin&rsquo;s is better than everyone&rsquo;s.
                    </td>
                  </tr>
                  <tr className="dirtyp-tr-mine">
                    <td className="dirtyp-td-team">Rb1</td>
                    <td className="dirtyp-td-team">My Njigba Hurts</td>
                    <td className="dirtyp-td-wrap">
                      1-3 vs 1-3. Lowest scorer in the league against the unluckiest team in it.
                    </td>
                  </tr>
                  <tr>
                    <td className="dirtyp-td-team">The Question Master</td>
                    <td className="dirtyp-td-team">Tanjiro Kamado</td>
                    <td className="dirtyp-td-wrap">Rematch of the four-for-four. Walker on bye blunts the superteam.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>The injury file.</strong> De&rsquo;Von Achane is out for the season with a
              torn ACL — the defining injury of the league&rsquo;s year, and it set off the biggest
              waiver run of the season on Sept. 30. Breece Hall remains week-to-week with a quad;
              the models give him a 27% chance to play and rank him RB60. Jayden Daniels is expected
              back for Week 5 against the Giants after dislocating his left elbow in Week 2, with
              Dan Quinn saying the goal is &ldquo;a full week of practice... and start on
              Sunday.&rdquo; Justin Jefferson missed Week 4 with a sprained ankle and is hopeful to
              return.
            </p>
            <p>
              <strong>The wire is dry where it matters.</strong> The best running back available in
              this league has produced 13.1 points over the last two weeks combined. Quarterback,
              meanwhile, is absurd for a ten-teamer: Kirk Cousins (44.8 over two weeks), Aaron
              Rodgers (44.6), Sam Darnold (41.0), Jared Goff (39.8) and Jacoby Brissett are all
              unowned. If your problem is at running back, the wire will not fix it. Trade or lose.
            </p>
            <p>
              The two best buys nobody has touched: <strong>Roman Wilson</strong> (3.7% owned, 13.5
              then 14.9) and <strong>Keon Coleman</strong> (4.3% owned, career-high 116 yards and a
              score in Week 4). Austin Clout Demons already did the aggressive thing and signed{' '}
              <strong>Tyreek Hill</strong> off the street on Sept. 30.
            </p>
          </div>
        </section>

        {/* ---- notes ---- */}
        <div className="dirtyp-notes dirtyp-col">
          <h2>Methodology &amp; Caveats</h2>
          <p>
            All league figures are pulled from the ESPN fantasy API for league 1683729, 2026 season,
            after Week 4. Scoring is 0.5 PPR. Per-player actuals use weekly stat rows (
            <code>statSplitTypeId 1</code>, <code>statSourceId 0</code>); projections use{' '}
            <code>statSourceId 1</code>.
          </p>
          <p>
            <strong>On injuries.</strong> ESPN&rsquo;s <code>injuryStatus</code> field is
            current-state only — it returns a player&rsquo;s status today regardless of which week
            you request, so it cannot tell you whether someone was listed questionable{' '}
            <em>before</em> a given game. Every injury timeline in this column comes from published
            reporting, not from that field. An earlier draft of this piece got that wrong in three
            places.
          </p>
          <p>
            <strong>All-play</strong> scores each team against all nine others every week — 36 games
            through Week 4. It is a four-week sample and is descriptive, not predictive.
          </p>
          <p>
            <strong>Power ranking index</strong> = 50 + 15z, where z = 0.65 × z(forward value) +
            0.35 × z(all-play %). Forward value is denominated in points per week: the optimal
            startable lineup under QB/RB/RB/WR/WR/TE/FLEX/FLEX, recomputed for each of weeks
            5&ndash;14 with that week&rsquo;s bye players unavailable and then averaged, plus a
            remaining-schedule adjustment. Player values are FantasyPros ROS Half PPR consensus (
            <code>r2p_pts</code>, 5&ndash;6 experts, updated Oct. 6) divided by the ten games left.
            Name matching between ESPN and FantasyPros resolved all 146 rostered players.
          </p>
          <p>
            When a bye leaves a slot unfillable from the roster, it falls back to{' '}
            <strong>replacement level</strong> — the best unrostered player at that position —
            rather than scoring zero. This matters a lot: the best available quarterback in this
            league is worth 25.2 points per week, so a one-QB roster is not actually exposed on its
            starter&rsquo;s bye, it just streams. An earlier version scored those weeks as zero and
            produced absurd 1,300-point bye penalties.
          </p>
          <p>
            <strong>Trajectory was removed from this index</strong> after it was shown to penalise
            scoring level rather than scoring direction. Bye cost is deliberately <em>not</em> a
            standalone component for the same reason — as a separate penalty it rewards owning
            replaceable players.
          </p>
          <p>
            <strong>Optimal lineups</strong> are computed with perfect hindsight under this
            league&rsquo;s format, FLEX accepting RB, WR or TE. They measure management quality in
            aggregate and are not a claim that any individual start/sit decision was knowable in
            advance — Brian Robinson Jr. was projected for 7.7 and scored 25.2 on three touchdowns.
          </p>
          <p>
            Trade package contents are reconstructed from the league activity feed and grouped by
            timestamp. The Sept. 24 four-for-four was cross-checked against both rosters; the others
            were not independently verified. NFL injury and transaction context is from published
            reporting as of Oct. 6, 2026.
          </p>
        </div>
      </div>
    </div>
  )
}
