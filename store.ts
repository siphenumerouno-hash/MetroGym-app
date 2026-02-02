
import { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  SessionPlan, 
  SessionRun, 
  CommunityPost, 
  SessionStatus, 
  MuscleGroup, 
  CardioPlacement 
} from './types';

const INITIAL_USER: UserProfile = {
  id: 'user-1',
  name: 'Champion User',
  avatar: 'https://picsum.photos/seed/gym1/100/100',
  weeklyGoalTarget: 4,
  streakCount: 3,
  disciplineScore: 85,
  achievements: [
    { id: '1', title: 'First Session', description: 'Welcome to the gym!', icon: '🏆', earnedAt: new Date().toISOString() }
  ]
};

const MOCK_COMMUNITY: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    userName: 'Alex Iron',
    userAvatar: 'https://picsum.photos/seed/gym2/100/100',
    sessionRunId: 'run-mock-1',
    workoutType: MuscleGroup.UPPER,
    duration: '45m',
    overtime: 120,
    endedStatus: SessionStatus.LATE,
    caption: 'Pushing through the plateau today! 💪 #NoPainNoGain',
    likesCount: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'post-2',
    userId: 'user-3',
    userName: 'Sarah Strong',
    userAvatar: 'https://picsum.photos/seed/gym3/100/100',
    sessionRunId: 'run-mock-2',
    workoutType: MuscleGroup.FULL,
    duration: '60m',
    overtime: 0,
    endedStatus: SessionStatus.ON_TIME,
    caption: 'Perfectly timed session. Feeling energized!',
    likesCount: 24,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export const useGymStore = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gym_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [sessionPlans, setSessionPlans] = useState<SessionPlan[]>(() => {
    const saved = localStorage.getItem('gym_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessionRuns, setSessionRuns] = useState<SessionRun[]>(() => {
    const saved = localStorage.getItem('gym_runs');
    return saved ? JSON.parse(saved) : [];
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('gym_community');
    return saved ? JSON.parse(saved) : MOCK_COMMUNITY;
  });

  const [activePlan, setActivePlan] = useState<SessionPlan | null>(() => {
    const saved = localStorage.getItem('gym_active_plan');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeStartTime, setActiveStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('gym_active_start_time');
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('gym_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gym_plans', JSON.stringify(sessionPlans));
  }, [sessionPlans]);

  useEffect(() => {
    localStorage.setItem('gym_runs', JSON.stringify(sessionRuns));
  }, [sessionRuns]);

  useEffect(() => {
    localStorage.setItem('gym_community', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    if (activePlan) localStorage.setItem('gym_active_plan', JSON.stringify(activePlan));
    else localStorage.removeItem('gym_active_plan');
  }, [activePlan]);

  useEffect(() => {
    if (activeStartTime) localStorage.setItem('gym_active_start_time', activeStartTime.toString());
    else localStorage.removeItem('gym_active_start_time');
  }, [activeStartTime]);

  const addPlan = (plan: SessionPlan) => setSessionPlans(prev => [plan, ...prev]);

  const startSession = (plan: SessionPlan) => {
    setActivePlan(plan);
    setActiveStartTime(Date.now());
  };

  const completeSession = (run: SessionRun) => {
    setSessionRuns(prev => [run, ...prev]);
    setActivePlan(null);
    setActiveStartTime(null);

    // Update Discipline Score and Streaks
    const recentRuns = [run, ...sessionRuns];
    const onTimeCount = recentRuns.filter(r => r.endedStatus === SessionStatus.ON_TIME).length;
    const newDisciplineScore = Math.min(100, Math.round((onTimeCount / recentRuns.length) * 100) + 20); // Boost for completion
    
    // Achievement Logic
    const newAchievements = [...user.achievements];
    if (recentRuns.length === 1 && !newAchievements.find(a => a.id === '1')) {
      newAchievements.push({ id: '1', title: 'First Session', description: 'Welcome to the gym!', icon: '🏆', earnedAt: new Date().toISOString() });
    }
    if (run.endedStatus === SessionStatus.ON_TIME && !newAchievements.find(a => a.id === 'on-time')) {
       newAchievements.push({ id: 'on-time', title: 'On-Time Finisher', description: 'Perfect timing!', icon: '⏱️', earnedAt: new Date().toISOString() });
    }

    setUser(prev => ({
      ...prev,
      disciplineScore: newDisciplineScore,
      streakCount: prev.streakCount + 1,
      achievements: newAchievements
    }));
  };

  const createPost = (run: SessionRun, caption: string) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      sessionRunId: run.id,
      workoutType: activePlan?.workoutType || MuscleGroup.FULL,
      duration: `${Math.floor(run.actualDurationSeconds / 60)}m`,
      overtime: run.overtimeSeconds,
      endedStatus: run.endedStatus,
      caption: caption || 'Finished a solid workout!',
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  return {
    user,
    sessionPlans,
    sessionRuns,
    communityPosts,
    activePlan,
    activeStartTime,
    addPlan,
    startSession,
    completeSession,
    createPost,
    likePost,
    cancelActiveSession: () => {
      setActivePlan(null);
      setActiveStartTime(null);
    }
  };
};
