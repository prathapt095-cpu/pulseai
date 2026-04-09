import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  AlertTriangle, 
  TrendingDown, 
  MessageSquare, 
  Activity, 
  ChevronRight,
  Mail,
  Smartphone,
  Send,
  X,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { UserBehavior, OutreachMessage, ChurnInsight } from '../types';
import { getChurnInsight, generateOutreach } from '../services/geminiService';
import { cn } from '../lib/utils';

const MOCK_USERS: UserBehavior[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    loginFrequency: 2,
    avgSessionDuration: 5,
    featureUsage: [{ feature: 'Dashboard', count: 10 }, { feature: 'Reports', count: 2 }],
    lastActive: '2026-04-05T10:00:00Z',
    status: 'at-risk',
    churnProbability: 75
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.s@example.com',
    loginFrequency: 12,
    avgSessionDuration: 25,
    featureUsage: [{ feature: 'Dashboard', count: 45 }, { feature: 'API', count: 30 }],
    lastActive: '2026-04-09T07:00:00Z',
    status: 'active',
    churnProbability: 5
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.b@example.com',
    loginFrequency: 0,
    avgSessionDuration: 0,
    featureUsage: [],
    lastActive: '2026-03-20T15:00:00Z',
    status: 'churned',
    churnProbability: 98
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    loginFrequency: 4,
    avgSessionDuration: 12,
    featureUsage: [{ feature: 'Dashboard', count: 15 }],
    lastActive: '2026-04-07T09:00:00Z',
    status: 'at-risk',
    churnProbability: 45
  }
];

const MOCK_CHART_DATA = [
  { name: 'Mon', active: 400, atRisk: 240 },
  { name: 'Tue', active: 300, atRisk: 139 },
  { name: 'Wed', active: 200, atRisk: 980 },
  { name: 'Thu', active: 278, atRisk: 390 },
  { name: 'Fri', active: 189, atRisk: 480 },
  { name: 'Sat', active: 239, atRisk: 380 },
  { name: 'Sun', active: 349, atRisk: 430 },
];

export default function Dashboard() {
  const [users, setUsers] = useState<UserBehavior[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<UserBehavior | null>(null);
  const [insight, setInsight] = useState<ChurnInsight | null>(null);
  const [outreach, setOutreach] = useState<Partial<OutreachMessage> | null>(null);
  const [loading, setLoading] = useState(false);
  const [outreachHistory, setOutreachHistory] = useState<OutreachMessage[]>([]);

  const handleAnalyze = async (user: UserBehavior) => {
    setLoading(true);
    setSelectedUser(user);
    const churnInsight = await getChurnInsight(user);
    setInsight(churnInsight);
    const outreachMsg = await generateOutreach(user, churnInsight);
    setOutreach(outreachMsg);
    setLoading(false);
  };

  const sendOutreach = () => {
    if (!outreach || !selectedUser) return;
    
    const newMessage: OutreachMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: selectedUser.id,
      userName: selectedUser.name,
      type: outreach.type || 'email',
      content: outreach.content || '',
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    setOutreachHistory([newMessage, ...outreachHistory]);
    setOutreach(null);
    setInsight(null);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">PulseAI Dashboard</h1>
          <p className="text-zinc-400 mt-1">Proactive Customer Success Management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm text-zinc-500 font-medium">3 Agents Active</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Total Users" value="1,284" trend="+12%" />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} label="At Risk" value="42" trend="+5%" />
        <StatCard icon={<TrendingDown className="w-5 h-5 text-rose-400" />} label="Churn Rate" value="2.4%" trend="-0.5%" />
        <StatCard icon={<Activity className="w-5 h-5 text-emerald-400" />} label="Active Now" value="156" trend="+18%" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">At-Risk Users</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                    user.status === 'at-risk' ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30" : "bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700"
                  )}
                  onClick={() => handleAnalyze(user)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Churn Risk</p>
                      <p className={cn(
                        "text-sm font-bold",
                        user.churnProbability > 70 ? "text-rose-400" : user.churnProbability > 40 ? "text-amber-400" : "text-emerald-400"
                      )}>
                        {user.churnProbability}%
                      </p>
                    </div>
                    <span className={cn("status-badge", `status-${user.status}`)}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Engagement Trends</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#60a5fa" fillOpacity={1} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="atRisk" stroke="#fbbf24" fillOpacity={1} fill="url(#colorAtRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar: Outreach & History */}
        <div className="space-y-8">
          {/* Outreach History */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Outreach</h2>
            <div className="space-y-4">
              {outreachHistory.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No outreach history yet</p>
                </div>
              ) : (
                outreachHistory.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase">{msg.type}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{msg.userName}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">AI Agent Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Churn Model</span>
                <span className="text-xs font-bold text-emerald-400">OPTIMIZED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Decision Engine</span>
                <span className="text-xs font-bold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Last Sync</span>
                <span className="text-xs font-bold text-zinc-500">2 MINS AGO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Analysis: {selectedUser.name}</h2>
                    <p className="text-xs text-zinc-500">Churn Probability: {selectedUser.churnProbability}%</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-sm text-zinc-400">AI Agent is analyzing behavior patterns...</p>
                  </div>
                ) : (
                  <>
                    {/* Insights */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Risk Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insight?.riskFactors.map((factor, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">AI Recommendation</h3>
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-100 text-sm leading-relaxed">
                        {insight?.recommendation}
                      </div>
                    </div>

                    {/* Generated Message */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Generated Outreach</h3>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            outreach?.type === 'email' ? "bg-blue-500/20 text-blue-400" : 
                            outreach?.type === 'whatsapp' ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"
                          )}>
                            {outreach?.type}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <textarea 
                          className="w-full h-32 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                          value={outreach?.content}
                          onChange={(e) => setOutreach({ ...outreach, content: e.target.value })}
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          {outreach?.type === 'email' && <Mail className="w-4 h-4 text-zinc-600" />}
                          {outreach?.type === 'whatsapp' && <Smartphone className="w-4 h-4 text-zinc-600" />}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={sendOutreach}
                  disabled={loading || !outreach}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-4 h-4" />
                  Send Outreach
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-zinc-800/50">
          {icon}
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-zinc-500 font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
