
import React from 'react';
import { useGymStore } from '../store';
import { Flame, Trophy, ChevronRight } from 'lucide-react';

interface Props {
  store: ReturnType<typeof useGymStore>;
  onStartBuild: () => void;
}

const HomeScreen: React.FC<Props> = ({ store, onStartBuild }) => {
  const { user } = store;

  return (
    <div className="px-6 space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
              <Flame size={20} />
            </span>
            <span className="text-2xl font-black text-white">{user.streakCount}</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day Streak</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
              <Trophy size={20} />
            </span>
            <span className="text-2xl font-black text-white">{user.disciplineScore}</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discipline</p>
        </div>
      </div>

      {/* Weekly Progress Banner */}
      <div className="bg-yellow-400 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-yellow-400/10">
        <div className="relative z-10 flex justify-between items-center text-slate-950">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black uppercase tracking-tight italic">Weekly Target</h3>
            <p className="text-slate-900/70 text-xs font-bold">{store.sessionRuns.length} of {user.weeklyGoalTarget} sessions done</p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-slate-950/10 flex items-center justify-center">
            <span className="font-black text-lg">{Math.round((store.sessionRuns.length / user.weeklyGoalTarget) * 100)}%</span>
          </div>
        </div>
        <div className="mt-5 h-2 bg-slate-950/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-slate-950 transition-all duration-500" 
            style={{ width: `${Math.min(100, (store.sessionRuns.length / user.weeklyGoalTarget) * 100)}%` }}
          />
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={onStartBuild}
        className="w-full bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] transition-all text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-yellow-400/20"
      >
        <PlusCircle size={22} />
        <span className="text-base uppercase tracking-tight">New Training Session</span>
      </button>

      {/* Recent History Preview */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Recent Logs</h3>
        {store.sessionRuns.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-600 text-[10px] font-bold uppercase">No data points</p>
          </div>
        ) : (
          <div className="space-y-2">
            {store.sessionRuns.slice(0, 3).map((run) => (
              <div key={run.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`w-1.5 h-8 rounded-full ${run.endedStatus === 'ON_TIME' ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{run.commentText || "Training Session"}</h4>
                    <p className="text-[9px] uppercase font-black tracking-[0.1em] text-slate-500">
                      {new Date(run.createdAt).toLocaleDateString()} • {Math.floor(run.actualDurationSeconds / 60)}m
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-700" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PlusCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export default HomeScreen;
