import { useState, useRef, useEffect } from 'react';
import { Send, Building2, CreditCard, Activity, Shield, LogOut, MessageSquare, X, ArrowRightLeft, Wallet, User, Globe } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000');

function BankPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("sentinel_logged_in") === "true");
  const [username, setUsername] = useState(() => localStorage.getItem("sentinel_username") || "");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem("sentinel_chat");
    return saved ? JSON.parse(saved) : [{ sender: 'bot', text: 'Welcome to Sentinel Bank! How can I help you today?' }];
  });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isLoading, isChatOpen]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      localStorage.setItem("sentinel_logged_in", "true");
      localStorage.setItem("sentinel_username", username);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setChatMessages([{ sender: 'bot', text: 'Welcome to Sentinel Bank! How can I help you today?' }]);
    setIsChatOpen(false);
    localStorage.removeItem("sentinel_logged_in");
    localStorage.removeItem("sentinel_username");
    localStorage.removeItem("sentinel_chat");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    const newMessages = [...chatMessages, { sender: 'user', text: userMessage }];
    setChatMessages(newMessages);
    localStorage.setItem("sentinel_chat", JSON.stringify(newMessages));
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "192.168.1.4",
          destination: "Agent B (Internal DB)",
          payload: userMessage,
          auth_user: username
        })
      });
      const data = await res.json();
      
      let botText = data.bot_response;
      if (data.status === "Blocked") {
        botText = "Error 403: Request blocked by Sentinel Security Gateway.";
      } else if (data.status === "Quarantined") {
        botText = "Error 403: Request quarantined for manual review.";
      }

      const finalMessages = [...newMessages, { sender: 'bot', text: botText }];
      setChatMessages(finalMessages);
      localStorage.setItem("sentinel_chat", JSON.stringify(finalMessages));
    } catch (err) {
      const errorMessages = [...newMessages, { sender: 'bot', text: "System Error: Unable to reach Sentinel Gateway." }];
      setChatMessages(errorMessages);
      localStorage.setItem("sentinel_chat", JSON.stringify(errorMessages));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sentinel Bank</h1>
            <p className="text-slate-400 text-sm mt-1">Secure Online Banking</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-white bg-slate-950 placeholder:text-slate-600 font-medium"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-white bg-slate-950 placeholder:text-slate-600 font-medium"
                placeholder="••••••••"
              />
            </div>
            
            {isRegistering && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-white bg-slate-950 placeholder:text-slate-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 mt-2"
            >
              {isRegistering ? "Create Account" : "Sign In"}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium border-t border-slate-800 pt-6">
            <Shield className="w-4 h-4" /> Protected by Sentinel Gateway
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans text-white">
      {/* Top Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Sentinel Bank</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-400">Welcome back, <span className="text-white font-bold">{username}</span></span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-6">Account Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4 relative">
                  <h3 className="text-slate-400 font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" /> Checking Account</h3>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">...4592</span>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">$12,450.00</p>
                <p className="text-sm text-emerald-500 mt-2 font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" /> + $450.00 this month
                </p>
              </div>
              
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4 relative">
                  <h3 className="text-slate-400 font-medium flex items-center gap-2"><Building2 className="w-4 h-4" /> Savings Account</h3>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">...8831</span>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">$45,000.00</p>
                <p className="text-sm text-emerald-500 mt-2 font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" /> + 2.4% APY
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
              </div>
              <div className="space-y-1">
                {[
                  { name: 'Apple Store', cat: 'Electronics', amount: '-$999.00', time: 'Today, 2:45 PM', icon: <CreditCard className="w-4 h-4 text-slate-400" /> },
                  { name: 'Salary Deposit', cat: 'Income', amount: '+$4,250.00', time: 'Yesterday, 9:00 AM', icon: <Building2 className="w-4 h-4 text-emerald-400" />, pos: true },
                  { name: 'Starbucks', cat: 'Food & Dining', amount: '-$5.40', time: 'Yesterday, 8:15 AM', icon: <Wallet className="w-4 h-4 text-slate-400" /> },
                  { name: 'Netflix Subscription', cat: 'Entertainment', amount: '-$15.99', time: 'Oct 12, 10:00 AM', icon: <CreditCard className="w-4 h-4 text-slate-400" /> },
                  { name: 'Amazon Prime', cat: 'Shopping', amount: '-$139.00', time: 'Oct 10, 1:20 PM', icon: <CreditCard className="w-4 h-4 text-slate-400" /> }
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-sm">
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{tx.name}</p>
                        <p className="text-xs text-slate-500">{tx.cat} • {tx.time}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.pos ? 'text-emerald-400' : 'text-white'}`}>{tx.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Side Panel */}
          <div className="w-full lg:w-96 flex flex-col gap-6">

            {/* Quick Transfer Widget */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" /> Quick Transfer
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input type="text" placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Recipient</label>
                  <div className="flex gap-2">
                    {['John D.', 'Sarah W.', 'Mike T.'].map(name => (
                      <div key={name} className="flex-1 bg-slate-800 hover:bg-slate-700 text-center py-2 rounded-xl cursor-pointer transition-colors border border-slate-700">
                        <span className="text-xs font-medium text-slate-300">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                  Send Money
                </button>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
               <div className="flex items-center justify-between mb-2 relative">
                <h3 className="text-blue-100 font-medium text-sm">Sentinel Rewards</h3>
              </div>
              <p className="text-3xl font-black tracking-tight relative">14,200 <span className="text-lg font-medium text-blue-200">pts</span></p>
              <p className="text-xs text-blue-200 mt-3 font-medium hover:text-white cursor-pointer transition-colors inline-block relative border-b border-blue-400/30 pb-0.5">Explore catalog &rarr;</p>
            </div>
            
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : (
          <div className="bg-slate-900 w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Chat Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sentinel Support</h3>
                  <p className="text-xs text-blue-100">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-blue-100 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 border-2 border-transparent focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl px-4 py-2 text-sm transition-all text-white placeholder:text-slate-500"
                />
                <button 
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default BankPortal;
