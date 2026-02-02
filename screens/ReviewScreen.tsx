
import React, { useState } from 'react';
import { useGymStore } from '../store';
import { SessionRun, SessionStatus } from '../types';
import { Star, MessageSquare, Share2, ArrowRight } from 'lucide-react';

interface Props {
  run: SessionRun;
  store: ReturnType<typeof useGymStore>;
  onFinished: () => void;
}

const ReviewScreen: React.FC<Props> = ({ run, store, onFinished }) => {
  const [rating, setRating] = useState(8);
  const [stars, setStars] = useState(4);
  const [comment, setComment] = useState('');
  const [shared, setShared] = useState(false);

  const handleFinish = () => {
    // Update the run object with user ratings
    const finalRun = { ...run, selfRating10: rating, stars5: stars, commentText: comment };
    // The run is already saved in completeSession, but we could update it here if needed.
    // In this simple implementation, we just exit.
    onFinished();
  };

  const handleShare = () => {
    store.createPost({ ...run, commentText: comment }, comment);
    setShared(true);
  };

  return (
    <div className="px-6 py-10 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Mission Complete</h2>
        <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${run.endedStatus === SessionStatus.ON_TIME ? 'bg-green-500/20 text-green-500' : run.endedStatus === SessionStatus.LATE ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
          {run.endedStatus} Finisher
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rate Your Effort (1-10)</label>
          <div className="flex justify-between items-center bg-slate-900 rounded-2xl p-4">
            <input 
              type="range" min="1" max="10" 
              className="flex-1 accent-orange-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            />
            <span className="ml-4 w-10 text-center font-black text-orange-500 text-xl">{rating}</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Quality</label>
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5].map((s) => (
              <button 
                key={s} 
                onClick={() => setStars(s)}
                className={`transition-all ${stars >= s ? 'text-yellow-400 scale-110' : 'text-slate-700'}`}
              >
                <Star size={32} fill={stars >= s ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Journal</label>
          <div className="relative">
            <textarea 
              placeholder="How did it feel? Any PRs?"
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:border-orange-500 transition-all outline-none h-32 resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <MessageSquare size={16} className="absolute bottom-4 right-4 text-slate-700" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleShare}
          disabled={shared}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${shared ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'}`}
        >
          {shared ? <Star size={20} /> : <Share2 size={20} />}
          <span>{shared ? 'Posted to Community' : 'Post to Feed'}</span>
        </button>

        <button 
          onClick={handleFinish}
          className="w-full text-slate-500 py-4 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
        >
          <span>Skip & Return Home</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ReviewScreen;
