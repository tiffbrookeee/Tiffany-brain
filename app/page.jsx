import { useState, useEffect, useRef, useCallback } from "react";

// ─── FONT INJECTION ───────────────────────────────────────────────────────────
function StyleInjector() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:#0f0d0c}
      ::-webkit-scrollbar-thumb{background:#2e2824;border-radius:4px}
      textarea{resize:vertical}
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      .fade-in{animation:fadeIn 0.3s ease forwards}
      .dot{width:6px;height:6px;border-radius:50%;background:#c4955a;animation:pulse 1.4s ease-in-out infinite}
      .dot:nth-child(2){animation-delay:.2s}
      .dot:nth-child(3){animation-delay:.4s}
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0F0D0C",
  surface: "#161210",
  card: "#1C1815",
  cardHover: "#221E1A",
  border: "#272220",
  borderLight: "#333028",
  gold: "#C4955A",
  goldLight: "#D4A870",
  wine: "#8B3A52",
  cream: "#F0E8DC",
  muted: "#8A8078",
  mutedLight: "#B8AFA5",
  green: "#5A7A62",
  blue: "#4A6B8A",
  purple: "#6A5A8A",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BUCKETS = [
  { id: "mentor_minutes", label: "Mentor Minutes", account: "@tunedinwithtiff", emoji: "🎓", color: T.gold },
  { id: "practice_preach", label: "Practice > Preach", account: "@tunedinwithtiff", emoji: "⚡", color: "#D4A060" },
  { id: "respectfully_no", label: "Respectfully No", account: "@tunedinwithtiff", emoji: "🛑", color: T.wine },
  { id: "gym_healing", label: "Healing w/ Food", account: "@gym", emoji: "🥗", color: T.green },
  { id: "gym_workouts", label: "Workout Journey", account: "@gym", emoji: "💪", color: "#6A9A72" },
  { id: "skincare_science", label: "Science of Skin", account: "@education", emoji: "🧪", color: T.blue },
  { id: "substack", label: "Substack Rewinds", account: "@education", emoji: "📚", color: T.purple },
];

const HUBS = [
  { id: "dashboard", label: "Command Center", icon: "⚡" },
  { id: "content", label: "Content", icon: "📱" },
  { id: "brand", label: "Vixens N Darlings", icon: "👗" },
  { id: "college", label: "College + Future", icon: "🎓" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "ai", label: "AI Lab", icon: "🤖" },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); } catch {}
  },
};

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
const SYSTEM = `You are Tiff's creative content partner and personal AI. Here's who Tiff is:
- College senior at Arizona State, headed to Thunderbird School of Global Management (MBA). Law school waitlist. Figuring it out in real time.
- Building @tunedinwithtiff on TikTok/social: content buckets are Mentor Minutes (career wisdom, mentorship stories), Practice>Preach (living what she preaches), Respectfully No (boundaries, self-advocacy, for women told to shrink)
- Also has @gym (healing relationship with food, workout journey) and @education (skincare science, substack rewinds)
- Her best content so far: unscripted interview tips + "how to be articulate" — real, raw, no script
- Launching Vixens N Darlings: an empowerment marketplace for women. Vision still forming — could be clothing, podcast, planners, charms, phone cases, a community forum. She's stuck here and open to figuring it out through content.
- Brand voice: big sister who has their shit together but secretly doesn't. Direct. Warm. Witty. Never preachy.
- Audience: women told to shrink, shush, calm down. Ambitious, emotional, building something real.
- Phrases that fit: "Respectfully, no." / "You were never too much. You were just in the wrong room." / "Build in public. Stumble in public. Grow in public."
- The fork in the road (Thunderbird vs law vs brand) IS content. The not-knowing IS content.
Be her real creative partner. Push back when something isn't authentic. Give concrete, specific ideas, not generic advice.`;

async function askClaude(userMsg, history = [], maxTokens = 1200) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: SYSTEM,
      messages: [...history, { role: "user", content: userMsg }],
    }),
  });
  const d = await r.json();
  return d.content?.[0]?.text || "Something went wrong — try again.";
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Card({ children, style, onClick, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.card,
        border: `1px solid ${hov && onClick ? T.gold : accent || T.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled, small }) {
  const v = {
    primary: { bg: T.gold, color: "#0F0D0C" },
    ghost: { bg: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    wine: { bg: T.wine, color: T.cream },
    soft: { bg: T.surface, color: T.mutedLight, border: `1px solid ${T.border}` },
    danger: { bg: "#5A2020", color: "#FFAAAA" },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border || "none",
        borderRadius: 8,
        padding: small ? "5px 12px" : "9px 18px",
        fontSize: small ? 12 : 13,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Inp({ value, onChange, placeholder, style, multiline, rows = 3, onKeyDown }) {
  const base = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    color: T.cream,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
    lineHeight: 1.6,
    ...style,
  };
  const handlers = {
    onFocus: e => (e.currentTarget.style.borderColor = T.gold),
    onBlur: e => (e.currentTarget.style.borderColor = T.border),
    onKeyDown,
  };
  return multiline
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} {...handlers} />
    : <input value={value} onChange={onChange} placeholder={placeholder} style={base} {...handlers} />;
}

function Tag({ label, color, onRemove, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `${color}22`, color: color,
      border: `1px solid ${color}44`,
      borderRadius: 20, padding: small ? "2px 8px" : "3px 10px",
      fontSize: small ? 10 : 11, fontWeight: 500,
    }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.6 }}>×</span>}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: T.cream, marginBottom: 22, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

function SubNav({ items, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)} style={{
          background: active === item.id ? T.gold : "transparent",
          color: active === item.id ? "#0F0D0C" : T.muted,
          border: `1px solid ${active === item.id ? T.gold : T.border}`,
          borderRadius: 7, padding: "6px 14px", fontSize: 12,
          fontFamily: "'Syne', sans-serif", fontWeight: 600,
          cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.02em",
        }}>{item.label}</button>
      ))}
    </div>
  );
}

function BucketPill({ bucket, selected, onClick }) {
  const b = BUCKETS.find(x => x.id === bucket) || BUCKETS[0];
  return (
    <button onClick={onClick} style={{
      background: selected ? `${b.color}22` : "transparent",
      color: selected ? b.color : T.muted,
      border: `1px solid ${selected ? b.color + "66" : T.border}`,
      borderRadius: 20, padding: "4px 12px", fontSize: 11,
      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
      transition: "all 0.15s", fontWeight: selected ? 500 : 400,
    }}>
      {b.emoji} {b.label}
    </button>
  );
}

// ─── DASHBOARD HUB ────────────────────────────────────────────────────────────
function DashboardHub({ tasks, onToggleTask, openCapture }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    store.get("morning_brief").then(b => {
      if (b?.date === today) setBrief(b.text);
    });
  }, []);

  const generateBrief = async () => {
    setLoading(true);
    const pending = tasks.filter(t => !t.done).slice(0, 6).map(t => t.title).join(", ") || "nothing yet";
    try {
      const text = await askClaude(
        `Generate Tiff's morning brief for ${today}. Keep it under 280 words, punchy and personal.

Format exactly like this:
☀️ GOOD MORNING, TIFF
[2 sentences — energizing, big sister energy. Something that acknowledges where she's at right now.]

📋 YOUR FOCUS TODAY
[Based on these open tasks: ${pending} — give her a prioritized view. If no tasks, say something honest about starting fresh.]

📱 TRENDING CONTENT ANGLES (use these this week)
• [Trend/angle relevant to her niche — career, women's empowerment, brand building, wellness]
• [Another — could tie to current events, graduation season, etc.]
• [One that connects to Vixens N Darlings vision]

💡 HOOK OF THE DAY
[One specific hook she could post today, with the bucket it belongs to]

🔥 CLOSING REMINDER
[1 sentence. Her brand voice. Something she'd actually say.]`,
        []
      );
      setBrief(text);
      store.set("morning_brief", { text, date: today });
    } catch { setBrief("Couldn't load — try again in a sec."); }
    setLoading(false);
  };

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <div className="fade-in" style={{ display: "flex", gap: 22 }}>
      {/* Left */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Date + Brief */}
        <Card accent={T.gold + "33"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: T.cream, lineHeight: 1 }}>{today}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em" }}>MORNING BRIEF</div>
            </div>
            <Btn onClick={generateBrief} disabled={loading}>
              {loading ? "Brewing..." : brief ? "↺ Refresh" : "✨ Generate"}
            </Btn>
          </div>
          {brief ? (
            <div style={{ fontSize: 13, color: T.mutedLight, lineHeight: 1.75, whiteSpace: "pre-line" }}>{brief}</div>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 0", color: T.muted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>☀️</div>
              <div style={{ fontSize: 13 }}>Generate your daily brief — news, trends, priorities, a hook.</div>
            </div>
          )}
        </Card>

        {/* Quick Capture */}
        <Card>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", marginBottom: 12 }}>QUICK CAPTURE</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => openCapture("task")} style={{ flex: 1 }}>+ Task</Btn>
            <Btn onClick={() => openCapture("content")} variant="wine" style={{ flex: 1 }}>+ Content Idea</Btn>
            <Btn onClick={() => openCapture("note")} variant="ghost" style={{ flex: 1 }}>+ Note</Btn>
          </div>
        </Card>
      </div>

      {/* Right — Tasks */}
      <div style={{ width: 310, flexShrink: 0 }}>
        <Card style={{ height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.cream }}>Today's Focus</div>
            <span style={{ fontSize: 11, color: T.muted }}>{pending.length} left</span>
          </div>

          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: T.muted, fontSize: 13 }}>
              Clear queue. Add something or take the win.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {pending.map(t => (
                <div key={t.id} onClick={() => onToggleTask(t.id)} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 8px", borderRadius: 8, cursor: "pointer",
                  transition: "background 0.15s",
                  borderBottom: `1px solid ${T.border}`,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, marginTop: 2,
                    border: `2px solid ${T.borderLight}`, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.cream }}>{t.title}</div>
                    {t.hub && t.hub !== "dashboard" && (
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                        {HUBS.find(h => h.id === t.hub)?.icon} {HUBS.find(h => h.id === t.hub)?.label}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 11, color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: T.green }}>✓</span> {done.length} done today
            </div>
          )}

          <Btn onClick={() => openCapture("task")} variant="soft" style={{ width: "100%", marginTop: 16 }}>
            + Add Task
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── CONTENT HUB ─────────────────────────────────────────────────────────────
function ContentHub() {
  const [sub, setSub] = useState("iterate");
  const [bucket, setBucket] = useState("mentor_minutes");
  const [hooks, setHooks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [newHook, setNewHook] = useState("");
  const [newIdea, setNewIdea] = useState({ title: "", notes: "" });
  const [working, setWorking] = useState({ works: "", doesnt: "", metrics: "" });
  const [scraperIn, setScraperIn] = useState("");
  const [scraperOut, setScraperOut] = useState("");
  const [scraperLoading, setScraperLoading] = useState(false);
  const chatEnd = useRef(null);
  const B = BUCKETS.find(b => b.id === bucket);

  useEffect(() => {
    Promise.all([
      store.get("hooks"), store.get("content_ideas"),
      store.get("content_working"), store.get("content_chat"),
    ]).then(([h, i, w, c]) => {
      if (h) setHooks(h);
      if (i) setIdeas(i);
      if (w) setWorking(w);
      if (c) setChat(c);
    });
  }, []);

  useEffect(() => { store.set("hooks", hooks); }, [hooks]);
  useEffect(() => { store.set("content_ideas", ideas); }, [ideas]);
  useEffect(() => { store.set("content_working", working); }, [working]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const addHook = () => {
    if (!newHook.trim()) return;
    setHooks(p => [{ id: Date.now(), text: newHook, bucket, createdAt: new Date().toISOString() }, ...p]);
    setNewHook("");
  };

  const addIdea = () => {
    if (!newIdea.title.trim()) return;
    setIdeas(p => [{ id: Date.now(), ...newIdea, bucket, createdAt: new Date().toISOString() }, ...p]);
    setNewIdea({ title: "", notes: "" });
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoading) return;
    const msg = chatIn; setChatIn(""); setChatLoading(true);
    const next = [...chat, { role: "user", content: msg }];
    setChat(next);
    try {
      const res = await askClaude(
        `Current bucket context: ${B?.label} (${B?.account}). ${msg}`,
        chat.slice(-10)
      );
      const final = [...next, { role: "assistant", content: res }];
      setChat(final);
      store.set("content_chat", final);
    } catch { setChat(p => [...p, { role: "assistant", content: "Ran into an issue — try again." }]); }
    setChatLoading(false);
  };

  const scrapeContent = async () => {
    if (!scraperIn.trim()) return;
    setScraperLoading(true);
    try {
      const res = await askClaude(
        `Tiff wants to extract content ideas from the following text/transcript for her social media. 
Transform this for her specific buckets. Be specific about which bucket each idea fits.
Give her:
1. The core insight/message (1 sentence)
2. 3 hooks she could use (her voice, not generic)
3. Which bucket(s) this fits best and why
4. One specific video angle she should make from this

Source content:
${scraperIn}`,
        []
      );
      setScraperOut(res);
    } catch { setScraperOut("Couldn't process — try again."); }
    setScraperLoading(false);
  };

  const SUBS = [
    { id: "iterate", label: "✨ Iterate w/ AI" },
    { id: "hooks", label: "🪝 Hooks DB" },
    { id: "ideas", label: "💡 Ideas Bank" },
    { id: "working", label: "📊 What's Working" },
    { id: "extractor", label: "🎬 Content Extractor" },
    { id: "dataDoc", label: "📋 Main Data Doc" },
  ];

  const BucketBar = () => (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      {BUCKETS.map(b => <BucketPill key={b.id} bucket={b.id} selected={bucket === b.id} onClick={() => setBucket(b.id)} />)}
    </div>
  );

  if (sub === "iterate") return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <BucketBar />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 4 }}>
        {chat.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>✨</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.cream, marginBottom: 6 }}>Your AI Content Partner</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>Pitch ideas, get hooks, iterate scripts — I know your brand.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 600, margin: "0 auto" }}>
              {[
                "Give me 5 hooks for Mentor Minutes",
                "Help me write a 'Respectfully No' script",
                "What content can I make about not knowing my future?",
                "Is my branding direction clear? Let's talk.",
                "Turn this idea into a video: [paste your idea]",
              ].map(s => (
                <button key={s} onClick={() => setChatIn(s)} style={{
                  background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20,
                  padding: "6px 14px", color: T.muted, fontSize: 12,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className="fade-in" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "72%",
              background: m.role === "user" ? T.wine : T.card,
              border: `1px solid ${m.role === "user" ? T.wine + "88" : T.border}`,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "12px 16px", fontSize: 13, color: T.cream,
              lineHeight: 1.7, whiteSpace: "pre-line",
            }}>{m.content}</div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: "flex", gap: 5, padding: 16, alignItems: "center" }}>
            <div className="dot" /><div className="dot" /><div className="dot" />
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
        <Inp value={chatIn} onChange={e => setChatIn(e.target.value)} placeholder={`Working on ${B?.label}... pitch an idea, ask for hooks, get feedback`}
          multiline rows={2} style={{ flex: 1 }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Btn onClick={sendChat} disabled={chatLoading || !chatIn.trim()}>Send</Btn>
          {chat.length > 0 && <Btn onClick={() => { setChat([]); store.set("content_chat", []); }} variant="ghost" small>Clear</Btn>}
        </div>
      </div>
    </div>
  );

  if (sub === "hooks") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <BucketBar />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Inp value={newHook} onChange={e => setNewHook(e.target.value)} placeholder={`Hook for ${B?.label}...`} style={{ flex: 1 }}
          onKeyDown={e => e.key === "Enter" && addHook()} />
        <Btn onClick={addHook}>Save Hook</Btn>
      </div>
      {hooks.filter(h => h.bucket === bucket).length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🪝</div>
          <div style={{ color: T.muted, fontSize: 13 }}>No hooks saved for {B?.label} yet</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {hooks.filter(h => h.bucket === bucket).map(h => (
            <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 14, color: T.cream, flex: 1, fontStyle: "italic" }}>"{h.text}"</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: T.muted }}>{new Date(h.createdAt).toLocaleDateString()}</span>
                <Btn onClick={() => setHooks(p => p.filter(x => x.id !== h.id))} variant="danger" small>✕</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (sub === "ideas") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <BucketBar />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 12 }}>NEW IDEA</div>
        <Inp value={newIdea.title} onChange={e => setNewIdea(p => ({ ...p, title: e.target.value }))} placeholder="Idea title or hook..." style={{ marginBottom: 8 }} />
        <Inp value={newIdea.notes} onChange={e => setNewIdea(p => ({ ...p, notes: e.target.value }))} placeholder="Notes, angles, rough script..." multiline rows={3} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <Btn onClick={addIdea}>Save Idea</Btn>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ideas.filter(i => i.bucket === bucket).map(i => (
          <Card key={i.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 14, color: T.cream, fontWeight: 500 }}>{i.title}</div>
              <Btn onClick={() => setIdeas(p => p.filter(x => x.id !== i.id))} variant="danger" small>✕</Btn>
            </div>
            {i.notes && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{i.notes}</div>}
            <div style={{ marginTop: 8 }}><Tag label={B?.label} color={B?.color} small /></div>
          </Card>
        ))}
        {ideas.filter(i => i.bucket === bucket).length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: T.muted, fontSize: 13 }}>No ideas for {B?.label} yet</div>
        )}
      </div>
    </div>
  );

  if (sub === "working") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <div style={{ display: "flex", gap: 20 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.green, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 10 }}>✓ WHAT'S WORKING</div>
          <Inp value={working.works} onChange={e => setWorking(p => ({ ...p, works: e.target.value }))} placeholder="Formats, hooks, topics that are landing..." multiline rows={6} />
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.wine, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 10 }}>✗ WHAT'S NOT WORKING</div>
          <Inp value={working.doesnt} onChange={e => setWorking(p => ({ ...p, doesnt: e.target.value }))} placeholder="Honest log. No judgment. What flopped or felt off?" multiline rows={6} />
        </Card>
      </div>
      <Card style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 10 }}>📊 METRICS & NOTES</div>
        <Inp value={working.metrics} onChange={e => setWorking(p => ({ ...p, metrics: e.target.value }))} placeholder="View counts, follower growth, engagement notes..." multiline rows={4} />
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <Btn onClick={() => store.set("content_working", working)}>Save</Btn>
      </div>
    </div>
  );

  if (sub === "extractor") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <div style={{ marginBottom: 8, color: T.mutedLight, fontSize: 13 }}>
        Paste a YouTube description, transcript, article, or any text — Claude will extract content ideas for your exact buckets.
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <Inp value={scraperIn} onChange={e => setScraperIn(e.target.value)} placeholder="Paste transcript, article, video description, podcast notes..." multiline rows={12} />
          <Btn onClick={scrapeContent} disabled={scraperLoading || !scraperIn.trim()} style={{ marginTop: 10, width: "100%" }}>
            {scraperLoading ? "Extracting..." : "🎬 Extract Content Ideas"}
          </Btn>
        </div>
        <div style={{ flex: 1 }}>
          {scraperOut ? (
            <Card style={{ whiteSpace: "pre-line", fontSize: 13, color: T.mutedLight, lineHeight: 1.75, height: "100%" }}>
              {scraperOut}
            </Card>
          ) : (
            <Card style={{ textAlign: "center", padding: 48, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: T.muted, fontSize: 13 }}>Content ideas will appear here</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  if (sub === "dataDoc") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <DataDoc />
    </div>
  );

  return <div><SubNav items={SUBS} active={sub} setActive={setSub} /></div>;
}

// ─── MAIN DATA DOC ────────────────────────────────────────────────────────────
function DataDoc() {
  const [doc, setDoc] = useState({
    mission: "For women told to shrink — this is the big sister voice they needed.\n\nTiff Lavoie. Building in public. Figuring it out out loud.",
    voice: "Big sister who has their shit together but secretly doesn't.\nDirect. Warm. Witty. Never preachy.\n\nPhrases that hit:\n• \"Respectfully, no.\"\n• \"You were never too much. You were just in the wrong room.\"\n• \"Build in public. Stumble in public. Grow in public.\"",
    buckets: BUCKETS.map(b => `${b.emoji} ${b.label} (${b.account})\n`).join("\n"),
    confinements: "• Not toxic positivity — keep it real\n• Not LinkedIn-polished — unscripted converts better for Tiff\n• Not giving advice she hasn't lived\n• Not hiding the uncertainty — it's the story\n• Not separated from the brand — she IS the brand right now",
    audience: "Women told to shrink, shush, calm down. Ambitious, emotional, building something.\nThey need: permission, validation, tactical advice, a mirror.\n\nThey are: early-career, college students, young professionals, women questioning big life decisions.",
  });

  useEffect(() => { store.get("data_doc").then(d => { if (d) setDoc(d); }); }, []);

  const sections = [
    { key: "mission", label: "🎯 MISSION", rows: 4 },
    { key: "audience", label: "👥 AUDIENCE", rows: 5 },
    { key: "voice", label: "🎤 BRAND VOICE & PHRASES", rows: 8 },
    { key: "buckets", label: "🪣 CONTENT BUCKETS", rows: 8 },
    { key: "confinements", label: "🚫 CONFINEMENTS (what we don't do)", rows: 6 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20, color: T.muted, fontSize: 13 }}>
        This is your source of truth for all content creation. Keep it updated.
      </div>
      {sections.map(s => (
        <Card key={s.key} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.gold, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", marginBottom: 10 }}>{s.label}</div>
          <Inp value={doc[s.key]} onChange={e => setDoc(p => ({ ...p, [s.key]: e.target.value }))} multiline rows={s.rows} />
        </Card>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={() => store.set("data_doc", doc)}>Save Document</Btn>
      </div>
    </div>
  );
}

// ─── BRAND HUB ────────────────────────────────────────────────────────────────
function BrandHub() {
  const [sub, setSub] = useState("clarity");
  const [docs, setDocs] = useState({
    clarity: "## Where I'm Stuck\n[Write it out — what's the core confusion about Vixens N Darlings?]\n\n## What I Know For Sure\n• Women's empowerment is the through-line\n• The brand should feel like a community, not just products\n• [Add what feels true]\n\n## Possible Directions\n1. Clothing brand first, build the community around it\n2. Content/community first, merch is secondary\n3. Platform-first: the forum/space is the product, everything else supports it\n\n## The Question I Need to Answer\n[What's the one decision that would unlock clarity?]",
    bizPlan: "## Business Overview\n[What is VnD, in one paragraph]\n\n## Revenue Streams\n1. \n2. \n3. \n\n## Timeline\n- Now: \n- 6 months: \n- 1 year: \n\n## Resources Needed\n",
    marketing: "## Channels\n\n## Messaging\n\n## Launch Strategy\n",
    strategy: "## Competitive Landscape\n\n## Differentiation\n\n## Key Partnerships\n",
    files: "## Important Links & Files\n[Paste drive links, Canva links, etc.]\n",
  });
  const [ai, setAI] = useState({ input: "", output: "", loading: false });

  useEffect(() => { store.get("brand_docs").then(d => { if (d) setDocs(d); }); }, []);

  const SUBS = [
    { id: "clarity", label: "🔍 Brand Clarity" },
    { id: "bizPlan", label: "📋 Biz Plan" },
    { id: "marketing", label: "📣 Marketing" },
    { id: "strategy", label: "♟️ Strategy" },
    { id: "files", label: "📁 Files & Links" },
    { id: "aiHelper", label: "✨ AI Helper" },
  ];

  const askBrandAI = async () => {
    if (!ai.input.trim()) return;
    setAI(p => ({ ...p, loading: true }));
    const res = await askClaude(
      `Help Tiff with her brand Vixens N Darlings. Context: She's stuck on the vision — it could be clothing, podcasts, planners, phone cases, charms, a forum for empowerment. She's unsure. She needs help clarifying direction, not just validating whatever she says.
      
Her question/request: ${ai.input}

Be her strategic partner. Ask back if you need to. Give concrete, actionable next steps, not vague inspiration.`,
      []
    );
    setAI(p => ({ ...p, output: res, loading: false }));
  };

  if (sub === "aiHelper") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <SectionTitle>Brand AI Partner</SectionTitle>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <Inp value={ai.input} onChange={e => setAI(p => ({ ...p, input: e.target.value }))}
            placeholder="Ask anything about VnD — strategy, naming, positioning, 'what should I focus on', 'am I overthinking this'..."
            multiline rows={8} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn onClick={askBrandAI} disabled={ai.loading || !ai.input.trim()}>
              {ai.loading ? "Thinking..." : "Ask"}
            </Btn>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {ai.output ? (
            <Card style={{ whiteSpace: "pre-line", fontSize: 13, color: T.mutedLight, lineHeight: 1.75 }}>{ai.output}</Card>
          ) : (
            <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
              <div style={{ color: T.muted, fontSize: 13, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👗</div>
                Strategy, clarity, naming, positioning — ask anything about VnD.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <SectionTitle>Vixens N Darlings</SectionTitle>
      <Card>
        <div style={{ fontSize: 10, color: T.wine, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", marginBottom: 12 }}>
          {SUBS.find(s => s.id === sub)?.label?.toUpperCase()}
        </div>
        <Inp value={docs[sub] || ""} onChange={e => setDocs(p => ({ ...p, [sub]: e.target.value }))} multiline rows={16} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Btn onClick={() => store.set("brand_docs", docs)}>Save</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── COLLEGE HUB ──────────────────────────────────────────────────────────────
function CollegeHub() {
  const [sub, setSub] = useState("internships");
  const [internships, setInternships] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [certs, setCerts] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", status: "Researching", deadline: "", notes: "" });

  useEffect(() => {
    Promise.all([store.get("internships"), store.get("scholarships"), store.get("certs")]).then(([i, s, c]) => {
      if (i) setInternships(i); if (s) setScholarships(s); if (c) setCerts(c);
    });
  }, []);

  const STATUS_COLORS = { Researching: T.muted, Applied: T.blue, Interview: T.gold, Offer: T.green, Rejected: T.wine, Completed: T.green };

  const SUBS = [
    { id: "internships", label: "💼 Internships" },
    { id: "scholarships", label: "💰 Scholarships" },
    { id: "certs", label: "📜 Certificates" },
    { id: "decisions", label: "🗺️ Post-Grad Decisions" },
  ];

  const [decisions, setDecisions] = useState("## The Fork\n- Thunderbird Global MBA (admitted)\n- Law school (waitlist)\n- Brand / Vixens N Darlings full-time\n\n## What matters most to me:\n\n## Pros/Cons for each path:\n\n## What I need to decide by:\n");
  useEffect(() => { store.get("decisions").then(d => { if (d) setDecisions(d); }); }, []);

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const item = { id: Date.now(), ...newItem, createdAt: new Date().toISOString() };
    if (sub === "internships") { const u = [item, ...internships]; setInternships(u); store.set("internships", u); }
    else if (sub === "scholarships") { const u = [item, ...scholarships]; setScholarships(u); store.set("scholarships", u); }
    else if (sub === "certs") { const u = [item, ...certs]; setCerts(u); store.set("certs", u); }
    setNewItem({ title: "", status: "Researching", deadline: "", notes: "" });
  };

  const items = sub === "internships" ? internships : sub === "scholarships" ? scholarships : certs;
  const setItems = sub === "internships" ? setInternships : sub === "scholarships" ? setScholarships : setCerts;
  const storeKey = sub;

  const STATUSES = sub === "certs"
    ? ["In Progress", "Completed", "Planned"]
    : ["Researching", "Applied", "Interview", "Offer", "Rejected"];

  if (sub === "decisions") return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <SectionTitle>Post-Grad Decisions</SectionTitle>
      <Card>
        <Inp value={decisions} onChange={e => setDecisions(e.target.value)} multiline rows={16} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Btn onClick={() => store.set("decisions", decisions)}>Save</Btn>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <SectionTitle>{SUBS.find(s => s.id === sub)?.label}</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Inp value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
            placeholder={`Add ${sub === "internships" ? "company/role" : sub === "scholarships" ? "scholarship name" : "certificate name"}...`} style={{ flex: "1 1 200px" }} />
          <select value={newItem.status} onChange={e => setNewItem(p => ({ ...p, status: e.target.value }))} style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
            color: T.cream, padding: "9px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer"
          }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <Inp value={newItem.deadline} onChange={e => setNewItem(p => ({ ...p, deadline: e.target.value }))}
            placeholder="Deadline (optional)" style={{ flex: "1 1 140px" }} />
          <Btn onClick={addItem}>Add</Btn>
        </div>
      </Card>
      {items.map(item => (
        <Card key={item.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 14, color: T.cream }}>{item.title}</div>
              <Tag label={item.status} color={STATUS_COLORS[item.status] || T.muted} small />
            </div>
            {item.deadline && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>📅 {item.deadline}</div>}
          </div>
          <Btn onClick={() => { const u = items.filter(x => x.id !== item.id); setItems(u); store.set(storeKey, u); }} variant="danger" small>✕</Btn>
        </Card>
      ))}
      {items.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13 }}>Nothing added yet.</div>}
    </div>
  );
}

// ─── SCIENCE HUB ──────────────────────────────────────────────────────────────
function ScienceHub() {
  const [sub, setSub] = useState("skincare");
  const SUBS = [
    { id: "skincare", label: "✨ Skincare" },
    { id: "nutrition", label: "🥗 Nutrition" },
    { id: "health", label: "💊 Health + Vitamins" },
    { id: "workouts", label: "💪 Workouts" },
    { id: "cycle", label: "🌙 Hormones + Cycle" },
    { id: "hair", label: "💇 Haircare" },
  ];

  const [notes, setNotes] = useState({
    skincare: "", nutrition: "", health: "", workouts: "", cycle: "", hair: "",
  });
  const [aiQ, setAiQ] = useState({ q: "", a: "", loading: false });

  useEffect(() => { store.get("science_notes").then(n => { if (n) setNotes(n); }); }, []);

  const askScience = async () => {
    if (!aiQ.q.trim()) return;
    setAiQ(p => ({ ...p, loading: true }));
    const res = await askClaude(
      `Tiff is asking about ${sub} for her own health knowledge and also potentially as content for her education account. 
Question: ${aiQ.q}

Give her:
1. The actual science-backed answer (clear, not dumbed down)
2. One "content angle" — how she could turn this into a video for her education/science bucket

Keep it direct and useful.`,
      []
    );
    setAiQ(p => ({ ...p, a: res, loading: false }));
  };

  return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <SectionTitle>{SUBS.find(s => s.id === sub)?.label} Notes</SectionTitle>
          <Card>
            <Inp value={notes[sub]} onChange={e => setNotes(p => ({ ...p, [sub]: e.target.value }))}
              placeholder={`Notes on ${sub}... products, routines, research, what's working...`} multiline rows={12} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <Btn onClick={() => store.set("science_notes", notes)}>Save</Btn>
            </div>
          </Card>
        </div>
        <div style={{ width: 340, flexShrink: 0 }}>
          <SectionTitle>🔬 Ask the Science</SectionTitle>
          <Card>
            <Inp value={aiQ.q} onChange={e => setAiQ(p => ({ ...p, q: e.target.value }))}
              placeholder={`Ask anything about ${sub}...`} multiline rows={4} />
            <Btn onClick={askScience} disabled={aiQ.loading || !aiQ.q.trim()} style={{ marginTop: 10, width: "100%" }}>
              {aiQ.loading ? "Researching..." : "Ask"}
            </Btn>
            {aiQ.a && (
              <div style={{ marginTop: 14, fontSize: 12, color: T.mutedLight, lineHeight: 1.75, whiteSpace: "pre-line" }}>
                {aiQ.a}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── AI HUB ───────────────────────────────────────────────────────────────────
function AIHub() {
  const [sub, setSub] = useState("prompts");
  const [items, setItems] = useState({ prompts: [], ideas: [], workflows: [] });
  const [newItem, setNewItem] = useState({ title: "", content: "" });

  useEffect(() => { store.get("ai_hub").then(d => { if (d) setItems(d); }); }, []);

  const SUBS = [
    { id: "prompts", label: "📝 Prompts" },
    { id: "ideas", label: "💡 AI Ideas" },
    { id: "workflows", label: "⚙️ Workflows" },
  ];

  const add = () => {
    if (!newItem.title.trim()) return;
    const item = { id: Date.now(), ...newItem, createdAt: new Date().toISOString() };
    const updated = { ...items, [sub]: [item, ...items[sub]] };
    setItems(updated);
    store.set("ai_hub", updated);
    setNewItem({ title: "", content: "" });
  };

  return (
    <div className="fade-in">
      <SubNav items={SUBS} active={sub} setActive={setSub} />
      <SectionTitle>{SUBS.find(s => s.id === sub)?.label}</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <Inp value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
          placeholder={`${sub === "prompts" ? "Prompt name" : sub === "ideas" ? "AI idea" : "Workflow name"}...`} style={{ marginBottom: 8 }} />
        <Inp value={newItem.content} onChange={e => setNewItem(p => ({ ...p, content: e.target.value }))}
          placeholder="Content, instructions, details..." multiline rows={3} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <Btn onClick={add}>Save</Btn>
        </div>
      </Card>
      {items[sub].map(item => (
        <Card key={item.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 14, color: T.cream, fontWeight: 500, marginBottom: 6 }}>{item.title}</div>
            <Btn onClick={() => {
              const updated = { ...items, [sub]: items[sub].filter(x => x.id !== item.id) };
              setItems(updated); store.set("ai_hub", updated);
            }} variant="danger" small>✕</Btn>
          </div>
          {item.content && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{item.content}</div>}
        </Card>
      ))}
      {items[sub].length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13 }}>Nothing saved yet.</div>}
    </div>
  );
}

// ─── QUICK CAPTURE MODAL ─────────────────────────────────────────────────────
function CaptureModal({ type, onClose, onSave, currentHub }) {
  const [text, setText] = useState("");
  const [bucket, setBucket] = useState("mentor_minutes");
  const [hub, setHub] = useState(currentHub || "dashboard");

  const save = () => {
    if (!text.trim()) return;
    onSave({ type, text, bucket, hub });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000BB", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, width: 500, maxWidth: "90vw" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: T.cream, marginBottom: 18 }}>
          {type === "task" ? "New Task" : type === "content" ? "Content Idea" : "Quick Note"}
        </div>

        <Inp value={text} onChange={e => setText(e.target.value)} placeholder={
          type === "task" ? "What needs to get done?" :
          type === "content" ? "Hook, idea, script snippet..." :
          "Capture the thought..."
        } multiline rows={3} />

        {type === "content" && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 8 }}>BUCKET</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {BUCKETS.map(b => <BucketPill key={b.id} bucket={b.id} selected={bucket === b.id} onClick={() => setBucket(b.id)} />)}
            </div>
          </div>
        )}

        {type === "task" && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", marginBottom: 8 }}>HUB</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {HUBS.map(h => (
                <button key={h.id} onClick={() => setHub(h.id)} style={{
                  background: hub === h.id ? `${T.gold}22` : "transparent",
                  color: hub === h.id ? T.gold : T.muted,
                  border: `1px solid ${hub === h.id ? T.gold + "66" : T.border}`,
                  borderRadius: 20, padding: "4px 12px", fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s",
                }}>{h.icon} {h.label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <Btn onClick={onClose} variant="ghost">Cancel</Btn>
          <Btn onClick={save} onKeyDown={e => e.key === "Enter" && save()}>Save</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function TiffanyBrain() {
  const [hub, setHub] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [capture, setCapture] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    Promise.all([store.get("tasks"), store.get("content_ideas_global")]).then(([t, c]) => {
      if (t) setTasks(t);
      if (c) setContentIdeas(c);
    });
  }, []);

  const handleSave = ({ type, text, bucket, hub: taskHub }) => {
    if (type === "task") {
      const item = { id: Date.now(), title: text, hub: taskHub, done: false, createdAt: new Date().toISOString() };
      const updated = [item, ...tasks];
      setTasks(updated);
      store.set("tasks", updated);
    } else if (type === "content") {
      const item = { id: Date.now(), title: text, bucket, createdAt: new Date().toISOString() };
      const updated = [item, ...contentIdeas];
      setContentIdeas(updated);
      store.set("content_ideas_global", updated);
      // also push into content hub ideas
      store.get("content_ideas").then(existing => {
        const all = existing || [];
        store.set("content_ideas", [item, ...all]);
      });
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    store.set("tasks", updated);
  };

  const pendingCount = tasks.filter(t => !t.done).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <StyleInjector />

      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? 60 : 220,
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        padding: sidebarCollapsed ? "28px 10px" : "28px 14px",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28, paddingLeft: sidebarCollapsed ? 0 : 4, display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between" }}>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: T.gold, letterSpacing: "0.02em" }}>Tiff's Brain</div>
              <div style={{ fontSize: 9, color: T.muted, marginTop: 1, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em" }}>SECOND BRAIN · v2</div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(p => !p)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: 4, borderRadius: 6, flexShrink: 0 }}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        {HUBS.map(h => (
          <button key={h.id} onClick={() => setHub(h.id)} style={{
            display: "flex", alignItems: "center",
            gap: sidebarCollapsed ? 0 : 10,
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            padding: sidebarCollapsed ? "10px 0" : "9px 10px",
            borderRadius: 8, marginBottom: 2,
            background: hub === h.id ? `${T.gold}18` : "transparent",
            border: hub === h.id ? `1px solid ${T.gold}33` : "1px solid transparent",
            color: hub === h.id ? T.gold : T.muted,
            fontSize: hub === h.id ? 13 : 13, fontFamily: "'DM Sans', sans-serif",
            fontWeight: hub === h.id ? 500 : 400,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            overflow: "hidden", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{h.icon}</span>
            {!sidebarCollapsed && h.label}
          </button>
        ))}

        {/* Footer */}
        {!sidebarCollapsed && (
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <button onClick={() => setCapture("task")} style={{
              width: "100%", background: `${T.gold}15`, border: `1px solid ${T.gold}33`,
              borderRadius: 8, padding: "8px 10px", color: T.gold, fontSize: 12,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginBottom: 6,
            }}>
              + Quick Capture
            </button>
            <div style={{ fontSize: 11, color: T.muted, paddingLeft: 4 }}>
              {pendingCount} task{pendingCount !== 1 ? "s" : ""} pending
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: T.cream, lineHeight: 1 }}>
                {HUBS.find(h => h.id === hub)?.icon} {HUBS.find(h => h.id === hub)?.label}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => setCapture("content")} variant="wine" small>+ Content Idea</Btn>
              <Btn onClick={() => setCapture("task")} variant="soft" small>+ Task</Btn>
            </div>
          </div>

          {/* Hub Views */}
          {hub === "dashboard" && <DashboardHub tasks={tasks} onToggleTask={toggleTask} openCapture={setCapture} />}
          {hub === "content" && <ContentHub />}
          {hub === "brand" && <BrandHub />}
          {hub === "college" && <CollegeHub />}
          {hub === "science" && <ScienceHub />}
          {hub === "ai" && <AIHub />}
        </div>
      </div>

      {/* Global Capture Modal */}
      {capture && (
        <CaptureModal
          type={capture === "note" ? "note" : capture}
          onClose={() => setCapture(null)}
          onSave={handleSave}
          currentHub={hub}
        />
      )}
    </div>
  );
}
