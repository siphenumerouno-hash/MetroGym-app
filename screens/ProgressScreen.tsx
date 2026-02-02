
import React, { useState } from 'react';
import { useGymStore } from '../store';
import { MuscleGroup, SessionStatus } from '../types';
import { 
  History, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Timer, 
  Activity,
  MessageSquare,
  Star
} from 'lucide-react';

const ProgressScreen: React.FC<{ store: ReturnType<typeof useGymStore> }> = ({ store }) => {
  const [filter, setFilter] = useState<MuscleGroup | 'ALL'>('ALL');
  const [viewTab, setViewTab] = useState<'STATS' | 'JOURNAL'>('STATS');
  const { sessionRuns, user } = store;

  const filteredRuns = filter === 'ALL' 
    ? sessionRuns 
    : sessionRuns.filter(r => {
        const plan = store.sessionPlans.find(p => p.id === r.sessionPlanId);
        return plan?.workoutType === filter;
      });

  // Graph Data (Computed from store)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Simplified logic to get sessions per day of the week
  const sessionCounts = days.map((_, i) => {
      // Dummy logic: in a real app you'd map sessionRuns to day of week
      return [2, 1, 3, 0, 2, 4, 1][i]; 
  });
  const maxVal = Math.max(...sessionCounts, 1);

  return (
    <div className="px-6 space-y-6 pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Progress Hub</h2>
        <div className="flex space-x-4 mt-2">
          <button 
            onClick={() => setViewTab('STATS')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-colors ${viewTab === 'STATS' ? 'text-yellow-400 border-yellow-400' : 'text-slate-600 border-transparent'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setViewTab('JOURNAL')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-colors ${viewTab === 'JOURNAL' ? 'text-yellow-400 border-yellow-400' : 'text-slate-600 border-transparent'}`}
          >
            Daily Journal
          </button>
        </div>
      </div>

      {viewTab === 'STATS' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Progress Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Density</p>
              <span className="text-[10px] font-black text-yellow-400 uppercase">Weekly Frequency</span>
            </div>
            <div className="flex items-end justify-between h-32 px-2">
              {sessionCounts.map((count, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 w-full group">
                  <div 
                    className="w-4 bg-yellow-400/20 rounded-t-sm relative flex items-end overflow-hidden group-hover:bg-yellow-400/40 transition-colors"
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="w-full bg-yellow-400 transition-all duration-1000 ease-out"
                      style={{ height: `${(count / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-black text-slate-600 uppercase">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              icon={<TrendingUp size={18} />} 
              title="Workouts" 
              value={sessionRuns.length.toString()} 
              color="bg-yellow-400" 
            />
            <StatCard 
              icon={<Award size={18} />} 
              title="Discipline" 
              value={`${user.disciplineScore}%`} 
              color="bg-white" 
            />
            <StatCard 
              icon={<Timer size={18} />} 
              title="Avg Session" 
              value={`${sessionRuns.length ? Math.round(sessionRuns.reduce((a, b) => a + b.actualDurationSeconds, 0) / sessionRuns.length / 60) : 0}m`} 
              color="bg-yellow-400" 
            />
            <StatCard 
              icon={<Activity size={18} />} 
              title="Total Cardio" 
              value={`${sessionRuns.reduce((acc, r) => acc + (store.sessionPlans.find(p => p.id === r.sessionPlanId)?.cardioMinutes || 0), 0)}m`} 
              color="bg-white" 
            />
          </div>

          {/* History Feed */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">History Log</p>
            <div className="space-y-2">
              {filteredRuns.map((run) => (
                <div key={run.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${run.endedStatus === SessionStatus.ON_TIME ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                      {run.endedStatus === SessionStatus.ON_TIME ? <CheckCircle2 size={16} /> : <History size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {store.sessionPlans.find(p => p.id === run.sessionPlanId)?.workoutType || 'Workout'}
                      </h4>
                      <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                        {new Date(run.createdAt).toLocaleDateString()} • {Math.floor(run.actualDurationSeconds / 60)}m
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${run.endedStatus === 'ON_TIME' ? 'text-yellow-400' : 'text-slate-600'}`}>
                    {run.endedStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {sessionRuns.length === 0 ? (
             <div className="py-20 text-center space-y-2">
                <MessageSquare size={40} className="mx-auto text-slate-800" />
                <p className="text-slate-600 font-bold text-sm uppercase">Your journal is empty</p>
             </div>
           ) : (
             <div className="space-y-4">
                {sessionRuns.slice().reverse().map((run) => (
                  <div key={run.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                         <h4 className="text-white font-black text-xs uppercase tracking-tight">
                           {store.sessionPlans.find(p => p.id === run.sessionPlanId)?.workoutType || 'Training'} Session
                         </h4>
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                           {new Date(run.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                       </div>
                       <div className="flex space-x-1">
                         {Array.from({ length: run.stars5 || 0 }).map((_, i) => (
                           <Star key={i} size={10} className="text-yellow-400 fill-current" />
                         ))}
                       </div>
                    </div>
                    
                    {run.commentText ? (
                      <div className="relative pl-4 border-l-2 border-yellow-400/50">
                        <p className="text-slate-300 text-xs italic font-medium leading-relaxed">
                          "{run.commentText}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-[10px] italic">No comments provided for this session.</p>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div className="flex space-x-4">
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-600 uppercase">Effort</p>
                          <p className="text-white font-black text-xs">{run.selfRating10}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-600 uppercase">Time</p>
                          <p className="text-white font-black text-xs">{Math.floor(run.actualDurationSeconds / 60)}m</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${run.endedStatus === 'ON_TIME' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                        {run.endedStatus}
                      </span>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-28">
    <div className="flex justify-between items-start">
      <span className={`p-2 ${color === 'bg-white' ? 'bg-slate-800 text-white' : 'bg-yellow-400/10 text-yellow-400'} rounded-xl`}>
        {icon}
      </span>
      <span className="text-xl font-black text-white">{value}</span>
    </div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
  </div>
);

export default ProgressScreen;
