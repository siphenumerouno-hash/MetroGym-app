
import React from 'react';
import { useGymStore } from '../store';
import { ThumbsUp, Zap, Clock } from 'lucide-react';
import { SessionStatus } from '../types';

const CommunityScreen: React.FC<{ store: ReturnType<typeof useGymStore> }> = ({ store }) => {
  return (
    <div className="px-6 space-y-6 pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">Locker Room</h2>
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Community Feed</p>
      </div>

      <div className="space-y-6">
        {store.communityPosts.map((post) => (
          <div key={post.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-xs text-white uppercase">{post.userName}</h4>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{post.workoutType}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${post.endedStatus === SessionStatus.ON_TIME ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600'}`}>
                <Zap size={14} fill="currentColor" />
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Clock size={12} className="text-slate-600" />
                <span className="text-[10px] font-black text-white">{post.duration}</span>
              </div>
              <span className={`text-[10px] font-black uppercase ${post.endedStatus === 'ON_TIME' ? 'text-yellow-400' : 'text-slate-700'}`}>
                {post.endedStatus}
              </span>
            </div>

            {post.caption && (
              <p className="text-slate-400 text-xs font-medium leading-relaxed italic border-l border-yellow-400/30 pl-3">
                {post.caption}
              </p>
            )}

            <div className="pt-2 flex items-center space-x-4">
              <button 
                onClick={() => store.likePost(post.id)}
                className="flex items-center space-x-2 text-slate-600 hover:text-yellow-400 transition-colors"
              >
                <ThumbsUp size={16} />
                <span className="text-[10px] font-black">{post.likesCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityScreen;
