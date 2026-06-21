"use client"

import React from "react";
import Link from "next/link";

/* ----------------------------- Design tokens ----------------------------- */
const C = {
  navy: "#1b2540",
  cosmos: "#001033",
  chartreuse: "#d0f100",
  ice: "#e0f6ff",
  canvas: "#f8f9fc",
  surface: "#ffffff",
  slate: "#6b7184",
  ash: "#7c8293",
  storm: "#596075",
  fog: "#b1b5c0",
  white: "#fafeff",
};

const SANS =
  "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";

const SH = {
  card: "rgba(0,39,80,0.03) 0px 56px 72px -16px, rgba(0,39,80,0.03) 0px 32px 32px -16px, rgba(0,39,80,0.04) 0px 6px 12px -3px, rgba(0,39,80,0.04) 0px 0px 0px 1px",
  badge:
    "rgba(0,39,80,0.08) 0px 6px 16px -3px, rgba(0,39,80,0.04) 0px 0px 0px 1px",
  ghost:
    "rgba(255,255,255,0.72) 0px 1px 1px 0px inset, rgba(4,33,80,0.03) 0px 4px 12px 0px, rgba(4,33,80,0.06) 0px 1px 2px 0px, rgba(4,33,80,0.04) 0px 0px 0px 1px",
  cta: "rgba(24,37,66,0.32) 0px 1px 3px 0px, rgba(24,37,66,0.44) 0px 12px 24px -12px, rgba(219,247,255,0.48) 0px 0.5px 0.5px 0px inset",
  darkGhost:
    "rgba(255,255,255,0.08) 0px 0px 16px 8px inset, rgba(255,255,255,0.08) 0px 0px 8px 4px inset, rgba(255,255,255,0.12) 0px 0px 2px 1px inset",
  pill: "rgba(255,255,255,0.88) 0px 1px 1px 0px inset, rgba(0,39,80,0.04) 0px 0px 0px 1px, rgba(0,39,80,0.06) 0px 8px 20px -6px",
};

/* ------------------------------- Buttons -------------------------------- */
function CTAButton({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <button
      style={{
        background: C.chartreuse,
        color: C.navy,
        border: "none",
        borderRadius: 9999,
        padding: "0 24px",
        height: 44,
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        cursor: "pointer",
        boxShadow: SH.cta,
        transition: "transform .25s, filter .25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "none";
      }}
    >
      {children}
    </button>
  );
}

function DarkGhost({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: "transparent",
        color: C.white,
        border: `1px solid ${C.ice}`,
        borderRadius: 9999,
        padding: "0 18px",
        height: 40,
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: "-0.015em",
        cursor: "pointer",
        boxShadow: SH.darkGhost,
      }}
    >
      {children}
    </button>
  );
}

function LightGhost({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: "transparent",
        color: C.navy,
        border: "none",
        borderRadius: 9999,
        padding: "10px 24px",
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: "-0.015em",
        cursor: "pointer",
        boxShadow: SH.ghost,
      }}
    >
      {children}
    </button>
  );
}

/* -------------------------------- Page ---------------------------------- */
const NAV = ["Platform", "Resources", "Pricing", "Careers"];

export default function Index() {
  return (
    <div style={{ background: C.canvas, fontFamily: SANS, color: C.navy, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes amSpin { to { transform: rotate(360deg); } }
        @keyframes amRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes amPulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .am-rise { animation: amRise .7s cubic-bezier(.22,1,.36,1) both; }
        .am-link:hover { color: #fff !important; }
        .am-section { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 860px) {
          .am-nav-links { display: none !important; }
          .am-two-col { grid-template-columns: 1fr !important; }
          .am-display { font-size: 40px !important; }
        }
      `}</style>

      {/* ===================== HERO (dark) ===================== */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(180deg, #001033 0%, #0050f8 62%, #5fbdf7 100%)",
          overflow: "hidden",
          paddingBottom: 120,
        }}
      >
        {/* Dot globe */}
        <DotGlobe />

        {/* Nav */}
        <nav style={{ position: "relative", zIndex: 5 }}>
          <div
            className="am-section"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo light />
              <span style={{ color: C.white, fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" }}>
                Growwzzy
              </span>
            </div>
            <div className="am-nav-links" style={{ display: "flex", gap: 28 }}>
              {NAV.map((n) => (
                <a
                  key={n}
                  href="#"
                  className="am-link"
                  style={{
                    color: "rgba(250,254,255,0.78)",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 450,
                    letterSpacing: "-0.015em",
                    transition: "color .2s",
                  }}
                >
                  {n}
                </a>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/login" className="am-link" style={{ color: "rgba(250,254,255,0.78)", textDecoration: "none", fontSize: 15, fontWeight: 450 }}>
                Log in
              </Link>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <CTAButton>Book a demo</CTAButton>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 5, textAlign: "center", paddingTop: 64 }}>
          <div className="am-rise" style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: C.surface,
                borderRadius: 9999,
                padding: "6px 16px 6px 6px",
                boxShadow: SH.pill,
                fontSize: 14,
                fontWeight: 450,
                letterSpacing: "-0.015em",
              }}
            >
              <span style={{ background: C.cosmos, color: C.white, borderRadius: 9999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                New
              </span>
              <span style={{ color: C.navy }}>Introducing autonomous workflows →</span>
            </div>
          </div>

          <h1
            className="am-rise am-display"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 60,
              lineHeight: 1.04,
              letterSpacing: "-0.01em",
              color: C.white,
              maxWidth: 760,
              margin: "28px auto 0",
              padding: "0 24px",
            }}
          >
            Agency management on autopilot
          </h1>
          <p
            className="am-rise"
            style={{
              color: "rgba(224,246,255,0.86)",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              maxWidth: 520,
              margin: "20px auto 0",
              padding: "0 24px",
              lineHeight: 1.5,
            }}
          >
            Growwzzy automatically tracks prospects, manages tasks, and streamlines client onboarding — so your team ships more and stresses less.
          </p>
          <div className="am-rise" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <CTAButton>Start saving time</CTAButton>
            </Link>
            <DarkGhost>Explore platform</DarkGhost>
          </div>

          {/* Floating product card */}
          <div className="am-rise" style={{ marginTop: 72, padding: "0 24px" }}>
            <ProductDashboard />
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section className="am-section" style={{ paddingTop: 64, paddingBottom: 16, textAlign: "center" }}>
        <p style={{ color: C.slate, fontSize: 14, letterSpacing: "-0.01em", marginBottom: 24 }}>
          Trusted by top agencies and fast-moving companies
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, opacity: 0.6 }}>
          {["Nebula", "Quantia", "Hyperloop", "Vault", "Northstar"].map((b) => (
            <span key={b} style={{ fontSize: 22, fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* ===================== FEATURE: FIX ===================== */}
      <section className="am-section" style={{ paddingTop: 80 }}>
        <div className="am-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <Eyebrow color="#0050f8">Track</Eyebrow>
            <h2 style={headingLg}>Resolve issues before they compound</h2>
            <p style={bodyMuted}>
              Growwzzy continuously monitors your pipeline, surfaces high-impact bottlenecks, and
              automates follow-ups automatically — no spreadsheets, no waiting.
            </p>
            <div style={{ marginTop: 24 }}>
              <LightGhost>See how it works</LightGhost>
            </div>
          </div>
          <ElevatedCard>
            <IssueList />
          </ElevatedCard>
        </div>
      </section>

      {/* ===================== FEATURE: PREVENT (reversed) ===================== */}
      <section className="am-section" style={{ paddingTop: 80 }}>
        <div className="am-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <ElevatedCard>
            <PreventPanel />
          </ElevatedCard>
          <div>
            <Eyebrow color="#0aa06e">Manage</Eyebrow>
            <h2 style={headingLg}>Guardrails that keep tasks in check</h2>
            <p style={bodyMuted}>
              Set workflows once and let Growwzzy enforce them across every client. Get alerted
              the moment timelines drift — and let autopilot bring it back on track.
            </p>
            <div style={{ marginTop: 24 }}>
              <LightGhost>Explore workflows</LightGhost>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 3-COL FEATURE GRID ===================== */}
      <section className="am-section" style={{ paddingTop: 96, textAlign: "center" }}>
        <Eyebrow color="#0050f8" center>
          Why teams choose Growwzzy
        </Eyebrow>
        <h2 style={{ ...headingLg, maxWidth: 620, margin: "8px auto 0" }}>Manage more, stress less</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 48,
            textAlign: "left",
          }}
        >
          {[
            { t: "Autonomous tracking", d: "Continuous pipeline optimization that works while you sleep — close 32% more deals.", c: "#0050f8" },
            { t: "Zero-friction workflows", d: "Every stage is automated and logged, so your team stays in full control.", c: "#0aa06e" },
            { t: "Realtime analytics", d: "Know about stalled projects in seconds, not at the end of the month.", c: "#e8730a" },
          ].map((f) => (
            <div key={f.t} style={{ background: C.canvas, borderRadius: 16, padding: 24 }}>
              <FeatureIcon color={f.c} />
              <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "16px 0 8px" }}>{f.t}</h3>
              <p style={{ ...bodyMuted, marginTop: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="am-section" style={{ paddingTop: 96 }}>
        <ElevatedCard pad={40}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 32, textAlign: "center" }}>
            {[
              { n: "10k+", l: "Clients managed" },
              { n: "32%", l: "Time saved weekly" },
              { n: "14 days", l: "Time to first ROI" },
              { n: "99.99%", l: "Platform uptime" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.01em", color: C.navy }}>
                  {s.n}
                </div>
                <div style={{ color: C.slate, fontSize: 14, marginTop: 8, letterSpacing: "-0.01em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </ElevatedCard>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="am-section" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div
          style={{
            background: "linear-gradient(160deg, #001033 0%, #0050f8 130%)",
            borderRadius: 28,
            padding: "72px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.01em", color: C.white, maxWidth: 560, margin: "0 auto" }}>
            Put your agency on autopilot
          </h2>
          <p style={{ color: "rgba(224,246,255,0.84)", fontSize: 18, maxWidth: 460, margin: "16px auto 0", lineHeight: 1.5 }}>
            Create an account in minutes and streamline your workflows today.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <CTAButton>Book a demo</CTAButton>
            </Link>
            <DarkGhost>Talk to sales</DarkGhost>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={{ borderTop: "1px solid #e6e8ef" }}>
        <div className="am-section" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", padding: "32px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo />
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", color: C.navy }}>Growwzzy</span>
          </div>
          <span style={{ color: C.slate, fontSize: 14 }}>
            © {new Date().getFullYear()} Growwzzy. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ----------------------------- Shared styles ----------------------------- */
const headingLg: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: 40,
  lineHeight: 1.05,
  letterSpacing: "-0.01em",
  color: C.navy,
  margin: "12px 0 0",
};
const bodyMuted: React.CSSProperties = {
  color: C.slate,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  marginTop: 16,
};

function Eyebrow({ children, color, center }: { children: React.ReactNode; color: string; center?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        margin: center ? "0 auto" : 0,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        color,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: color }} />
      {children}
    </div>
  );
}

function ElevatedCard({ children, pad = 20 }: { children: React.ReactNode; pad?: number }) {
  return (
    <div style={{ background: C.surface, borderRadius: 20, padding: pad, boxShadow: SH.card }}>{children}</div>
  );
}

function Logo({ light }: { light?: boolean }) {
  const dot = light ? C.white : C.navy;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: C.chartreuse }} />
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: dot }} />
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: dot }} />
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: dot }} />
    </div>
  );
}

function FeatureIcon({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: color + "1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 6, background: color }} />
    </div>
  );
}

/* --------------------------- Hero dot globe --------------------------- */
function DotGlobe() {
  const dots: React.ReactNode[] = [];
  const rings = 7;
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * 280;
    const count = Math.max(6, Math.round(r * 7));
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dots.push(
        <circle
          key={`${r}-${i}`}
          cx={Number((300 + Math.cos(a) * radius).toFixed(3))}
          cy={Number((300 + Math.sin(a) * radius * 0.42).toFixed(3))}
          r={1.6}
          fill="#e0f6ff"
          opacity={Number((0.5 + (r / rings) * 0.4).toFixed(3))}
        />,
      );
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        top: -40,
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        pointerEvents: "none",
        opacity: 0.55,
      }}
    >
      <svg viewBox="0 0 600 600" width="600" height="600" style={{ animation: "amSpin 80s linear infinite" }}>
        {dots}
      </svg>
    </div>
  );
}

/* --------------------------- Product dashboard --------------------------- */
function ProductDashboard() {
  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        background: C.surface,
        borderRadius: 20,
        boxShadow: SH.card,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "56px 1fr",
        textAlign: "left",
      }}
    >
      {/* sidebar */}
      <div style={{ background: C.canvas, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRight: "1px solid #eceef4" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: i === 0 ? C.chartreuse : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 5, background: i === 0 ? C.navy : C.slate, opacity: i === 0 ? 1 : 0.6 }} />
          </div>
        ))}
      </div>
      {/* main */}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, color: C.navy }}>Agency insights</h3>
          <div style={{ display: "flex", gap: 16 }}>
            {["Overview", "Issues", "Revenue"].map((t, i) => (
              <span key={t} style={{ fontSize: 14, color: i === 1 ? C.navy : C.slate, fontWeight: i === 1 ? 600 : 450 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <IssueList />
      </div>
    </div>
  );
}

function IssueList() {
  const rows = [
    { t: "Stalled proposals", s: "Urgent", c: "#e8730a", save: "$12,400 at risk" },
    { t: "Unsigned contracts", s: "Follow-up", c: "#0050f8", save: "$3,840 pending" },
    { t: "Overdue invoices", s: "Review", c: "#0aa06e", save: "$1,120 overdue" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r, i) => (
        <div
          key={r.t}
          className="am-rise"
          style={{
            animationDelay: `${i * 0.12}s`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: C.surface,
            borderRadius: 16,
            padding: "12px 16px",
            boxShadow: SH.badge,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: r.c }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", color: C.navy }}>{r.t}</div>
              <span style={{ fontSize: 12, color: r.c, fontWeight: 500 }}>{r.s}</span>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{r.save}</span>
        </div>
      ))}
    </div>
  );
}

function PreventPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: C.navy }}>Task guardrails</div>
      {[
        { l: "Client onboarding", v: 72, c: "#0aa06e" },
        { l: "Proposal success", v: 48, c: "#0050f8" },
        { l: "Task completion", v: 90, c: "#e8730a" },
      ].map((g) => (
        <div key={g.l} style={{ background: C.canvas, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.navy }}>{g.l}</span>
            <span style={{ fontSize: 13, color: C.slate }}>{g.v}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 9999, background: "#e6e8ef" }}>
            <div style={{ width: `${g.v}%`, height: "100%", borderRadius: 9999, background: g.c }} />
          </div>
        </div>
      ))}
    </div>
  );
}
