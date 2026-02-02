
import React, { useState } from 'react';
import { useGymStore } from '../store';
import { MuscleGroup, CardioPlacement, SessionPlan, Exercise } from '../types';
import { generateWorkout } from '../services/gemini';
import { Sparkles, Clock, Plus, Trash2, Loader2, Hash } from 'lucide-react';

interface Props {
  store: ReturnType<typeof useGymStore>;
  onStarted: () => void;
}

const BuildScreen: React.FC<Props> = ({ store, onStarted }) => {
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [type, setType] = useState<MuscleGroup>(MuscleGroup.FULL);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [cardio, setCardio] = useState<CardioPlacement>(CardioPlacement.NONE);
  const [cardioMins, setCardioMins] = useState(15);
  const [plannedMins, setPlannedMins] = useState(60);
  const [targetCount, setTargetCount] = useState(4);

  const handleGenerate = async () => {
    if (!goal.trim()) return alert("State your objective.");
    setLoading(true);
    try {
      const suggested = await generateWorkout(goal, type, targetCount);
      if (suggested.exercises) setExercises(suggested.exercises as Exercise[]);
      if (suggested.cardioPlacement) setCardio(suggested.cardioPlacement);
      if (suggested.cardioMinutes) setCardioMins(suggested.cardioMinutes);
      if (suggested.plannedDurationMinutes) setPlannedMins(suggested.plannedDurationMinutes);
    } catch (e) {
      alert("AI generator offline. Manual input required.");
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    const newEx: Exercise = {
      id: `man-${Date.now()}`,
      name: '',
      muscleGroup: type,
      sets: 3,
      reps: '10'
    };
    setExercises([...exercises, newEx]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const startNow = () => {
    if (exercises.length === 0) return alert("Define your regimen first.");
    const plan: SessionPlan = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString(),
      goalText: goal || 'Standard Training',
      workoutType: type,
      exerciseCount: exercises.length,
      exercises,
      cardioPlacement: cardio,
      cardioMinutes: cardioMins,
      plannedDurationMinutes: plannedMins
    };
    store.addPlan(plan);
    store.startSession(plan);
    onStarted();
  };

  return (
    <div className="px-6 space-y-8 pb-10">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Training Objective</label>
        <textarea 
          placeholder="e.g. Peak power development"
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:border-yellow-400 transition-colors outline-none resize-none h-20 font-bold"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Focus Sector</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(MuscleGroup).map((m) => (
            <button
              key={m}
              onClick={() => setType(m)}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${type === m ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              {m.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Exercise Count</label>
          <div className="flex items-center space-x-2 bg-slate-900 rounded-lg px-3 py-1 border border-slate-800">
            <Hash size={12} className="text-yellow-400" />
            <input 
              type="number" 
              className="bg-transparent text-xs font-black text-white w-8 outline-none text-center"
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 p-4 rounded-2xl flex items-center justify-center space-x-2 font-black uppercase text-xs transition-all shadow-md"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>Session generator</span>
          </button>
          <button 
            onClick={addExercise}
            className="bg-slate-900 border-2 border-slate-800 text-slate-500 px-6 rounded-2xl hover:border-slate-700"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Session Blueprint ({exercises.length})</label>
          {exercises.map((ex, idx) => (
            <div key={ex.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">Protocol {idx + 1}</span>
                <button onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
              <input 
                placeholder="Exercise Name"
                className="bg-transparent text-sm font-black border-none outline-none text-white placeholder-slate-800 w-full"
                value={ex.name}
                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
              />
              <div className="flex space-x-4 border-t border-slate-800 pt-3">
                <div className="flex-1 space-y-1">
                  <p className="text-[7px] font-black text-slate-600 uppercase">Sets</p>
                  <input 
                    type="number" 
                    className="bg-slate-950 w-full rounded-lg p-2 text-xs font-black border border-slate-800 text-white outline-none focus:border-yellow-400" 
                    value={ex.sets} 
                    onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })} 
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[7px] font-black text-slate-600 uppercase">Reps</p>
                  <input 
                    type="text" 
                    className="bg-slate-950 w-full rounded-lg p-2 text-xs font-black border border-slate-800 text-white outline-none focus:border-yellow-400" 
                    value={ex.reps} 
                    onChange={(e) => updateExercise(ex.id, { reps: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900/50 p-6 rounded-3xl space-y-6 border border-slate-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Planned Minutes</span>
          </div>
          <input 
            type="number" 
            className="bg-slate-950 w-16 text-center rounded-lg p-2 text-xs font-black border border-slate-800 text-yellow-400 outline-none focus:border-yellow-400" 
            value={plannedMins} 
            onChange={(e) => setPlannedMins(parseInt(e.target.value) || 0)} 
          />
        </div>
      </div>

      <button 
        onClick={startNow}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 py-5 rounded-2xl font-black uppercase text-lg tracking-tight transition-all active:scale-95 shadow-xl shadow-yellow-400/10"
      >
        Initiate Program
      </button>
    </div>
  );
};

export default BuildScreen;
