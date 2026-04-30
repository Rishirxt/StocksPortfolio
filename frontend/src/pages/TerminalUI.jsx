import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Briefcase, Star, Newspaper, Settings, 
  ArrowRight, Activity, Zap, Shield, TrendingUp, TrendingDown, 
  Bell, Search, ChevronRight, User 
} from 'lucide-react';

const COLORS = ['var(--accent)', 'var(--accent-red)', 'var(--text-secondary)', 'var(--text-primary)'];

// Mock Data
const performanceData = [
  { time: 'Jan', value: 10000 },
  { time: 'Feb', value: 11500 },
  { time: 'Mar', value: 10800 },
  { time: 'Apr', value: 12200 },
  { time: 'May', value: 13500 },
  { time: 'Jun', value: 14800 },
  { time: 'Jul', value: 14200 },
  { time: 'Aug', value: 15900 },
  { time: 'Sep', value: 16500 },
  { time: 'Oct', value: 18000 },
  { time: 'Nov', value: 17500 },
  { time: 'Dec', value: 20450 },
];

const allocationData = [
  { name: 'AAPL', value: 40 },
  { name: 'TSLA', value: 25 },
  { name: 'MSFT', value: 20 },
  { name: 'CASH', value: 15 },
];

const holdingsData = [
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 150, avgCost: 145.20, price: 178.25, pl: 22.76 },
  { ticker: 'TSLA', name: 'Tesla Inc.', shares: 45, avgCost: 210.50, price: 195.00, pl: -7.36 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 80, avgCost: 310.00, price: 345.10, pl: 11.32 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 20, avgCost: 450.00, price: 620.50, pl: 37.89 },
  { ticker: 'AMD', name: 'Advanced Micro', shares: 100, avgCost: 85.00, price: 110.20, pl: 29.65 },
];

export default function TerminalUI() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth view transition
  const navigateTo = (newView) => {
    setIsAnimating(true);
    setTimeout(() => {
      setView(newView);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="terminal-app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;500;600;700&display=swap');

        :root {
          --bg-primary: #0A0B0D;
          --bg-surface: #111318;
          --bg-elevated: #1A1D24;
          --accent: #00D395;
          --accent-red: #FF4D4D;
          --text-primary: #F0F2F5;
          --text-secondary: #8A8FA8;
          --border: rgba(255, 255, 255, 0.07);
        }

        .terminal-app-container {
          font-family: 'IBM Plex Mono', monospace;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .font-syne {
          font-family: 'Syne', sans-serif;
        }

        /* View Transition */
        .view-transition {
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .view-transition.animating {
          opacity: 0;
          transform: translateY(8px);
        }
        .view-transition.entered {
          opacity: 1;
          transform: translateY(0);
        }

        /* Glowing Accent Elements */
        .glow-accent {
          box-shadow: 0 0 20px rgba(0, 211, 149, 0.15);
        }
        
        .hover-lift {
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }

        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          transition: background-color 0.2s ease;
        }
        tr:hover td {
          background-color: var(--bg-elevated);
        }

        /* Recharts custom tooltip */
        .custom-tooltip {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        /* Particle Canvas bg for landing */
        .mesh-bg {
          background: radial-gradient(circle at 50% 50%, rgba(0, 211, 149, 0.05) 0%, transparent 60%);
        }
      `}</style>

      <div className={`view-transition ${isAnimating ? 'animating' : 'entered'} h-full w-full`}>
        {view === 'landing' ? (
          <LandingPage onNavigate={() => navigateTo('dashboard')} />
        ) : (
          <Dashboard onNavigate={() => navigateTo('landing')} />
        )}
      </div>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col relative mesh-bg">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--accent)] glow-accent flex items-center justify-center">
            <Activity size={20} color="var(--bg-primary)" />
          </div>
          <span className="font-syne font-bold text-xl tracking-tight">TERMINAL</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium">Log In</button>
          <button 
            onClick={onNavigate}
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-5 py-2.5 rounded-md font-semibold glow-accent hover:opacity-90 transition-opacity"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-12">
        <h1 className="font-syne text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-6 max-w-4xl">
          Precision trading.<br />
          <span className="text-[var(--text-secondary)]">Zero noise.</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          The institutional-grade portfolio tracker built for serious investors. 
          Real-time data, advanced analytics, and a relentlessly clean interface.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
          <button 
            onClick={onNavigate}
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-md font-bold text-lg glow-accent hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Get Started <ArrowRight size={20} />
          </button>
          <button 
            onClick={onNavigate}
            className="bg-transparent border border-[var(--border)] text-[var(--text-primary)] px-8 py-4 rounded-md font-bold text-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            View Demo
          </button>
        </div>

        {/* Abstract Dashboard Preview */}
        <div className="w-full max-w-5xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent z-10 pointer-events-none" style={{ height: '120%' }}></div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 md:p-8 shadow-2xl relative overflow-hidden transform perspective-1000 rotateX-12 scale-105 opacity-80"
               style={{ filter: 'blur(1px)' }}>
            <div className="flex gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 flex-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]"></div>
              ))}
            </div>
            <div className="h-64 w-full bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]"></div>
          </div>
        </div>
      </main>

      {/* Features Strip */}
      <section className="bg-[var(--bg-surface)] border-y border-[var(--border)] py-20 z-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Real-time execution and WebSocket data streaming." },
            { icon: Shield, title: "Bank-grade Security", desc: "Your data is encrypted end-to-end at rest and in transit." },
            { icon: Activity, title: "Advanced Analytics", desc: "Beta, Sharpe ratio, and sector allocation insights." },
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                <feature.icon size={24} />
              </div>
              <h3 className="font-syne text-xl font-bold">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 z-10">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          {[
            { value: "10,000+", label: "Portfolios Tracked" },
            { value: "99.9%", label: "System Uptime" },
            { value: "$2.4B", label: "Assets Monitored" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl font-bold text-[var(--accent)] mb-2">{stat.value}</div>
              <div className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)] mt-auto z-10 text-center">
        <p className="text-[var(--text-secondary)] text-sm">© 2026 Terminal UI. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [timeRange, setTimeRange] = useState('1Y');

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors" onClick={onNavigate}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[var(--accent)] glow-accent flex items-center justify-center">
              <Activity size={16} color="var(--bg-primary)" />
            </div>
            <span className="font-syne font-bold text-lg tracking-tight">TERMINAL</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: Briefcase, label: "Portfolio" },
            { icon: Star, label: "Watchlist" },
            { icon: Newspaper, label: "News" },
            { icon: Settings, label: "Settings" },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium
                ${item.active 
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                }`}
            >
              <item.icon size={18} className={item.active ? 'text-[var(--accent)]' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)]">
              <User size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-[var(--text-primary)]">Alex Mercer</span>
              <span className="text-xs text-[var(--text-secondary)]">Pro Tier</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="h-20 border-b border-[var(--border)] px-8 flex items-center justify-between sticky top-0 bg-[#0A0B0D]/90 backdrop-blur z-20">
          <h2 className="font-syne text-2xl font-semibold">Overview</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="Total Value" 
              value="$20,450.00" 
              delta="+12.5%" 
              isPositive={true} 
            />
            <KpiCard 
              title="Today's Return" 
              value="+$342.50" 
              delta="+1.7%" 
              isPositive={true} 
            />
            <KpiCard 
              title="Best Performer" 
              value="NVDA" 
              delta="+37.89%" 
              isPositive={true} 
              subtext="$620.50"
            />
            <KpiCard 
              title="Portfolio Beta" 
              value="1.12" 
              delta="-0.04" 
              isPositive={false} 
              subtext="vs S&P 500"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Performance Chart */}
            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 hover-lift flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-syne font-semibold text-lg">Performance</h3>
                <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-md border border-[var(--border)]">
                  {['1W', '1M', '3M', '1Y'].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                        timeRange === range 
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'IBM Plex Mono' }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'IBM Plex Mono' }} 
                      tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--accent)" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6, fill: 'var(--bg-primary)', stroke: 'var(--accent)', strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Allocation Donut */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 hover-lift flex flex-col">
              <h3 className="font-syne font-semibold text-lg mb-6">Allocation</h3>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isPie />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[var(--text-secondary)] text-xs uppercase tracking-widest">Holdings</span>
                  <span className="text-[var(--text-primary)] font-bold text-xl">{allocationData.length}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {allocationData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-sm text-[var(--text-secondary)] ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Holdings Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 hover-lift overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-syne font-semibold text-lg">Current Holdings</h3>
              <button className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th className="text-right">Shares</th>
                    <th className="text-right">Avg Cost</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total Value</th>
                    <th className="text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsData.map((asset) => {
                    const totalValue = asset.shares * asset.price;
                    const isPositive = asset.pl >= 0;
                    return (
                      <tr key={asset.ticker}>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--text-primary)]">{asset.ticker}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{asset.name}</span>
                          </div>
                        </td>
                        <td className="text-right text-[var(--text-primary)]">{asset.shares}</td>
                        <td className="text-right text-[var(--text-secondary)]">${asset.avgCost.toFixed(2)}</td>
                        <td className="text-right text-[var(--text-primary)]">${asset.price.toFixed(2)}</td>
                        <td className="text-right text-[var(--text-primary)] font-medium">${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="text-right">
                          <span className={`inline-flex items-center justify-end gap-1 px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] text-sm font-medium ${isPositive ? 'text-[var(--accent)]' : 'text-[var(--accent-red)]'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPositive ? '+' : ''}{asset.pl}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Subcomponents

function KpiCard({ title, value, delta, isPositive, subtext }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 hover-lift relative overflow-hidden group">
      {/* Subtle top glow line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isPositive ? 'bg-[var(--accent)]' : 'bg-[var(--accent-red)]'}`} style={{ boxShadow: `0 0 10px ${isPositive ? 'rgba(0,211,149,0.5)' : 'rgba(255,77,77,0.5)'}` }}></div>
      
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[var(--text-secondary)] text-sm font-medium">{title}</h4>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-[rgba(255,255,255,0.03)] ${isPositive ? 'text-[var(--accent)]' : 'text-[var(--accent-red)]'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{value}</span>
        {subtext && <span className="text-sm text-[var(--text-secondary)]">{subtext}</span>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, isPie }) => {
  if (active && payload && payload.length) {
    if (isPie) {
      return (
        <div className="custom-tooltip">
          <p className="text-[var(--text-primary)] font-medium text-sm mb-1">{payload[0].name}</p>
          <p className="text-[var(--accent)] font-bold text-lg">{payload[0].value}%</p>
        </div>
      );
    }
    return (
      <div className="custom-tooltip">
        <p className="text-[var(--text-secondary)] text-xs mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-[var(--accent)] font-bold text-lg">
          ${payload[0].value.toLocaleString('en-US')}
        </p>
      </div>
    );
  }
  return null;
};
