
import React, { useState, useEffect, useRef } from 'react';
import { useGymStore } from '../store';
import { SessionRun, SessionStatus } from '../types';
import { Check, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  store: ReturnType<typeof useGymStore>;
  onComplete: (run: SessionRun) => void;
  onCancel: () => void;
}

const ActiveSessionScreen: React.FC<Props> = ({ store, onComplete, onCancel }) => {
  const { activePlan, activeStartTime } = store;
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [showConfirmStop, setShowConfirmStop] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const id = window.setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && activeStartTime) {
      const update = () => {
        setElapsed(Math.floor((Date.now() - activeStartTime) / 1000));
      };
      update();
      timerRef.current = window.setInterval(update, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [countdown, activeStartTime]);

  if (!activePlan) return null;

  const plannedSeconds = activePlan.plannedDurationMinutes * 60;
  const isOvertime = elapsed > plannedSeconds;
  const diff = elapsed - plannedSeconds;

  const formatTime = (seconds: number) => {
    const abs = Math.abs(seconds);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    const status = elapsed < (plannedSeconds - 120) ? SessionStatus.EARLY : 
                   elapsed > (plannedSeconds + 120) ? SessionStatus.LATE : 
                   SessionStatus.ON_TIME;
    
    const run: SessionRun = {
      id: `run-${Date.now()}`,
      sessionPlanId: activePlan.id,
      startTime: activeStartTime || Date.now(),
      endTime: Date.now(),
      plannedDurationMinutes: activePlan.plannedDurationMinutes,
      actualDurationSeconds: elapsed,
      overtimeSeconds: isOvertime ? diff : 0,
      endedStatus: status,
      selfRating10: 0,
      stars5: 0,
      commentText: '',
      createdAt: new Date().toISOString()
    };
    onComplete(run);
  };

  if (countdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 bg-yellow-400">
        <h2 className="text-slate-950 font-black text-4xl uppercase tracking-tighter italic">Prepare</h2>
        <div className="text-slate-950 text-[12rem] font-black leading-none">
          {countdown}
        </div>
        <p className="text-slate-950/60 font-black uppercase tracking-[0.3em] text-xs">Awaiting Execution</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-slate-950">
      {/* Timer Section */}
      <div className={`p-10 text-center transition-colors duration-500 flex flex-col items-center ${isOvertime ? 'bg-red-500/5' : 'bg-slate-950'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 mb-2">Elapsed</p>
        <div className={`text-6xl font-black tabular-nums tracking-tighter ${isOvertime ? 'text-red-500' : 'text-white'}`}>
          {formatTime(elapsed)}
        </div>
        
        {isOvertime ? (
          <div className="mt-4 flex items-center space-x-2 text-red-500 font-black uppercase text-[10px] tracking-widest bg-red-500/10 px-4 py-2 rounded-full">
            <AlertTriangle size={14} />
            <span>Overrun: +{formatTime(diff)}</span>
          </div>
        ) : (
          <div className="mt-4 w-40 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 transition-all duration-1000" 
              style={{ width: `${Math.min(100, (elapsed / plannedSeconds) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Checklist Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 border-b border-slate-900 pb-2">Regimen Checklist</p>
          {activePlan.exercises.map((ex) => (
            <div key={ex.id} className="space-y-3">
              <h4 className="font-black text-xs text-slate-300 uppercase tracking-tight">{ex.name}</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: ex.sets }).map((_, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-lg border-2 border-slate-800 flex items-center justify-center bg-slate-900 text-slate-600 transition-all active:scale-95"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.classList.toggle('bg-yellow-400');
                      btn.classList.toggle('border-yellow-400');
                      btn.classList.toggle('text-slate-950');
                    }}
                  >
                    <span className="font-black text-[10px]">{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stop Controls */}
      <div className="p-6 border-t border-slate-900">
        {!showConfirmStop ? (
          <button 
            onClick={() => setShowConfirmStop(true)}
            className="w-full bg-slate-900 text-slate-500 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border border-slate-800"
          >
            Terminal Session
          </button>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={handleStop}
              className="w-full bg-yellow-400 text-slate-950 py-4 rounded-xl font-black uppercase text-xs"
            >
              Confirm Completion
            </button>
            <button 
              onClick={() => setShowConfirmStop(false)}
              className="w-full text-slate-700 py-2 text-[10px] font-black uppercase"
            >
              Continue training
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionScreen;
