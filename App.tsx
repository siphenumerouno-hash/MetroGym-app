
import React, { useState, useEffect } from 'react';
import { useGymStore } from './store';
import { View, SessionRun, SessionPlan } from './types';
import HomeScreen from './screens/HomeScreen';
import BuildScreen from './screens/BuildScreen';
import ActiveSessionScreen from './screens/ActiveSessionScreen';
import ReviewScreen from './screens/ReviewScreen';
import ProgressScreen from './screens/ProgressScreen';
import CommunityScreen from './screens/CommunityScreen';
import { 
  Home as HomeIcon, 
  PlusCircle, 
  BarChart2, 
  Users 
} from 'lucide-react';

const MetroLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" />
    <path 
      d="M20 50H35L42 30L58 70L65 50H80" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const App: React.FC = () => {
  const store = useGymStore();
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [lastFinishedRun, setLastFinishedRun] = useState<SessionRun | null>(null);

  // Resume active session if found
  useEffect(() => {
    if (store.activePlan && currentView !== 'REVIEW' && currentView !== 'ACTIVE') {
      setCurrentView('ACTIVE');
    }
  }, [store.activePlan]);

  const handleSessionComplete = (run: SessionRun) => {
    store.completeSession(run);
    setLastFinishedRun(run);
    setCurrentView('REVIEW');
  };

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <HomeScreen store={store} onStartBuild={() => setCurrentView('BUILD')} />;
      case 'BUILD':
        return <BuildScreen store={store} onStarted={() => setCurrentView('ACTIVE')} />;
      case 'ACTIVE':
        return <ActiveSessionScreen store={store} onComplete={handleSessionComplete} onCancel={() => { store.cancelActiveSession(); setCurrentView('HOME'); }} />;
      case 'REVIEW':
        return lastFinishedRun ? (
          <ReviewScreen 
            run={lastFinishedRun} 
            store={store} 
            onFinished={() => { setLastFinishedRun(null); setCurrentView('HOME'); }} 
          />
        ) : <HomeScreen store={store} onStartBuild={() => setCurrentView('BUILD')} />;
      case 'PROGRESS':
        return <ProgressScreen store={store} />;
      case 'COMMUNITY':
        return <CommunityScreen store={store} />;
      default:
        return <HomeScreen store={store} onStartBuild={() => setCurrentView('BUILD')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 overflow-hidden relative shadow-2xl border-x border-slate-900">
      {/* Top Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <MetroLogo size={32} className="text-yellow-400" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic leading-tight">
              Metro<span className="text-yellow-400">Gym</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Gym Journal</p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('PROFILE')}
          className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-900 hover:border-yellow-400 transition-colors"
        >
          <img src={store.user.avatar} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      {currentView !== 'ACTIVE' && currentView !== 'REVIEW' && (
        <nav className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-900 flex justify-around items-center py-4 px-2 z-20">
          <NavButton 
            active={currentView === 'HOME'} 
            onClick={() => setCurrentView('HOME')} 
            icon={<HomeIcon size={22} />} 
            label="Home" 
          />
          <NavButton 
            active={currentView === 'BUILD'} 
            onClick={() => setCurrentView('BUILD')} 
            icon={<PlusCircle size={22} />} 
            label="Build" 
          />
          <NavButton 
            active={currentView === 'PROGRESS'} 
            onClick={() => setCurrentView('PROGRESS')} 
            icon={<BarChart2 size={22} />} 
            label="Stats" 
          />
          <NavButton 
            active={currentView === 'COMMUNITY'} 
            onClick={() => setCurrentView('COMMUNITY')} 
            icon={<Users size={22} />} 
            label="Social" 
          />
        </nav>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-colors ${active ? 'text-yellow-400' : 'text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
