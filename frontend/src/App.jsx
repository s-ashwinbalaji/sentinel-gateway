import { useState } from 'react'

function App() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTraffic: 0,
    threatsIntercepted: 0,
    avgLatency: 0
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 font-sans">
      {/* Header & Metrics Bar */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6 border-b border-slate-800 pb-4">
          Sentinel Mesh <span className="text-slate-500 font-normal">| AI Service Gateway</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg shadow-black/50">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Total Traffic</h3>
            <p className="text-4xl font-light text-white">{metrics.totalTraffic}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg shadow-black/50">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Threats Intercepted</h3>
            <p className="text-4xl font-light text-danger">{metrics.threatsIntercepted}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg shadow-black/50">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-2">Gateway Latency</h3>
            <p className="text-4xl font-light text-primary">{metrics.avgLatency} <span className="text-lg text-slate-500">ms</span></p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Interactive Traffic Simulator */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Agent Network</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Select Payload Type</label>
              <select className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:outline-none focus:border-primary transition-colors">
                <option value="safe">Safe Query (Balance Check)</option>
                <option value="injection">Prompt Injection (System Override)</option>
                <option value="exfiltration">Data Exfiltration (Dump PII)</option>
              </select>
            </div>
            <button className="w-full bg-primary hover:bg-emerald-400 text-slate-950 font-semibold py-3 px-4 rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Simulate Payload
            </button>
          </div>
        </div>

        {/* Center/Right Column: Visual Routing Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col justify-center items-center min-h-[300px]">
          <h2 className="text-xl font-semibold text-white self-start w-full mb-6">Traffic Routing</h2>
          
          <div className="flex items-center justify-between w-full max-w-2xl relative">
            {/* Agent A */}
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span className="text-sm font-medium text-slate-300">Agent A (Public)</span>
            </div>

            {/* Path 1 */}
            <div className="flex-1 h-1 bg-slate-700 mx-4 relative">
              {/* Animated dot could go here */}
            </div>

            {/* Sentinel Gateway */}
            <div className="flex flex-col items-center z-10">
              <div className="w-20 h-20 rounded bg-slate-950 border-2 border-primary flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-sm font-medium text-white">Sentinel Gateway</span>
            </div>

            {/* Path 2 */}
            <div className="flex-1 h-1 bg-slate-700 mx-4 relative"></div>

            {/* Agent B */}
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <span className="text-sm font-medium text-slate-300">Agent B (Internal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Security Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Live Security Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Destination</th>
                <th className="p-4 font-medium">Classification</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock Row for now */}
              <tr className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 text-slate-500">2026-06-27 10:30:15</td>
                <td className="p-4">Agent A (Public)</td>
                <td className="p-4">Sentinel Gateway</td>
                <td className="p-4 text-slate-300">Prompt Injection (System Override)</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-danger border border-red-500/20">
                    Blocked
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-500 italic">
              No traffic intercepted yet. Run a simulation to start populating logs.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
