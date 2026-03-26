'use client'

export function WeddingPreview() {
  const schedule = [
    { time: '4:00', event: 'Ceremony' },
    { time: '5:00', event: 'Cocktails' },
    { time: '6:30', event: 'Reception' },
    { time: '9:00', event: 'Dancing' },
  ]

  return (
    <div className="preview-wedding">
      <style>{`
        .preview-wedding {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--landing-text);
          overflow: hidden;
          border-radius: 6px;
          background: var(--landing-bg-card);
          position: relative;
        }

        /* Decorative border */
        .preview-wedding::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid var(--landing-border);
          border-radius: 4px;
          pointer-events: none;
          z-index: 1;
        }

        /* Subtle shimmer overlay */
        .preview-wedding::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            color-mix(in srgb, var(--landing-accent) 4%, transparent) 45%,
            color-mix(in srgb, var(--landing-accent) 6%, transparent) 50%,
            color-mix(in srgb, var(--landing-accent) 4%, transparent) 55%,
            transparent 60%
          );
          background-size: 250% 100%;
          animation: wedding-shimmer 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes wedding-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Hero area */
        .pw-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 12px 10px;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .pw-flourish {
          width: 60px;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            var(--landing-accent),
            transparent
          );
          margin-bottom: 8px;
          opacity: 0;
          animation: wedding-fade-in 0.8s 0.2s ease forwards;
        }

        .pw-names {
          font-size: 14px;
          font-weight: 400;
          font-style: italic;
          color: var(--landing-text);
          letter-spacing: 0.06em;
          margin-bottom: 4px;
          opacity: 0;
          animation: wedding-fade-in 0.8s 0.4s ease forwards;
        }

        .pw-ampersand {
          color: var(--landing-accent);
          font-size: 11px;
          margin: 0 4px;
          font-style: normal;
        }

        .pw-date {
          font-family: var(--font-mono, monospace);
          font-size: 5.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--landing-text-muted);
          margin-bottom: 6px;
          opacity: 0;
          animation: wedding-fade-in 0.8s 0.6s ease forwards;
        }

        .pw-flourish-2 {
          width: 40px;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            var(--landing-accent),
            transparent
          );
          opacity: 0;
          animation: wedding-fade-in 0.8s 0.7s ease forwards;
        }

        /* RSVP card */
        .pw-rsvp {
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: wedding-slide-up 0.6s 0.9s ease forwards;
        }

        .pw-rsvp-label {
          font-size: 6px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--landing-accent);
          font-family: var(--font-mono, monospace);
          font-style: normal;
        }

        .pw-rsvp-fields {
          display: flex;
          gap: 5px;
          width: 100%;
          max-width: 160px;
        }

        .pw-field {
          flex: 1;
          height: 12px;
          border-radius: 3px;
          border: 1px solid var(--landing-border);
          background: color-mix(in srgb, var(--landing-bg-card) 80%, transparent);
          display: flex;
          align-items: center;
          padding: 0 4px;
        }

        .pw-field-text {
          font-size: 4.5px;
          color: var(--landing-text-dim);
          font-family: -apple-system, system-ui, sans-serif;
          font-style: normal;
        }

        .pw-rsvp-btn {
          padding: 3px 14px;
          border-radius: 3px;
          background: var(--landing-accent);
          color: var(--landing-bg-card);
          font-size: 5px;
          font-family: var(--font-mono, monospace);
          font-style: normal;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
        }

        /* Schedule strip */
        .pw-schedule {
          display: flex;
          justify-content: center;
          gap: 0;
          padding: 6px 12px 10px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: wedding-slide-up 0.6s 1.1s ease forwards;
        }

        .pw-schedule-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .pw-schedule-item:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 4px;
          right: 0;
          width: 1px;
          height: 16px;
          background: var(--landing-border);
        }

        .pw-schedule-time {
          font-family: var(--font-mono, monospace);
          font-size: 5px;
          color: var(--landing-accent);
          font-style: normal;
          margin-bottom: 2px;
        }

        .pw-schedule-event {
          font-size: 5px;
          color: var(--landing-text-muted);
          font-style: normal;
          font-family: -apple-system, system-ui, sans-serif;
        }

        /* Decorative dots */
        .pw-dots {
          display: flex;
          justify-content: center;
          gap: 3px;
          padding-bottom: 8px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: wedding-fade-in 0.6s 1.3s ease forwards;
        }

        .pw-dot {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: var(--landing-accent);
          opacity: 0.4;
        }

        .pw-dot:nth-child(2) {
          opacity: 0.7;
        }

        .pw-dot:nth-child(3) {
          opacity: 1;
        }

        .pw-dot:nth-child(4) {
          opacity: 0.7;
        }

        .pw-dot:nth-child(5) {
          opacity: 0.4;
        }

        @keyframes wedding-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes wedding-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pw-hero">
        <div className="pw-flourish" />
        <div className="pw-names">
          Sarah<span className="pw-ampersand">&</span>James
        </div>
        <div className="pw-date">October 12, 2026 · Napa Valley</div>
        <div className="pw-flourish-2" />
      </div>

      <div className="pw-rsvp">
        <div className="pw-rsvp-label">RSVP</div>
        <div className="pw-rsvp-fields">
          <div className="pw-field">
            <span className="pw-field-text">Your name</span>
          </div>
          <div className="pw-field">
            <span className="pw-field-text">Number of guests</span>
          </div>
        </div>
        <div className="pw-rsvp-btn">Confirm Attendance</div>
      </div>

      <div className="pw-schedule">
        {schedule.map((item) => (
          <div key={item.event} className="pw-schedule-item">
            <div className="pw-schedule-time">{item.time}</div>
            <div className="pw-schedule-event">{item.event}</div>
          </div>
        ))}
      </div>

      <div className="pw-dots">
        <span className="pw-dot" />
        <span className="pw-dot" />
        <span className="pw-dot" />
        <span className="pw-dot" />
        <span className="pw-dot" />
      </div>
    </div>
  )
}
