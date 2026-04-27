'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Sparkles, Brain, ListChecks,
  CheckSquare, Lightbulb, TrendingUp, Download, Loader2,
  ArrowLeft, Clock, AlertCircle, Trash2,
  Search, MessageCircle, LogOut
} from 'lucide-react';

// 100 motivational phrases — one rotates daily
const DAILY_PHRASES = [
  "The only way out is through.",
  "Fall seven times, stand up eight.",
  "The wall is not the wall — it's the test.",
  "Persistence is a quiet rebellion.",
  "Quitters never realise how close they were.",
  "You don't have to be great to start. You have to start to be great.",
  "Pressure is a privilege.",
  "Every no moves you closer to yes.",
  "Diamonds are made under pressure.",
  "The harder the climb, the better the view.",
  "The dream is free. The hustle is sold separately.",
  "What you persist in, you become.",
  "Slow progress is still progress.",
  "Storms make trees take deeper roots.",
  "The cave you fear holds the treasure you seek.",
  "Motion creates emotion.",
  "Action defeats fear, every single time.",
  "Start before you're ready.",
  "Begin. The rest will follow.",
  "Move like the future depends on it — because it does.",
  "Energy is the currency of greatness.",
  "Today is the only day you actually have.",
  "Momentum is a muscle.",
  "Be the spark, not the spectator.",
  "Show up. Suit up. Go.",
  "Tiny actions, massive lives.",
  "The work begins now.",
  "Discipline is the bridge between goals and results.",
  "Make peace with the grind.",
  "Rise and shine, then rise again.",
  "Keep going. You're not done yet.",
  "The comeback is always stronger than the setback.",
  "Bend, don't break.",
  "You've survived 100% of your hard days.",
  "Carry the weight. Build the strength.",
  "This too shall pass — and you'll be wiser for it.",
  "Grit is patience with teeth.",
  "The strongest oak grows in the strongest wind.",
  "You are not behind. You are becoming.",
  "Hard days build legendary lives.",
  "Pain is the price of admission to growth.",
  "What doesn't kill you sharpens you.",
  "Press on. Always press on.",
  "Healing happens in the doing.",
  "Rest, then return.",
  "Today is a gift. Unwrap it.",
  "Notice the small wonders.",
  "Gratitude turns what you have into enough.",
  "Life is not a problem to solve. It's a gift to live.",
  "Be where your feet are.",
  "The best moments are made, not waited for.",
  "Joy is a discipline.",
  "Look up. The sky is yours.",
  "Live like you mean it.",
  "The ordinary is extraordinary if you let it be.",
  "You are the answer you've been searching for.",
  "Trust the version of you that did the work.",
  "You are not too late. You are right on time.",
  "Believe before you see — then you'll see.",
  "The cape was inside you all along.",
  "You were built for this moment.",
  "Bet on yourself. Always.",
  "Doubt kills more dreams than failure ever will.",
  "You have everything you need to begin.",
  "Speak to yourself like someone you love.",
  "Done is better than perfect.",
  "The work is the reward.",
  "Decide. Commit. Execute. Repeat.",
  "Strategy without action is just trivia.",
  "Do the thing you fear — the death of fear is certain.",
  "Stop waiting for the right moment. Make it.",
  "The expert was once a beginner who didn't quit.",
  "Show up before the muse does.",
  "Take the next right step. That's the whole game.",
  "Hard work beats talent when talent doesn't work hard.",
  "Discipline is choosing what you want most over what you want now.",
  "Build the life you don't need a vacation from.",
  "Small daily improvements compound into stunning results.",
  "Get it done. Get it polished. Get it shipped.",
  "The how reveals itself in the doing.",
  "Plant seeds you may never see grow.",
  "Trust the process even when you can't see it.",
  "The long game has the longest winners.",
  "Compound interest applies to character too.",
  "Patience is bitter, but its fruit is sweet.",
  "Slow is smooth. Smooth is fast.",
  "If you don't like where you are, move — patiently.",
  "The harvest comes for those who keep planting.",
  "Stay the course. Hold the line.",
  "Years from now, today will matter.",
  "Leap. The net will appear.",
  "Courage is fear that has said its prayers and walked anyway.",
  "The cave is dark, but the gold is real.",
  "Risk one boring life for one extraordinary one.",
  "The view from the edge is always worth it.",
  "Be bold. The universe rewards the audacious.",
  "If it scares you, that's the direction.",
  "Comfort is the slow death of ambition.",
  "Burn the boats.",
  "You miss 100% of the shots you don't take."
];

const MODES = {
  vision: {
    id: 'vision',
    label: 'Vision Board',
    sublabel: "Where you're heading",
    icon: Sparkles,
    color: '#C9986A',
    bgGradient: 'linear-gradient(135deg, #FAF3E7 0%, #F5E6D3 100%)',
    placeholder: "What are you reaching for? Dreams, goals, the kind of life you're building...",
    systemPrompt: `You are a simple task capture tool. The user will dictate or type tasks, ideas, and reminders. Your only job is to extract every single item they mention and return it as a clean bulleted list. No headers, no tables, no categorization, no priorities, no analysis - just the list.

Format:
- [task 1]
- [task 2]
- [task 3]

Rules:
- Capture EVERY task or item mentioned, even those mentioned in passing
- Each item on its own line as a bullet point
- Keep the wording close to what they said - don't rephrase unnecessarily  
- Don't add anything that wasn't mentioned
- Don't number them, just use dashes
- No introduction, no summary, no closing statement - just the bullets
- If they mention a deadline or time, keep it inline with the task (e.g. "- Call mum by Friday")

That's it. Be a faithful capture tool, nothing more.
Use this exact markdown structure:

# Vision — [today's date]

## Core Vision
*One crystalline sentence capturing the essence.*

## Pillars
A table with 3-5 key themes:
| Pillar | What it means | Why it matters |

## 90-Day Anchors
For each pillar, 1-2 concrete near-term steps as a checklist.

## Identity Statement
"I am becoming the kind of person who..."

Be poetic but precise. No fluff.`
  },
  mindclear: {
    id: 'mindclear',
    label: 'Mind Clear',
    sublabel: 'Dump it, sort it',
    icon: Brain,
    color: '#7A8B6F',
    bgGradient: 'linear-gradient(135deg, #EFF2EA 0%, #DDE5D2 100%)',
    placeholder: "Brain dump. Everything that's on your mind right now. Don't edit.",
    systemPrompt: `The user has done a brain dump. They need clarity. Organise their tangled thoughts ruthlessly into this structure:

# Mind Clear — [today's date]

## Top 3 Priorities
A table:
| # | Priority | Why it matters now |

## Quick Wins (do today)
Checklist of small things that can be knocked out fast.

## Decisions Needed
Where they're stuck — frame each as a clear question.

## Park (defer or drop)
Things to consciously deprioritise this week.

## One-Line Summary
A single sentence: where their head should be today.

Be honest, not sycophantic.`
  },
  prioritise: {
    id: 'prioritise',
    label: 'Routines, Priorities & Rituals',
    sublabel: 'Your day, anchored',
    icon: ListChecks,
    color: '#8B6F9A',
    bgGradient: 'linear-gradient(135deg, #F1ECF5 0%, #E0D5E8 100%)',
    placeholder: "What's today shaping up to be? Anything specific to factor in — meetings, energy, mood, anything new since yesterday...",
    systemPrompt: `You are helping the user create their Daily Anchor — a combined view of their regular routines and rituals AND the priorities emerging from their recent thinking.

You will see RECENT JOURNAL CONTEXT below if the user has past entries. Use it to identify recurring themes, unfinished priorities, and what should carry forward into today. Pull these forward as concrete priorities, citing which entry they came from.

Use this exact markdown structure:

# Daily Anchor — [today's date]

## Routines & Rituals
The regular duties and rituals that should anchor today. Consider time of day and day of week. Mix work routines (content creation, client touchpoints, deep work blocks) with personal rituals (movement, reflection, breaks).

A table:
| Slot | Routine / Ritual | Why it matters |

## Emerging Priorities
Pulled from the user's recent journal entries — themes that have surfaced repeatedly, decisions still open, things parked but not done.

A table:
| Priority | Where it came from | Status |

## Today's Focused List
The clean, ordered list for today combining routines + emerging priorities + what the user shared in their input. Numbered, in suggested running order through the day.

## Today's One Thing
If everything else falls away, the single most important thing.

Be direct and pattern-aware — your job is to remind the user of what they've already told themselves matters.`
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks & Reminders',
    sublabel: 'Capture and structure',
    icon: CheckSquare,
    color: '#5C7B9C',
    bgGradient: 'linear-gradient(135deg, #E8EEF4 0%, #D1DDE8 100%)',
    placeholder: 'Tell me what needs doing — tasks, reminders, follow-ups, deadlines...',
    systemPrompt: `Extract every task or reminder from the user's input. Structure them cleanly.

# Tasks & Reminders — [today's date]

## Action List
A complete table:
| # | Task | When | Effort | Notes |

"When" = today / this week / this month / specific date.
"Effort" = quick (<15min) / focused (15-60min) / deep (1hr+).

## Reminders
Anything time-bound the user should not forget. Each as a single line with the trigger.

## Suggested Order
A short numbered list — what to tackle first, second, third.

Be exhaustive — capture everything mentioned, even in passing.`
  },
  brainstorm: {
    id: 'brainstorm',
    label: 'Brainstorm',
    sublabel: 'Generate options',
    icon: Lightbulb,
    color: '#C97A5C',
    bgGradient: 'linear-gradient(135deg, #FAEBE3 0%, #F5D5C4 100%)',
    placeholder: 'What are you thinking about? An idea, a problem, a question to crack open...',
    systemPrompt: `The user wants to brainstorm. Generate richly, then converge.

# Brainstorm — [today's date]

## The Question
Restate cleanly what they're actually trying to solve or explore.

## 7 Angles
A table:
| # | Angle | Quick description | Why it could work |

## 2 Unconventional Plays
Two left-field options most people would dismiss. Make them concrete.

## If I Were You
A short paragraph: which direction has the most juice and why.

## Next Step
One specific action to take in the next 24 hours.

Keep ideas concrete and applicable.`
  },
  salesengine: {
    id: 'salesengine',
    label: 'Sales Engine',
    sublabel: 'Revenue maximization',
    icon: TrendingUp,
    color: '#4A7C59',
    bgGradient: 'linear-gradient(135deg, #E8F2EB 0%, #D4E7D9 100%)',
    placeholder: 'What assets, apps, content, or capabilities do we have? How can we maximize revenue immediately?',
    systemPrompt: `You are helping the user maximize revenue using everything at their disposal. They want immediate, actionable income strategies considering their full ecosystem of assets, apps, team, content, and capabilities.

Think like a growth strategist focused on rapid revenue generation. Be ruthlessly practical.

Use this exact markdown structure:

# Sales Engine — [today's date]

## Current Assets Audit
Based on what the user shares, catalog:
| Asset Type | What we have | Current utilization | Untapped potential |

Include: apps/tools, content libraries, team skills, customer base, platforms, IP, partnerships.

## Immediate Revenue Plays (Next 7 Days)
Ranked table of highest-leverage opportunities:
| # | Play | Revenue potential | Effort required | First step |

Focus on: quick wins, low-hanging fruit, underutilized assets, quick product launches, pricing optimizations, upsells to existing customers.

## Strategic Moves (Next 30 Days)
Medium-term revenue opportunities:
| Opportunity | Why now | Resources needed | Expected impact |

## Pricing & Packaging Optimization
Any immediate adjustments to pricing, bundling, or offer structure that could increase revenue without new product development.

## Team Deployment
How to best deploy the team's time toward revenue generation:
- Who should focus on what
- What to stop doing
- What to double down on

## The One Thing
If you could only execute one revenue move this week, what would have the highest ROI?

## Next 24 Hours
Three concrete actions to take tomorrow morning.

Be aggressive, creative, and focused on speed-to-revenue. Question every assumption about what's possible.`
  }
};

// =============== Main Component ===============
export default function DailyCompanion() {
  const [view, setView] = useState('home');
  const [mode, setMode] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Load history from API
  useEffect(() => {
    fetch('/api/entries')
      .then((r) => r.json())
      .then((data) => {
        if (data.entries) {
          setHistory(data.entries.map(normalizeEntry));
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  function normalizeEntry(e) {
    const created = new Date(e.created_at);
    return {
      id: e.id,
      timestamp: created.getTime(),
      mode: e.mode,
      modeLabel: e.mode_label,
      input: e.input,
      output: e.output,
      date: created.toLocaleDateString('en-GB'),
      time: created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Voice recognition
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setInput((prev) => (prev ? prev + ' ' : '') + finalTranscript.trim());
      }
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error !== 'no-speech') setError(`Voice error: ${e.error}`);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch {} };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError('');
      } catch {
        setError('Could not start microphone. Check permissions.');
      }
    }
  };

  const selectMode = (modeId) => {
    setMode(MODES[modeId]);
    setInput('');
    setOutput('');
    setError('');
    setView('input');
  };

  const goHome = () => {
    if (isListening) { try { recognitionRef.current.stop(); } catch {}; setIsListening(false); }
    setView('home'); setMode(null); setInput(''); setOutput(''); setError('');
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.reload();
  };

  const processInput = async () => {
    if (!input.trim() || !mode) return;
    if (isListening) { try { recognitionRef.current.stop(); } catch {}; setIsListening(false); }
    setLoading(true);
    setError('');
    setOutput('');

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const today = `${dateStr} · ${timeStr}`;

    let contextBlock = '';
    if (mode.id === 'prioritise' && history.length > 0) {
      const recent = history.slice(0, 6).map((e) => {
        const inSnip = (e.input || '').slice(0, 280);
        const outSnip = (e.output || '').slice(0, 500);
        return `[${e.modeLabel} · ${e.date} ${e.time}]
INPUT: ${inSnip}${e.input.length > 280 ? '…' : ''}
OUTPUT EXCERPT: ${outSnip}${e.output.length > 500 ? '…' : ''}`;
      }).join('\n\n---\n\n');
      contextBlock = `\n\n=== RECENT JOURNAL CONTEXT ===\nThe user's last ${Math.min(6, history.length)} entries across other modes. Use these to spot recurring themes, unfinished priorities, decisions parked, and things that should carry forward into today's anchor:\n\n${recent}\n\n=== END CONTEXT ===\n`;
    }

    const fullPrompt = `${mode.systemPrompt.replace("[today's date]", today)}${contextBlock}

---

USER INPUT:
${input}

---

Now produce the structured output exactly as specified above. Use proper markdown including tables. Do not include any preamble — start directly with the H1 heading.`;

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!r.ok) {
        const j = await r.json();
        throw new Error(j.error || `API error: ${r.status}`);
      }
      const data = await r.json();
      setOutput(data.text);
      await saveEntry(data.text);
      setView('result');
    } catch (e) {
      setError(`Could not process — ${e.message}. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (outputText) => {
    try {
      const r = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode.id,
          modeLabel: mode.label,
          input,
          output: outputText,
        }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.entry) {
          setHistory((prev) => [normalizeEntry(j.entry), ...prev].slice(0, 200));
        }
      }
    } catch {}
  };

  const deleteEntryById = async (id) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {}
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Popup blocked. Allow popups to download PDF.');
      return;
    }
    const now = new Date();
    const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fullStamp = `${today} · ${timeStr}`;

    const html = `<!DOCTYPE html>
<html>
<head>
<title>${mode.label} — ${fullStamp}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600&display=swap');
  body { font-family: 'Geist', -apple-system, sans-serif; max-width: 720px; margin: 40px auto; padding: 40px; color: #2A2520; line-height: 1.7; background: #FDFBF7; }
  h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; color: #1a1410; font-weight: 600; }
  h1 { font-size: 32px; margin-bottom: 8px; border-bottom: 2px solid ${mode.color}; padding-bottom: 12px; }
  h2 { font-size: 22px; margin-top: 32px; color: ${mode.color}; }
  h3 { font-size: 18px; margin-top: 24px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }
  th, td { border: 1px solid #E5DDD0; padding: 10px 14px; text-align: left; vertical-align: top; }
  th { background: #F5EFE3; font-family: 'Fraunces', serif; font-weight: 600; color: #1a1410; }
  ul, ol { padding-left: 24px; }
  li { margin: 6px 0; }
  blockquote { border-left: 3px solid ${mode.color}; padding-left: 16px; color: #5a5048; font-style: italic; }
  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E5DDD0; color: #888; font-size: 12px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<div id="content"></div>
<div class="footer">Generated by your Daily Companion · ${fullStamp}</div>
<script>
  const md = ${JSON.stringify(output)};
  function mdToHtml(md) {
    let html = md;
    html = html.replace(/((?:^\\|.+\\|\\n?)+)/gm, (match) => {
      const rows = match.trim().split('\\n').filter(r => r.trim());
      if (rows.length < 2) return match;
      if (!rows[1].match(/^\\|[\\s\\-:|]+\\|$/)) return match;
      const headers = rows[0].split('|').slice(1, -1).map(h => h.trim());
      const bodyRows = rows.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
      let table = '<table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>';
      bodyRows.forEach(r => { table += '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>'; });
      table += '</tbody></table>';
      return table;
    });
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
    html = html.replace(/^- \\[ \\] (.+)$/gm, '<li>☐ $1</li>');
    html = html.replace(/^- \\[x\\] (.+)$/gmi, '<li>☑ $1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\\d+\\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\\/li>\\s*)+/gs, (m) => '<ul>' + m + '</ul>');
    html = html.split(/\\n\\n+/).map(block => {
      if (block.match(/^<(h\\d|ul|ol|table|blockquote)/)) return block;
      return '<p>' + block.replace(/\\n/g, '<br>') + '</p>';
    }).join('\\n');
    return html;
  }
  document.getElementById('content').innerHTML = mdToHtml(md);
  setTimeout(() => window.print(), 400);
</script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1612 0%, #0B0908 100%)',
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#F5F0E8',
      padding: '20px 16px',
      paddingBottom: '40px',
      overflow: 'hidden'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(circle 560px at 8% 0%, rgba(201, 152, 106, 0.32), transparent 65%),
          radial-gradient(circle 460px at 95% 12%, rgba(155, 122, 175, 0.24), transparent 65%),
          radial-gradient(circle 420px at 80% 95%, rgba(201, 122, 92, 0.22), transparent 65%),
          radial-gradient(circle 380px at 3% 78%, rgba(112, 145, 185, 0.20), transparent 65%),
          radial-gradient(circle 320px at 55% 50%, rgba(140, 165, 130, 0.14), transparent 65%)
        `
      }} />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 0.18,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'screen'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
        {view === 'home' && <HomeView selectMode={selectMode} history={history} setView={setView} historyLoaded={historyLoaded} logout={logout} />}
        {view === 'input' && (
          <InputView mode={mode} input={input} setInput={setInput} isListening={isListening} toggleVoice={toggleVoice} voiceSupported={voiceSupported} processInput={processInput} loading={loading} error={error} goHome={goHome} />
        )}
        {view === 'result' && (
          <ResultView mode={mode} output={output} input={input} downloadPDF={downloadPDF} goHome={goHome} error={error} />
        )}
        {view === 'history' && (
          <HistoryView history={history} deleteEntryById={deleteEntryById} goHome={goHome} setOutput={setOutput} setInput={setInput} setMode={setMode} setView={setView} />
        )}
        {view === 'search' && (
          <SearchView history={history} goHome={goHome} />
        )}
      </div>
    </div>
  );
}

// =============== Home View ===============
function HomeView({ selectMode, history, setView, historyLoaded, logout }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - startOfYear) / 86400000);
  const dailyPhrase = DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];

  return (
    <>
      <button
        onClick={logout}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '999px', padding: '8px 14px',
          color: 'rgba(245,240,232,0.7)', fontSize: '12px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'inherit', zIndex: 2,
        }}
      >
        <LogOut size={12} />
        Sign out
      </button>

      <header style={{ marginBottom: '40px', textAlign: 'center', paddingTop: '20px' }}>
        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245, 240, 232, 0.55)', margin: '0 0 12px', fontWeight: 500 }}>{dateStr}</p>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '38px', fontWeight: 500, margin: '0 0 8px', color: '#F8F4ED', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Good Morning Ayub!</h1>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '17px', color: 'rgba(245, 240, 232, 0.7)', margin: 0, fontWeight: 400 }}>Today is yours to shape.</p>
        <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-block', width: '24px', height: '1px', background: 'rgba(245, 240, 232, 0.25)' }} />
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '14px', color: 'rgba(245, 240, 232, 0.55)', margin: 0, fontWeight: 400, maxWidth: '420px' }}>{dailyPhrase}</p>
          <span style={{ display: 'inline-block', width: '24px', height: '1px', background: 'rgba(245, 240, 232, 0.25)' }} />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.values(MODES).map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => selectMode(m.id)}
              style={{
                background: m.bgGradient, border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px', padding: '22px 24px', cursor: 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '18px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: m.color }}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '20px', fontWeight: 500, color: '#1a1410', letterSpacing: '-0.01em', marginBottom: '2px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', color: '#6B5F4F', fontWeight: 400 }}>{m.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>

      {historyLoaded && (
        <div style={{ marginTop: '32px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setView('search')} style={pillStyle}>
            <Search size={14} /> Search past entries
          </button>
          {history.length > 0 && (
            <button onClick={() => setView('history')} style={pillStyle}>
              <Clock size={14} /> View past entries ({history.length})
            </button>
          )}
        </div>
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(245, 240, 232, 0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          Daily Companion
        </p>
      </footer>
    </>
  );
}

const pillStyle = {
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '999px',
  padding: '10px 20px', fontFamily: 'inherit', fontSize: '13px',
  color: 'rgba(245, 240, 232, 0.85)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 500,
};

// =============== Input View ===============
function InputView({ mode, input, setInput, isListening, toggleVoice, voiceSupported, processInput, loading, error, goHome }) {
  const Icon = mode.icon;
  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <button onClick={goHome} style={backStyle}><ArrowLeft size={16} /> Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: mode.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mode.color }}>
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 500, margin: 0, color: '#F8F4ED', letterSpacing: '-0.02em' }}>{mode.label}</h1>
            <p style={{ fontSize: '13px', color: 'rgba(245, 240, 232, 0.6)', margin: '2px 0 0' }}>{mode.sublabel}</p>
          </div>
        </div>
      </header>

      <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '20px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.18)' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode.placeholder}
          style={{ width: '100%', minHeight: '180px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '16px', lineHeight: 1.6, color: '#2A2520', padding: 0, boxSizing: 'border-box' }}
          autoFocus
        />
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'rgba(201, 122, 92, 0.08)', borderRadius: '10px', color: '#C97A5C', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: mode.color, display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
            Listening… speak naturally
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
        {voiceSupported && (
          <button onClick={toggleVoice} disabled={loading}
            style={{ width: '60px', height: '60px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.12)', background: isListening ? mode.color : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: isListening ? 'white' : '#F5F0E8', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', transition: 'all 0.2s ease', flexShrink: 0 }}>
            {isListening ? <MicOff size={22} strokeWidth={2} /> : <Mic size={22} strokeWidth={2} />}
          </button>
        )}
        <button onClick={processInput} disabled={loading || !input.trim()}
          style={{ flex: 1, height: '60px', borderRadius: '20px', border: 'none', background: input.trim() && !loading ? mode.color : 'rgba(255, 255, 255, 0.08)', color: input.trim() && !loading ? 'white' : 'rgba(245, 240, 232, 0.4)', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: "'Fraunces', Georgia, serif", fontSize: '17px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: input.trim() && !loading ? '0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.2s ease' }}>
          {loading ? (<><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Thinking…</>) : 'Process with Claude'}
        </button>
      </div>

      {!voiceSupported && (
        <p style={{ marginTop: '14px', fontSize: '12px', color: 'rgba(245, 240, 232, 0.5)', textAlign: 'center', fontStyle: 'italic' }}>Voice input not supported in this browser. Try Chrome or Safari.</p>
      )}

      {error && <ErrorBlock message={error} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
      `}</style>
    </>
  );
}

const backStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '6px',
  color: 'rgba(245, 240, 232, 0.65)', fontSize: '14px', padding: '8px 0',
  fontFamily: 'inherit',
};

function ErrorBlock({ message }) {
  return (
    <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(201, 92, 92, 0.08)', border: '1px solid rgba(201, 92, 92, 0.2)', borderRadius: '12px', color: '#E89A9A', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span>{message}</span>
    </div>
  );
}

// =============== Result View ===============
function ResultView({ mode, output, input, downloadPDF, goHome, error }) {
  const Icon = mode.icon;
  return (
    <>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={goHome} style={backStyle}><ArrowLeft size={16} /> Done</button>
        <button onClick={downloadPDF} style={{ background: mode.color, color: 'white', border: 'none', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: 'inherit', fontWeight: 500, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <Download size={16} /> Save as PDF
        </button>
      </header>

      <div style={{ background: mode.bgGradient, borderRadius: '24px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon size={18} color={mode.color} strokeWidth={1.8} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 500, color: '#1a1410' }}>{mode.label}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#7A6F5F', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255, 255, 255, 0.18)', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.2)' }}>
        <MarkdownRender text={output} accentColor={mode.color} />
      </div>

      <details style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '14px 18px', marginBottom: '16px', fontSize: '14px', color: 'rgba(245, 240, 232, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <summary style={{ cursor: 'pointer', fontFamily: "'Fraunces', serif", fontWeight: 500, color: '#F5F0E8' }}>Your original input</summary>
        <p style={{ marginTop: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{input}</p>
      </details>

      <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', fontSize: '12px', color: 'rgba(245, 240, 232, 0.55)', textAlign: 'center', fontStyle: 'italic' }}>
        Saved to your cloud library. Tap Save as PDF to download a copy.
      </div>

      {error && <ErrorBlock message={error} />}
    </>
  );
}

// =============== History View ===============
function HistoryView({ history, deleteEntryById, goHome, setOutput, setInput, setMode, setView }) {
  const openEntry = (entry) => {
    setMode(MODES[entry.mode]);
    setInput(entry.input);
    setOutput(entry.output);
    setView('result');
  };

  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <button onClick={goHome} style={backStyle}><ArrowLeft size={16} /> Back</button>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '32px', fontWeight: 500, margin: '12px 0 4px', color: '#F8F4ED', letterSpacing: '-0.02em' }}>Past Entries</h1>
        <p style={{ color: 'rgba(245, 240, 232, 0.6)', fontSize: '14px', margin: 0 }}>Your daily record</p>
      </header>

      {history.length === 0 ? (
        <p style={{ color: 'rgba(245, 240, 232, 0.5)', textAlign: 'center', padding: '40px' }}>No entries yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((entry) => {
            const m = MODES[entry.mode];
            if (!m) return null;
            const Icon = m.icon;
            return (
              <div key={entry.id} onClick={() => openEntry(entry)}
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: m.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 500, color: '#F5F0E8' }}>{m.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(245, 240, 232, 0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.date}{entry.time ? ` · ${entry.time}` : ''} · {entry.input.slice(0, 50)}{entry.input.length > 50 ? '…' : ''}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteEntryById(entry.id); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245, 240, 232, 0.4)', padding: '6px', borderRadius: '8px', display: 'flex' }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// =============== Search View ===============
function SearchView({ history, goHome }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [matchedCount, setMatchedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setResponse(''); setSearched(true);

    const qLower = q.toLowerCase();
    const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);
    const scored = history.map((e) => {
      const haystack = ((e.input || '') + ' ' + (e.output || '')).toLowerCase();
      let score = 0;
      if (haystack.includes(qLower)) score += 10;
      qWords.forEach((w) => { if (haystack.includes(w)) score += 1; });
      return { entry: e, score };
    }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

    setMatchedCount(scored.length);

    if (scored.length === 0) {
      setResponse(`I've looked through your past entries and don't see anything specifically about "${q}". Want to try different words, or shall we capture a fresh entry on this?`);
      setLoading(false);
      return;
    }

    const formatted = scored.slice(0, 10).map((s) => {
      const e = s.entry;
      return `[${e.modeLabel} · ${e.date} ${e.time}]
USER WROTE:
${e.input}

CLAUDE'S RESPONSE WAS:
${(e.output || '').slice(0, 1500)}${(e.output || '').length > 1500 ? '…' : ''}`;
    }).join('\n\n========\n\n');

    const prompt = `The user just searched their personal companion app for: "${q}"

Below are entries from their past sessions that potentially relate to the search. Respond conversationally and warmly — like a thoughtful friend or coach who actually remembers what they've shared. This is their own thinking, reflected back to them.

GUIDELINES:
- Open with something natural like "Yes, you remember…" or "Ah, that — you wrote about this on [date]…" or "I do remember this…"
- Reference specific dates and which mode they were using
- Quote their actual words where it adds force (use blockquotes with > )
- If you spot patterns across multiple entries, name them
- If only some entries are genuinely relevant, only mention those
- Be warm but substantive, not gushing
- Keep formatting light: occasional bold, blockquotes for direct quotes, short paragraphs

PAST ENTRIES (most relevant first):

${formatted}`;

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      });
      if (!r.ok) {
        const j = await r.json();
        throw new Error(j.error || `API error: ${r.status}`);
      }
      const data = await r.json();
      setResponse(data.text);
    } catch (e) {
      setError(`Could not search — ${e.message}. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runSearch(); }
  };

  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <button onClick={goHome} style={backStyle}><ArrowLeft size={16} /> Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8' }}>
            <MessageCircle size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 500, margin: 0, color: '#F8F4ED', letterSpacing: '-0.02em' }}>Ask your past self</h1>
            <p style={{ fontSize: '13px', color: 'rgba(245, 240, 232, 0.6)', margin: '2px 0 0' }}>
              Search across {history.length} {history.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
      </header>

      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)', borderRadius: '20px', padding: '8px 8px 8px 20px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search size={18} color="rgba(245, 240, 232, 0.55)" style={{ flexShrink: 0 }} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="What have I said about…"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '16px', color: '#F5F0E8', padding: '14px 0' }} autoFocus />
        <button onClick={runSearch} disabled={loading || !query.trim()}
          style={{ background: query.trim() && !loading ? '#F5F0E8' : 'rgba(255, 255, 255, 0.08)', color: query.trim() && !loading ? '#1A1410' : 'rgba(245, 240, 232, 0.4)', border: 'none', borderRadius: '14px', padding: '12px 18px', cursor: query.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? 'Looking…' : 'Search'}
        </button>
      </div>

      {history.length === 0 && !searched && (
        <p style={{ color: 'rgba(245, 240, 232, 0.5)', textAlign: 'center', padding: '40px 20px', fontStyle: 'italic', fontSize: '14px' }}>
          You haven't captured anything yet. Once you've used the modes a few times, you'll be able to search across everything you've thought about.
        </p>
      )}

      {searched && !loading && (
        <div style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px 26px', border: '1px solid rgba(255, 255, 255, 0.18)', boxShadow: '0 6px 20px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.2)' }}>
          {matchedCount > 0 && (
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8B6F', fontWeight: 500, marginBottom: '14px' }}>
              {matchedCount} matching {matchedCount === 1 ? 'entry' : 'entries'} found
            </div>
          )}
          <MarkdownRender text={response} accentColor="#8B6F5C" />
        </div>
      )}

      {error && <ErrorBlock message={error} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// =============== Markdown Renderer ===============
function MarkdownRender({ text, accentColor }) {
  if (!text) return null;
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|[\s\-:|]+\|/)) {
      const tableLines = [line]; i++;
      tableLines.push(lines[i]); i++;
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      blocks.push({ type: 'table', content: tableLines });
      continue;
    }
    if (line.startsWith('# ')) { blocks.push({ type: 'h1', content: line.slice(2) }); i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', content: line.slice(3) }); i++; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', content: line.slice(4) }); i++; continue; }
    if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
      const listLines = []; const ordered = !!line.match(/^\d+\./);
      while (i < lines.length && (lines[i].match(/^[-*]\s+/) || lines[i].match(/^\d+\.\s+/))) {
        listLines.push(lines[i].replace(/^([-*]|\d+\.)\s+/, '')); i++;
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items: listLines });
      continue;
    }
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) { quoteLines.push(lines[i].slice(2)); i++; }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const paraLines = [line]; i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^(#|[-*]\s|\d+\.\s|\||>\s)/)) { paraLines.push(lines[i]); i++; }
    blocks.push({ type: 'p', content: paraLines.join(' ') });
  }

  const inlineFormat = (str) => {
    const html = str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(154,139,111,0.15);padding:2px 6px;border-radius:4px;font-size:0.9em;">$1</code>');
    return { __html: html };
  };

  return (
    <div style={{ fontFamily: 'inherit', color: '#2A2520', lineHeight: 1.7 }}>
      {blocks.map((b, idx) => {
        if (b.type === 'h1') return <h1 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 600, color: '#1a1410', borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px', marginTop: idx === 0 ? 0 : '24px', marginBottom: '16px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'h2') return <h2 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: accentColor, marginTop: '24px', marginBottom: '12px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'h3') return <h3 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: '#3a3025', marginTop: '18px', marginBottom: '10px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'p') return <p key={idx} style={{ margin: '0 0 14px', fontSize: '15px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'blockquote') return <blockquote key={idx} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: '14px', margin: '12px 0', fontStyle: 'italic', color: '#5a5048' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type;
          return <Tag key={idx} style={{ paddingLeft: '22px', margin: '0 0 14px', fontSize: '15px' }}>
            {b.items.map((item, j) => {
              const checkbox = item.match(/^\[([ xX])\]\s+(.+)$/);
              if (checkbox) {
                const checked = checkbox[1].toLowerCase() === 'x';
                return <li key={j} style={{ margin: '6px 0', listStyle: 'none', marginLeft: '-22px' }}><span style={{ marginRight: '8px' }}>{checked ? '☑' : '☐'}</span><span dangerouslySetInnerHTML={inlineFormat(checkbox[2])} /></li>;
              }
              return <li key={j} style={{ margin: '6px 0' }} dangerouslySetInnerHTML={inlineFormat(item)} />;
            })}
          </Tag>;
        }
        if (b.type === 'table') {
          const rows = b.content.filter((l) => l.trim().startsWith('|'));
          if (rows.length < 2) return null;
          const headers = rows[0].split('|').slice(1, -1).map((c) => c.trim());
          const bodyRows = rows.slice(2).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
          return <div key={idx} style={{ overflowX: 'auto', margin: '12px 0 18px', borderRadius: '10px', border: '1px solid rgba(154,139,111,0.2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead><tr style={{ background: 'rgba(154,139,111,0.08)' }}>{headers.map((h, j) => <th key={j} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#1a1410', borderBottom: `1px solid rgba(154,139,111,0.25)` }} dangerouslySetInnerHTML={inlineFormat(h)} />)}</tr></thead>
              <tbody>{bodyRows.map((row, j) => <tr key={j} style={{ borderBottom: j < bodyRows.length - 1 ? '1px solid rgba(154,139,111,0.12)' : 'none' }}>{row.map((cell, k) => <td key={k} style={{ padding: '10px 12px', verticalAlign: 'top', color: '#2A2520' }} dangerouslySetInnerHTML={inlineFormat(cell)} />)}</tr>)}</tbody>
            </table>
          </div>;
        }
        return null;
      })}
    </div>
  );
}
