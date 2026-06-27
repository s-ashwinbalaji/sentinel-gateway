import { useState, useRef, useEffect } from 'react';
import {
  Shield, ShieldAlert, Send, Bot, User, Zap, AlertTriangle,
  CheckCircle, MessageCircle, X, CreditCard, ArrowUpRight,
  ArrowDownLeft, BarChart3, Bell, Settings, LogOut, ChevronRight,
  Wallet, RefreshCw, Receipt, PiggyBank, Lock, Eye, EyeOff,
} from 'lucide-react';

const GATEWAY_URL = "http://localhost:8000";

// ─── Mock bank data ───────────────────────────────────────────────────────────
const MOCK_ACCOUNT = {
  name: "Jovan Petrovic",
  accountNo: "**** **** **** 4821",
  balance: 12475.80,
  savings: 8320.50,
};

const MOCK_TRANSACTIONS = [
  { id: 1, label: "Netflix Subscription",   amount: -15.99,   date: "27 Jun", type: "debit",  category: "Entertainment" },
  { id: 2, label: "Salary — Acme Corp",      amount: +5200.00, date: "25 Jun", type: "credit", category: "Income" },
  { id: 3, label: "Grab (Food Delivery)",    amount: -22.40,   date: "24 Jun", type: "debit",  category: "Food" },
  { id: 4, label: "Transfer to Mom",         amount: -300.00,  date: "23 Jun", type: "debit",  category: "Transfer" },
  { id: 5, label: "Amazon Purchase",         amount: -89.00,   date: "22 Jun", type: "debit",  category: "Shopping" },
  { id: 6, label: "Freelance Payment",       amount: +750.00,  date: "20 Jun", type: "credit", category: "Income" },
];

// ─── Chatbot helpers ──────────────────────────────────────────────────────────
function buildBotReply(payload) {
  const l = payload.toLowerCase();
  if (l.includes("balance"))              return `Your NexaBank Checking account balance is $${MOCK_ACCOUNT.balance.toFixed(2)}. Your savings account holds $${MOCK_ACCOUNT.savings.toFixed(2)}.`;
  if (l.includes("transfer"))            return "To initiate a transfer, please visit the Transfers tab or tell me the amount and recipient account number.";
  if (l.includes("statement"))           return "Your last statement has been sent to your registered email. You can also download PDF statements under Accounts → Statements.";
  if (l.includes("loan") || l.includes("credit")) return "Our personal loan rates start at 3.8% p.a. Would you like me to connect you with a specialist?";
  if (l.includes("card") || l.includes("block") || l.includes("freeze")) return "I can help with that. To freeze or replace your card ending in 4821, please confirm your identity via the Security tab.";
  if (l.includes("lost") || l.includes("stolen")) return "I've flagged this for our fraud team. Your card ending in 4821 will be frozen immediately. A replacement will arrive in 3–5 business days.";
  if (l.includes("hi") || l.includes("hello") || l.includes("hey")) return "Hello! I'm Nova, your NexaBank AI assistant. I can help with balances, transfers, statements, and more.";
  if (l.includes("transaction") || l.includes("recent")) return "Your most recent transaction was a debit of $15.99 for Netflix on 27 Jun. Would you like a full statement?";
  if (l.includes("interest") || l.includes("rate")) return "Your savings account earns 2.1% p.a. interest, credited monthly. Premium accounts qualify for 3.5% p.a.";
  return "I've noted your request and am looking into that for you. Is there anything else I can assist with?";
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm Nova, your NexaBank AI assistant — powered by Sentinel Mesh. How can I help you today?",
  status: null,
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread]     = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleChatOpen = () => {
    setChatOpen(true);
    setUnread(0);
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#050B14]/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">NexaBank</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {["Home", "Accounts", "Transfers", "Cards", "Support"].map(link => (
              <a key={link} href="#" className={`hover:text-white transition-colors ${link === "Home" ? "text-white" : ""}`}>{link}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold ml-1">
              JP
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* Greeting */}
        <div>
          <p className="text-slate-500 text-sm">Good afternoon,</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{MOCK_ACCOUNT.name}</h1>
        </div>

        {/* Account cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Primary balance card */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-[#0a1f14] to-[#0a1120] p-6 shadow-[0_0_40px_rgba(16,185,129,0.07)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>Checking Account</span>
                </div>
                <button onClick={() => setBalanceVisible(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-500 text-xs mb-1">Available Balance</p>
              <p className="text-4xl font-light text-white tracking-tight mb-1">
                {balanceVisible ? `$${MOCK_ACCOUNT.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "••••••"}
              </p>
              <p className="text-slate-500 text-xs font-mono">{MOCK_ACCOUNT.accountNo}</p>

              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  { label: "Transfer",  icon: ArrowUpRight },
                  { label: "Pay Bill",  icon: Receipt },
                  { label: "Top Up",    icon: Wallet },
                  { label: "History",   icon: BarChart3 },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-xs font-medium transition-all">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Savings card */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <PiggyBank className="w-4 h-4" />
                <span>Savings</span>
              </div>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">2.1% p.a.</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Total Savings</p>
              <p className="text-2xl font-light text-white">
                {balanceVisible ? `$${MOCK_ACCOUNT.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "••••"}
              </p>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 text-xs font-medium transition-all">
              View Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Transactions + Security panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Transactions */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Recent Transactions</h2>
              <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="space-y-1">
              {MOCK_TRANSACTIONS.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{tx.label}</p>
                    <p className="text-slate-500 text-xs">{tx.date} · {tx.category}</p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${tx.type === 'credit' ? 'text-primary' : 'text-slate-300'}`}>
                    {tx.type === 'credit' ? '+' : ''}{tx.amount < 0 ? `-$${Math.abs(tx.amount).toFixed(2)}` : `$${tx.amount.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors">
              View all transactions <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Security panel */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="text-white font-semibold">Security</h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-primary text-xs font-semibold">Sentinel Shield Active</p>
                <p className="text-slate-500 text-[10px] mt-0.5">All chat messages are screened</p>
              </div>
            </div>

            {[
              { label: "2-Factor Auth",      value: "Enabled",  ok: true },
              { label: "Biometric Login",    value: "Enabled",  ok: true },
              { label: "Card Freeze",        value: "Inactive", ok: null },
              { label: "Travel Mode",        value: "Off",      ok: null },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'}`}>{value}</span>
              </div>
            ))}

            <button className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 text-xs font-medium transition-all">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </main>

      {/* ── Floating chat widget ── */}
      <ChatWidget open={chatOpen} onOpen={handleChatOpen} onClose={() => setChatOpen(false)} unread={unread} />
    </div>
  );
}

// ─── Floating chat widget ─────────────────────────────────────────────────────
function ChatWidget({ open, onOpen, onClose, unread }) {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendQuick = (text) => {
    setInput('');
    sendDirect(text);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    await sendDirect(text);
    setInput('');
  };

  const sendDirect = async (text) => {
    if (!text || sending) return;

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    setSending(true);

    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, role: 'typing' }]);

    try {
      const res = await fetch(`${GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: "Agent A (Public Bot)",
          destination: "Agent B (Internal DB)",
          payload: text,
        }),
      });
      const data = await res.json();

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        return [...filtered, {
          id: Date.now() + 2,
          role: 'bot',
          text: data.status === 'Allowed'
            ? buildBotReply(text)
            : "I'm sorry, I can't process that request. It was flagged by our security system.",
          status: data.status,
          classification: data.classification,
          latency: data.latency_ms,
        }];
      });
    } catch {
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now() + 2,
        role: 'bot',
        text: "Unable to reach the gateway. Please check the backend is running.",
        status: 'error',
      }));
    } finally {
      setSending(false);
      if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Panel */}
      <div className={`fixed bottom-20 right-4 md:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-700/60 bg-[#07101e] shadow-[0_24px_80px_rgba(0,0,0,0.6)] transition-all duration-300 origin-bottom-right
        ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{ height: '520px' }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/80 border-b border-slate-800/60 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Nova — AI Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Online · Protected by Sentinel</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-3 py-3 space-y-3">
          {messages.map(msg => {
            if (msg.role === 'typing') return <TypingBubble key={msg.id} />;
            if (msg.role === 'user')   return <UserBubble key={msg.id} msg={msg} />;
            return <BotBubble key={msg.id} msg={msg} />;
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts — only shown when only welcome message is visible */}
        {messages.length === 1 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {["What's my balance?", "Recent transactions", "Help with my card"].map(prompt => (
              <button
                key={prompt}
                onClick={() => sendQuick(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 text-slate-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-2.5 border-t border-slate-800/60 bg-slate-900/60 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={sending}
              placeholder="Message Nova…"
              rows={1}
              className="flex-1 resize-none bg-[#0c1628] border border-slate-700/60 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600 disabled:opacity-50 overflow-hidden"
              style={{ minHeight: '38px', maxHeight: '96px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-primary hover:bg-emerald-400 text-[#050B14] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-slate-600 text-[9px] mt-1.5">
            <Shield className="inline w-2 h-2 mb-0.5 mr-0.5" />Sentinel Gateway screens all messages
          </p>
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={open ? onClose : onOpen}
        className="fixed bottom-4 right-4 md:right-6 z-50 w-14 h-14 rounded-2xl bg-primary hover:bg-emerald-400 text-[#050B14] flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] transition-all duration-200 hover:scale-105"
      >
        {open
          ? <X className="w-6 h-6" />
          : <>
              <MessageCircle className="w-6 h-6" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </>
        }
      </button>
    </>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────
function UserBubble({ msg }) {
  return (
    <div className="msg-enter flex justify-end gap-2">
      <div className="max-w-[80%]">
        <div className="bg-primary/15 border border-primary/20 text-slate-100 rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
      <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-auto">
        <User className="w-3 h-3 text-slate-400" />
      </div>
    </div>
  );
}

function BotBubble({ msg }) {
  const isBlocked = msg.status === 'Blocked';
  const isError   = msg.status === 'error';

  return (
    <div className="msg-enter flex gap-2">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-auto border ${isBlocked ? 'bg-danger/10 border-danger/25' : 'bg-[#0a1120] border-primary/25'}`}>
        {isBlocked
          ? <ShieldAlert className="w-3 h-3 text-danger" />
          : <Bot className="w-3 h-3 text-primary" />
        }
      </div>
      <div className="max-w-[80%] space-y-1">
        <div className={`rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm leading-relaxed border ${
          isBlocked  ? 'bg-danger/5 border-danger/15 text-slate-200' :
          isError    ? 'bg-orange-500/5 border-orange-500/15 text-orange-300' :
                       'bg-slate-800/50 border-slate-700/30 text-slate-200'
        }`}>
          {msg.text}
        </div>
        {msg.status && !isError && <GatewayBadge status={msg.status} classification={msg.classification} latency={msg.latency} />}
      </div>
    </div>
  );
}

function GatewayBadge({ status, classification, latency }) {
  const blocked = status === 'Blocked';
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono ${
      blocked ? 'bg-danger/5 border-danger/15 text-danger/70' : 'bg-slate-900/50 border-slate-700/30 text-slate-600'
    }`}>
      {blocked
        ? <AlertTriangle className="w-2.5 h-2.5 text-danger" />
        : <CheckCircle className="w-2.5 h-2.5 text-primary" />
      }
      <span className={blocked ? 'text-danger' : 'text-primary'}>{blocked ? 'BLOCKED' : 'ALLOWED'}</span>
      <span className="text-slate-700">·</span>
      <span>{classification}</span>
      {latency != null && <><span className="text-slate-700">·</span><Zap className="w-2 h-2" /><span>{latency}ms</span></>}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-lg bg-[#0a1120] border border-primary/25 flex items-center justify-center shrink-0">
        <Bot className="w-3 h-3 text-primary" />
      </div>
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
        <div className="dot-blink flex gap-1 items-center h-3.5">
          <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
          <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
          <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
        </div>
      </div>
    </div>
  );
}
