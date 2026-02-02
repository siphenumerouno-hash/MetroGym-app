
export enum MuscleGroup {
  UPPER = 'Upper Body',
  LOWER = 'Lower Body',
  FULL = 'Full Body',
  AEROBICS = 'Aerobics'
}

export enum CardioPlacement {
  START = 'Start',
  END = 'End',
  NONE = 'None'
}

export enum SessionStatus {
  EARLY = 'EARLY',
  ON_TIME = 'ON_TIME',
  LATE = 'LATE'
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string; // e.g., "8-12"
}

export interface SessionPlan {
  id: string;
  date: string;
  goalText: string;
  workoutType: MuscleGroup;
  exerciseCount: number;
  exercises: Exercise[];
  cardioPlacement: CardioPlacement;
  cardioMinutes: number;
  plannedDurationMinutes: number;
}

export interface SessionRun {
  id: string;
  sessionPlanId: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp
  plannedDurationMinutes: number;
  actualDurationSeconds: number;
  overtimeSeconds: number;
  endedStatus: SessionStatus;
  selfRating10: number;
  stars5: number;
  commentText: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  weeklyGoalTarget: number;
  streakCount: number;
  disciplineScore: number;
  achievements: Achievement[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  sessionRunId: string;
  workoutType: MuscleGroup;
  duration: string;
  overtime: number;
  endedStatus: SessionStatus;
  caption: string;
  likesCount: number;
  createdAt: string;
}

export type View = 'HOME' | 'BUILD' | 'ACTIVE' | 'REVIEW' | 'PROGRESS' | 'COMMUNITY' | 'PROFILE';
