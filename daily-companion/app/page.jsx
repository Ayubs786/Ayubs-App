'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Sparkles, Brain, ListChecks,
  CheckSquare, Lightbulb, Download, Loader2,
  ArrowLeft, Clock, AlertCircle, Trash2
} from 'lucide-react';

// ====== Storage wrapper (mimics the prototype API using localStorage) ======
const storage = {
  async get(key) {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(key);
    return v === null ? null : { key, value: v };
  },
  async set(key, value) {
    if (typeof window === 'undefined') return null;
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    if (typeof window === 'undefined') return null;
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  async list(prefix) {
    if (typeof window === 'undefined') return { keys: [] };
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return { keys, prefix };
  },
};

const MODES = {
  vision: {
    id: 'vision',
    label: 'Vision Board',
    sublabel: "Where you're heading",
    icon: Sparkles,
    color: '#C9986A',
    bgGradient: 'linear-gradient(135deg, #FAF3E7 0%, #F5E6D3 100%)',
    placeholder: "What are you reaching for? Dreams, goals, the kind of life you're building...",
    systemPrompt: `You are helping the user create a vision board entry. They will share dreams, goals, or aspirations. Transform their raw input into a structured, motivating vision document.

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

Be poetic but precise. No fluff.`,
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

Be honest, not sycophantic.`,
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

Be direct and pattern-aware — your job is to remind the user of what they've already told themselves matters.`,
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

Be exhaustive — capture everything mentioned, even in passing.`,
  },
  brainstorm: {
    id: 'brainstorm',
    label: 'Brainstorm',
    sublabel: 'Generate options',
    icon: Lightbulb,
    color: '#C97A5C',
    bgGradient: 'linear-gradient(135deg, #FAEBE3 0%, #F5D5C4 100%)',
    placeholder: "What are you thinking about? An idea, a problem, a question to crack open...",
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

Keep ideas concrete and applicable.`,
  },
};

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

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await storage.list('entries:');
        if (result && result.keys) {
          const entries = await Promise.all(
            result.keys.slice(0, 50).map(async (key) => {
              try {
                const r = await storage.get(key);
                return r ? JSON.parse(r.value) : null;
              } catch { return null; }
            })
          );
          setHistory(entries.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp));
        }
      } catch {}
      finally { setHistoryLoaded(true); }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceSupported(false); return; }
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
        setInput(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
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
    setInput(''); setOutput(''); setError('');
    setView('input');
  };

  const goHome = () => {
    if (isListening) { try { recognitionRef.current.stop(); } catch {}; setIsListening(false); }
    setView('home'); setMode(null); setInput(''); setOutput(''); setError('');
  };

  const processInput = async () => {
    if (!input.trim() || !mode) return;
    if (isListening) { try { recognitionRef.current.stop(); } catch {}; setIsListening(false); }
    setLoading(true); setError(''); setOutput('');

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const today = `${dateStr} · ${timeStr}`;

    let contextBlock = '';
    if (mode.id === 'prioritise' && history.length > 0) {
      const recent = history.slice(0, 6).map(e => {
        const inputSnippet = (e.input || '').slice(0, 280);
        const outputSnippet = (e.output || '').slice(0, 500);
        return `[${e.modeLabel} · ${e.date}${e.time ? ' ' + e.time : ''}]
INPUT: ${inputSnippet}${e.input && e.input.length > 280 ? '…' : ''}
OUTPUT EXCERPT: ${outputSnippet}${e.output && e.output.length > 500 ? '…' : ''}`;
      }).join('\n\n---\n\n');
      contextBlock = `\n\n=== RECENT JOURNAL CONTEXT ===
The user's last ${Math.min(6, history.length)} entries across other modes. Use these to spot recurring themes, unfinished priorities, decisions parked, and things that should carry forward into today's anchor:

${recent}

=== END CONTEXT ===\n`;
    }

    const fullPrompt = `${mode.systemPrompt.replace("[today's date]", today)}${contextBlock}

---

USER INPUT:
${input}

---

Now produce the structured output exactly as specified above. Use proper markdown including tables. Do not include any preamble — start directly with the H1 heading.`;

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      setOutput(text);
      await saveEntry(text);
      setView('result');
    } catch (e) {
      setError(`Could not process — ${e.message}. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (outputText) => {
    const now = new Date();
    const entry = {
      timestamp: Date.now(),
      mode: mode.id,
      modeLabel: mode.label,
      input,
      output: outputText,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      await storage.set(`entries:${entry.timestamp}`, JSON.stringify(entry));
      setHistory(prev => [entry, ...prev].slice(0, 100));
    } catch {}
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { setError('Popup blocked. Allow popups to download PDF.'); return; }
    const now = new Date();
    const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fullStamp = `${today} · ${timeStr}`;
    const html = `<!DOCTYPE html>
<html><head><title>${mode.label} — ${fullStamp}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Geist:wght@400;500;600&display=swap');
body { font-family: 'Geist', -apple-system, sans-serif; max-width: 720px; margin: 40px auto; padding: 40px; color: #2A2520; line-height: 1.7; background: #FDFBF7; }
h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; color: #1a1410; font-weight: 600; }
h1 { font-size: 32px; margin-bottom: 8px; border-bottom: 2px solid ${mode.color}; padding-bottom: 12px; }
h2 { font-size: 22px; margin-top: 32px; color: ${mode.color}; }
h3 { font-size: 18px; margin-top: 24px; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }
th, td { border: 1px solid #E5DDD0; padding: 10px 14px; text-align: left; vertical-align: top; }
th { background: #F5EFE3; font-family: 'Fraunces', serif; font-weight: 600; }
ul, ol { padding-left: 24px; } li { margin: 6px 0; }
.footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E5DDD0; color: #888; font-size: 12px; }
@media print { body { margin: 0; } }
</style></head><body><div id="content"></div>
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
    return table + '</tbody></table>';
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
    if (block.match(/^<(h\\d|ul|ol|table)/)) return block;
    return '<p>' + block.replace(/\\n/g, '<br>') + '</p>';
  }).join('\\n');
  return html;
}
document.getElementById('content').innerHTML = mdToHtml(md);
setTimeout(() => window.print(), 400);
</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #FAF6EE 0%, #F0E8D8 100%)',
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#2A2520', padding: '20px 16px', paddingBottom: '40px',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {view === 'home' && <HomeView selectMode={selectMode} history={history} setView={setView} historyLoaded={historyLoaded} />}
        {view === 'input' && <InputView mode={mode} input={input} setInput={setInput} isListening={isListening} toggleVoice={toggleVoice} voiceSupported={voiceSupported} processInput={processInput} loading={loading} error={error} goHome={goHome} />}
        {view === 'result' && <ResultView mode={mode} output={output} input={input} downloadPDF={downloadPDF} goHome={goHome} error={error} />}
        {view === 'history' && <HistoryView history={history} setHistory={setHistory} goHome={goHome} setOutput={setOutput} setInput={setInput} setMode={setMode} setView={setView} />}
      </div>
    </div>
  );
}

function HomeView({ selectMode, history, setView, historyLoaded }) {
  const today = new Date();
  const greeting = (() => { const h = today.getHours(); if (h < 12) return 'Good morning'; if (h < 18) return 'Good afternoon'; return 'Good evening'; })();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <>
      <header style={{ marginBottom: '40px', textAlign: 'center', paddingTop: '20px' }}>
        <p style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9A8B6F', margin: '0 0 12px', fontWeight: 500 }}>{dateStr}</p>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '38px', fontWeight: 500, margin: '0 0 8px', color: '#1a1410', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{greeting}.</h1>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '17px', color: '#7A6F5F', margin: 0 }}>What needs your mind today?</p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.values(MODES).map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => selectMode(m.id)}
              style={{ background: m.bgGradient, border: 'none', borderRadius: '20px', padding: '22px 24px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.15s ease, box-shadow 0.15s ease', fontFamily: 'inherit' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: m.color }}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '20px', fontWeight: 500, color: '#1a1410', letterSpacing: '-0.01em', marginBottom: '2px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', color: '#6B5F4F' }}>{m.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>
      {historyLoaded && history.length > 0 && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button onClick={() => setView('history')} style={{ background: 'transparent', border: '1px solid rgba(154, 139, 111, 0.3)', borderRadius: '999px', padding: '10px 20px', fontFamily: 'inherit', fontSize: '13px', color: '#6B5F4F', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} /> View past entries ({history.length})
          </button>
        </div>
      )}
      <footer style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#A89A82', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Daily Companion</p>
      </footer>
    </>
  );
}

function InputView({ mode, input, setInput, isListening, toggleVoice, voiceSupported, processInput, loading, error, goHome }) {
  const Icon = mode.icon;
  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <button onClick={goHome} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7A6F5F', fontSize: '14px', padding: '8px 0', fontFamily: 'inherit' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: mode.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mode.color }}>
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 500, margin: 0, color: '#1a1410', letterSpacing: '-0.02em' }}>{mode.label}</h1>
            <p style={{ fontSize: '13px', color: '#7A6F5F', margin: '2px 0 0' }}>{mode.sublabel}</p>
          </div>
        </div>
      </header>
      <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '20px', padding: '20px', marginBottom: '16px', border: '1px solid rgba(154, 139, 111, 0.15)' }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode.placeholder}
          style={{ width: '100%', minHeight: '180px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '16px', lineHeight: 1.6, color: '#2A2520', padding: 0 }} autoFocus />
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'rgba(201, 122, 92, 0.08)', borderRadius: '10px', color: mode.color, fontSize: '13px' }}>
            <PulseDot color={mode.color} /> Listening… speak naturally
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
        {voiceSupported && (
          <button onClick={toggleVoice} disabled={loading}
            style={{ width: '60px', height: '60px', borderRadius: '20px', border: 'none', background: isListening ? mode.color : 'rgba(255,255,255,0.7)', color: isListening ? 'white' : mode.color, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s ease', flexShrink: 0 }}>
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        )}
        <button onClick={processInput} disabled={loading || !input.trim()}
          style={{ flex: 1, height: '60px', borderRadius: '20px', border: 'none', background: input.trim() && !loading ? mode.color : 'rgba(154, 139, 111, 0.2)', color: input.trim() && !loading ? 'white' : '#9A8B6F', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: "'Fraunces', Georgia, serif", fontSize: '17px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: input.trim() && !loading ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s ease' }}>
          {loading ? (<><Loader2 size={18} className="spin" /> Thinking…</>) : 'Process with Claude'}
        </button>
      </div>
      {!voiceSupported && (<p style={{ marginTop: '14px', fontSize: '12px', color: '#9A8B6F', textAlign: 'center', fontStyle: 'italic' }}>Voice input not supported in this browser. Try Chrome or Safari.</p>)}
      {error && (
        <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(201, 92, 92, 0.08)', border: '1px solid rgba(201, 92, 92, 0.2)', borderRadius: '12px', color: '#A04040', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /><span>{error}</span>
        </div>
      )}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function PulseDot({ color }) {
  return (<>
    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }`}</style>
  </>);
}

function ResultView({ mode, output, input, downloadPDF, goHome, error }) {
  const Icon = mode.icon;
  return (
    <>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={goHome} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7A6F5F', fontSize: '14px', padding: '8px 0', fontFamily: 'inherit' }}>
          <ArrowLeft size={16} /> Done
        </button>
        <button onClick={downloadPDF} style={{ background: mode.color, color: 'white', border: 'none', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: 'inherit', fontWeight: 500 }}>
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
      <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(154, 139, 111, 0.15)', marginBottom: '20px' }}>
        <MarkdownRender text={output} accentColor={mode.color} />
      </div>
      <details style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '14px 18px', marginBottom: '16px', fontSize: '14px', color: '#6B5F4F' }}>
        <summary style={{ cursor: 'pointer', fontFamily: "'Fraunces', serif", fontWeight: 500 }}>Your original input</summary>
        <p style={{ marginTop: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{input}</p>
      </details>
      {error && (<div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(201, 92, 92, 0.08)', borderRadius: '10px', color: '#A04040', fontSize: '13px' }}>{error}</div>)}
    </>
  );
}

function HistoryView({ history, setHistory, goHome, setOutput, setInput, setMode, setView }) {
  const openEntry = (entry) => { setMode(MODES[entry.mode]); setInput(entry.input); setOutput(entry.output); setView('result'); };
  const deleteEntry = async (e, timestamp) => {
    e.stopPropagation();
    try { await storage.delete(`entries:${timestamp}`); setHistory(prev => prev.filter(h => h.timestamp !== timestamp)); } catch {}
  };
  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <button onClick={goHome} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#7A6F5F', fontSize: '14px', padding: '8px 0', fontFamily: 'inherit' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '32px', fontWeight: 500, margin: '12px 0 4px', color: '#1a1410', letterSpacing: '-0.02em' }}>Past Entries</h1>
        <p style={{ color: '#7A6F5F', fontSize: '14px', margin: 0 }}>Your daily record</p>
      </header>
      {history.length === 0 ? (
        <p style={{ color: '#9A8B6F', textAlign: 'center', padding: '40px' }}>No entries yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((entry) => {
            const m = MODES[entry.mode]; if (!m) return null;
            const Icon = m.icon;
            return (
              <div key={entry.timestamp} onClick={() => openEntry(entry)}
                style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid rgba(154, 139, 111, 0.12)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: m.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 500, color: '#1a1410' }}>{m.label}</div>
                  <div style={{ fontSize: '12px', color: '#7A6F5F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.date}{entry.time ? ` · ${entry.time}` : ''} · {entry.input.slice(0, 50)}{entry.input.length > 50 ? '…' : ''}
                  </div>
                </div>
                <button onClick={(e) => deleteEntry(e, entry.timestamp)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#B5A78F', padding: '6px', display: 'flex' }} title="Delete">
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

function MarkdownRender({ text, accentColor }) {
  if (!text) return null;
  const blocks = []; const lines = text.split('\n'); let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|[\s\-:|]+\|/)) {
      const tableLines = [line]; i++; tableLines.push(lines[i]); i++;
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      blocks.push({ type: 'table', content: tableLines }); continue;
    }
    if (line.startsWith('# ')) { blocks.push({ type: 'h1', content: line.slice(2) }); i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', content: line.slice(3) }); i++; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', content: line.slice(4) }); i++; continue; }
    if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
      const listLines = []; const ordered = !!line.match(/^\d+\./);
      while (i < lines.length && (lines[i].match(/^[-*]\s+/) || lines[i].match(/^\d+\.\s+/))) {
        listLines.push(lines[i].replace(/^([-*]|\d+\.)\s+/, '')); i++;
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items: listLines }); continue;
    }
    if (line.trim() === '') { i++; continue; }
    const paraLines = [line]; i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^(#|[-*]\s|\d+\.\s|\|)/)) {
      paraLines.push(lines[i]); i++;
    }
    blocks.push({ type: 'p', content: paraLines.join(' ') });
  }
  const inlineFormat = (str) => ({
    __html: str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
  });
  return (
    <div style={{ fontFamily: 'inherit', color: '#2A2520', lineHeight: 1.7 }}>
      {blocks.map((b, idx) => {
        if (b.type === 'h1') return <h1 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 600, color: '#1a1410', borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px', marginTop: idx === 0 ? 0 : '24px', marginBottom: '16px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'h2') return <h2 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: accentColor, marginTop: '24px', marginBottom: '12px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'h3') return <h3 key={idx} style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: '#3a3025', marginTop: '18px', marginBottom: '10px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'p') return <p key={idx} style={{ margin: '0 0 14px', fontSize: '15px' }} dangerouslySetInnerHTML={inlineFormat(b.content)} />;
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type;
          return (
            <Tag key={idx} style={{ paddingLeft: '22px', margin: '0 0 14px', fontSize: '15px' }}>
              {b.items.map((item, j) => {
                const isCheckbox = item.match(/^\[([ xX])\]\s+(.+)$/);
                if (isCheckbox) {
                  const checked = isCheckbox[1].toLowerCase() === 'x';
                  return (<li key={j} style={{ margin: '6px 0', listStyle: 'none', marginLeft: '-22px' }}><span style={{ marginRight: '8px' }}>{checked ? '☑' : '☐'}</span><span dangerouslySetInnerHTML={inlineFormat(isCheckbox[2])} /></li>);
                }
                return <li key={j} style={{ margin: '6px 0' }} dangerouslySetInnerHTML={inlineFormat(item)} />;
              })}
            </Tag>
          );
        }
        if (b.type === 'table') {
          const rows = b.content.filter(l => l.trim().startsWith('|'));
          if (rows.length < 2) return null;
          const headers = rows[0].split('|').slice(1, -1).map(c => c.trim());
          const bodyRows = rows.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
          return (
            <div key={idx} style={{ overflowX: 'auto', margin: '12px 0 18px', borderRadius: '10px', border: '1px solid rgba(154,139,111,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead><tr style={{ background: 'rgba(154,139,111,0.08)' }}>
                  {headers.map((h, j) => (<th key={j} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#1a1410', borderBottom: `1px solid rgba(154,139,111,0.25)`, fontSize: '13px' }} dangerouslySetInnerHTML={inlineFormat(h)} />))}
                </tr></thead>
                <tbody>
                  {bodyRows.map((row, j) => (
                    <tr key={j} style={{ borderBottom: j < bodyRows.length - 1 ? '1px solid rgba(154,139,111,0.12)' : 'none' }}>
                      {row.map((cell, k) => (<td key={k} style={{ padding: '10px 12px', verticalAlign: 'top', color: '#2A2520' }} dangerouslySetInnerHTML={inlineFormat(cell)} />))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
