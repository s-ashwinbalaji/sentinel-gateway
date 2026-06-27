import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Activity, Send, Terminal, Bot, Database, Server, Zap, Lock, Unlock, Settings2, Plus, X, AlertTriangle, Info, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const WS_URL = BACKEND_URL.replace(/^http/, "ws") + "/api/ws/logs";

function SocDashboard() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    total_traffic: 0,
    threats_intercepted: 0,
    avg_latency_ms: 0
  });
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStatus, setAnimationStatus] = useState(null); // 'Allowed', 'Flagged', 'Quarantined', 'Blocked'
  const [botResponse, setBotResponse] = useState("");

  // New Features States
  const [chartData, setChartData] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState("");

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [logsRes, metricsRes, statusRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/logs`),
        fetch(`${BACKEND_URL}/api/metrics`),
        fetch(`${BACKEND_URL}/api/status`)
      ]);
      const logsData = await logsRes.json();
      const metricsData = await metricsRes.json();
      const statusData = await statusRes.json();
      
      setLogs(logsData);
      setMetrics(metricsData);
      setBannedIps(statusData.banned_ips || []);
      setCustomRules(statusData.custom_waf_rules);
      
      // Initialize chart with static dot if needed
      setChartData([{
        time: new Date().toLocaleTimeString(),
        traffic: metricsData.total_traffic,
        threats: metricsData.threats_intercepted
      }]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket connection for real-time updates
    const ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_log") {
        setLogs(prev => [data.log, ...prev].slice(0, 15)); // Keep 15 logs in UI
        setMetrics(data.metrics);
        
        // Update Chart
        const timeStr = new Date(data.log.timestamp + "Z").toLocaleTimeString();
        setChartData(prev => {
           const newData = [...prev, {
             time: timeStr,
             traffic: data.metrics.total_traffic,
             threats: data.metrics.threats_intercepted
           }];
           return newData.slice(-15); // Keep last 15 points
        });

        if (data.banned_ips) {
          setBannedIps(data.banned_ips);
        }
      }
    };

    return () => ws.close();
  }, []);

  // (Simulation logic moved to Bank Portal)

  const handleUnban = async () => {
    await fetch(`${BACKEND_URL}/api/unban`, { method: "POST" });
    setBannedIps([]);
    setAnimationStatus(null);
    setBotResponse("");
  };

  const handleAddRule = async () => {
    if (!newRule.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/waf/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule: newRule })
    });
    const data = await res.json();
    setCustomRules(data.rules);
    setNewRule("");
  };

  const handleClearRules = async () => {
    await fetch(`${BACKEND_URL}/api/waf/rules`, { method: "DELETE" });
    setCustomRules([]);
  };

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Risk Score", "Risk Percentage", "Classification", "Action Taken", "Payload"];
    const csvRows = [headers.join(",")];
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp + "Z").toISOString();
      const payloadSafe = `"${(log.payload || "").replace(/"/g, '""')}"`;
      const classificationSafe = `"${(log.payload_classification || "").replace(/"/g, '""')}"`;
      
      const row = [
        timestamp,
        log.risk_level,
        `${log.risk_percentage}%`,
        classificationSafe,
        log.status,
        payloadSafe
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel_logs_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    if (status === 'Allowed') return 'text-primary border-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-primary/10';
    if (status === 'Flagged') return 'text-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] bg-yellow-400/10';
    if (status === 'Quarantined') return 'text-orange-500 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] bg-orange-500/20';
    if (status === 'Blocked') return 'text-danger border-danger shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-[#2a0e12]';
    return 'border-slate-700/50 text-slate-400 shadow-lg bg-slate-800/30';
  };
  
  const getRiskColor = (risk) => {
    if (risk === 'LOW') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (risk === 'MEDIUM') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    if (risk === 'HIGH') return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    if (risk === 'CRITICAL') return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-slate-400 bg-slate-800/50 border-slate-700/50';
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans relative overflow-x-hidden selection:bg-primary/30">
      
      {/* Abstract Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>



      {/* Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Sentinel SOC
                {isAnimating && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Zero-Trust Risk Scoring Gateway</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800/80 shadow-inner">
            <div className={`w-2 h-2 rounded-full animate-pulse ${bannedIps.length > 0 ? 'bg-danger shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
            <span className={`text-sm font-semibold tracking-wide ${bannedIps.length > 0 ? 'text-danger' : 'text-emerald-400'}`}>
              {bannedIps.length > 0 ? 'ACTIVE THREATS DETECTED' : 'SECURE CONNECTION ACTIVE'}
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex flex-col xl:flex-row gap-6">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: CONTROLS */}
        {/* ============================================================ */}
        <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
          {/* Banned IPs Panel */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/10 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-danger" />
                </div>
                <h2 className="text-lg font-bold text-white">Blocked IPs</h2>
              </div>
              <span className="bg-danger/20 text-danger text-xs font-bold px-2.5 py-1 rounded-full border border-danger/30">
                {bannedIps.length} Active
              </span>
            </div>
            
            <div className="space-y-3 flex-1 flex flex-col">
              {bannedIps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-4 opacity-50">
                  <Shield className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm font-mono italic">No IPs currently blocked.</p>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {bannedIps.map((ip, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-danger/10 border border-danger/20 rounded-xl p-3 shadow-inner">
                      <span className="font-mono text-sm text-danger font-semibold">{ip}</span>
                      <div className="h-2 w-2 rounded-full bg-danger animate-pulse"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {bannedIps.length > 0 && (
              <button 
                onClick={handleUnban}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
              >
                <Unlock className="w-4 h-4" /> Clear Ban List
              </button>
            )}
          </div>

          {/* WAF Configurator */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Settings2 className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-white">WAF Rules Engine</h2>
              </div>
              {customRules.length > 0 && (
                <button onClick={handleClearRules} className="text-xs font-bold text-slate-500 hover:text-danger flex items-center gap-1 transition-colors uppercase tracking-wider bg-slate-800/50 px-3 py-1.5 rounded-md hover:bg-danger/10">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="e.g. Block the word 'Banana'"
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 text-white rounded-xl p-3.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner placeholder:text-slate-600"
                />
                <button 
                  onClick={handleAddRule}
                  disabled={!newRule.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 flex items-center justify-center disabled:opacity-50 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 min-h-[100px]">
                {customRules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customRules.map((rule, idx) => (
                      <span key={idx} className="bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm flex items-center gap-1">
                        <Shield className="w-3 h-3 opacity-50" /> {rule}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2 opacity-50">
                    <ShieldAlert className="w-6 h-6" />
                    No custom rules active.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN CONTENT: MONITORING */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-20 h-20 text-blue-400" />
              </div>
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Total Traffic
              </h3>
              <p className="text-5xl font-light text-white tracking-tight">{metrics.total_traffic}</p>
            </div>

            <div className={`bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 ${['Quarantined', 'Blocked'].includes(animationStatus) ? 'border-danger/50 bg-danger/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'hover:border-slate-600'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldAlert className={`w-20 h-20 ${['Quarantined', 'Blocked'].includes(animationStatus) ? 'text-danger opacity-20' : 'text-danger'}`} />
              </div>
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-danger"></div> Threats Intercepted
              </h3>
              <p className="text-5xl font-light text-danger tracking-tight">{metrics.threats_intercepted}</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-20 h-20 text-primary" />
              </div>
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Avg Latency
              </h3>
              <p className="text-5xl font-light text-primary tracking-tight">
                {metrics.avg_latency_ms} <span className="text-xl text-primary/50 font-medium">ms</span>
              </p>
            </div>
          </div>

          {/* Visuals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Visual Routing Map */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col justify-center min-h-[360px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
              
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="p-1.5 bg-slate-800/80 rounded-md">
                  <Activity className="w-4 h-4 text-slate-300" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Network Topology</h2>
              </div>
              
              <div className="flex items-center justify-between w-full max-w-lg mx-auto relative z-10">
                {/* Node 1 */}
                <div className={`flex flex-col items-center z-10 transition-transform duration-300 ${isAnimating ? 'scale-110' : ''}`}>
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center mb-3 transition-colors duration-300 ${isAnimating ? 'border-blue-400/50 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)] bg-blue-500/10' : 'text-slate-400 shadow-lg'}`}>
                    <Bot className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Client</span>
                </div>

                {/* Path 1 */}
                <div className="flex-1 h-1 bg-slate-800/80 mx-2 md:mx-4 relative overflow-hidden rounded-full shadow-inner">
                  {isAnimating && <div className="absolute top-0 left-0 h-full w-full bg-blue-400 animate-[slideRight_1s_ease-in-out_infinite] blur-[1px]"></div>}
                </div>

                {/* Node 2 */}
                <div className={`flex flex-col items-center z-20 transition-all duration-500 relative`}>
                  <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 -z-10 ${animationStatus ? getStatusColor(animationStatus).split(' ').find(c => c.startsWith('bg-')) : 'bg-primary/5'}`}></div>
                  
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-3 border ${bannedIps.length > 0 ? 'bg-danger/20 border-danger/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'}`}>
                    {bannedIps.length > 0 ? <Lock className="w-8 h-8 md:w-10 md:h-10 text-danger" /> : <Shield className={`w-8 h-8 md:w-10 md:h-10 text-emerald-400 ${isAnimating ? 'animate-pulse' : ''}`} />}
                  </div>
                  <span className="text-xs font-black text-white tracking-widest uppercase">Sentinel</span>
                </div>

                {/* Path 2 */}
                <div className="flex-1 h-1 bg-slate-800/80 mx-2 md:mx-4 relative overflow-hidden rounded-full shadow-inner flex items-center">
                  {(animationStatus === 'Allowed' || animationStatus === 'Flagged') && <div className={`absolute top-0 left-0 h-full w-full ${animationStatus === 'Flagged' ? 'bg-yellow-400' : 'bg-primary'} animate-[slideRight_1s_ease-in-out_infinite] blur-[1px]`}></div>}
                  {animationStatus === 'Quarantined' && <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-orange-500/0 to-orange-500/80"></div>}
                  {animationStatus === 'Blocked' && <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-danger/0 to-danger/80"></div>}
                  
                  {/* Quarantined Barrier */}
                  {animationStatus === 'Quarantined' && <div className="absolute left-1/2 -translate-x-1/2 h-6 w-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)] rounded-full"></div>}
                  {animationStatus === 'Blocked' && <div className="absolute left-1/2 -translate-x-1/2 h-6 w-1 bg-danger shadow-[0_0_10px_rgba(239,68,68,1)] rounded-full"></div>}
                </div>

                {/* Node 3 */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-950/80 border flex items-center justify-center mb-3 transition-colors duration-500 ${animationStatus === 'Allowed' ? 'border-primary/50 text-primary shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-primary/10' : animationStatus === 'Flagged' ? 'border-yellow-400/50 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] bg-yellow-400/10' : 'border-slate-700/80 text-slate-400 shadow-lg'}`}>
                    <Database className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target DB</span>
                </div>
              </div>

              {botResponse && (
                <div className={`mt-10 mx-auto w-full max-w-lg p-4 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-4 ${getStatusColor(animationStatus).replace('scale-110', '').replace('shadow-[0_0_40px_rgba(239,68,68,0.6)]', '')}`}>
                  <div className="flex items-center gap-2 mb-2 text-xs font-black tracking-widest uppercase opacity-90">
                    {animationStatus === 'Blocked' && <><ShieldAlert className="w-3.5 h-3.5" /> Threat Blocked</>}
                    {animationStatus === 'Quarantined' && <><AlertTriangle className="w-3.5 h-3.5" /> Quarantine Active</>}
                    {animationStatus === 'Flagged' && <><Info className="w-3.5 h-3.5" /> Flagged Request</>}
                    {animationStatus === 'Allowed' && <><Bot className="w-3.5 h-3.5" /> Agent B Response</>}
                  </div>
                  <div className="font-mono text-sm leading-relaxed text-slate-200">{botResponse}</div>
                </div>
              )}
            </div>

            {/* Live Analytics Chart */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl min-h-[360px] flex flex-col group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 bg-blue-500/10 rounded-md">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Threat Analytics</h2>
              </div>
              <div className="flex-1 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="traffic" name="Total Traffic" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#020617', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="threats" name="Blocked Threats" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#020617', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Live Security Log Table */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-700/50 rounded-md">
                  <Server className="w-4 h-4 text-slate-300" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Security Logs (Risk Matrix)</h2>
              </div>
              
              <button 
                onClick={handleExportCSV}
                disabled={logs.length === 0}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-slate-400 bg-slate-950/50">
                  <tr>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Timestamp</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Risk Score</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Classification</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs bg-slate-900/20">
                  {logs.map((log, index) => (
                    <tr key={log.id} className={`hover:bg-slate-800/50 transition-colors cursor-default ${index === 0 && animationStatus ? 'animate-[pulse_1s_ease-in-out_1]' : ''}`}>
                      <td className="py-4 px-6 text-slate-500 font-sans font-medium">{new Date(log.timestamp + "Z").toISOString().replace('T', ' ').substring(0, 19)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1.5 rounded-md border font-black tracking-wider ${getRiskColor(log.risk_level)} flex flex-row items-center gap-2 w-max shadow-sm`}>
                          <span>{log.risk_level}</span>
                          <span className="text-[10px] opacity-75 font-sans bg-black/20 px-1.5 py-0.5 rounded">{log.risk_percentage}%</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {log.payload_classification}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {log.status === "Blocked" && (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black tracking-wider bg-danger/10 text-danger border border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                             <ShieldAlert className="w-3.5 h-3.5" /> BLOCKED
                           </span>
                        )}
                        {log.status === "Quarantined" && (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                             <AlertTriangle className="w-3.5 h-3.5" /> QUARANTINED
                           </span>
                        )}
                        {log.status === "Flagged" && (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-sm">
                             <Info className="w-3.5 h-3.5" /> FLAGGED
                           </span>
                        )}
                        {log.status === "Allowed" && (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-black tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
                             <Shield className="w-3.5 h-3.5" /> ALLOWED
                           </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="4">
                        <div className="py-16 flex flex-col items-center justify-center text-slate-500 font-sans">
                          <div className="p-4 bg-slate-800/30 rounded-full mb-4">
                            <Shield className="w-10 h-10 opacity-30" />
                          </div>
                          <p className="font-bold text-lg text-slate-400">No security events recorded yet</p>
                          <p className="text-sm mt-1">Initiate a simulation payload to generate WAF logs.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

export default SocDashboard
