export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  avatar_emoji: string;
  timezone: string;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;
  quests_done: number;
  hard_done: number;
  correct_answers: number;
  created_at: string;
}

export interface Quest {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "oson" | "orta" | "qiyin";
  xp: number;
  topic: string;
  question_count: number;
  need_correct: number;
  done: boolean;
  score: number | null;
  total: number | null;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface QuizReviewItem {
  id: number;
  correct: number;
  ok: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  passed?: boolean;
  rewarded?: boolean;
  xp: number;
  review: QuizReviewItem[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  is_open: boolean;
  leader_id: string;
  xp: number;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: "leader" | "member";
  xp_contributed: number;
  joined_at: string;
  profiles?: Pick<Profile, "username" | "display_name" | "avatar_emoji" | "avatar_url" | "level">;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  kind: string;
  threshold: number;
  xp_reward: number;
  sort: number;
}

export interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface LeaderRow {
  rank: number;
  id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  quests_done: number;
}

export interface TeamRank {
  rank: number;
  id: string;
  name: string;
  emoji: string;
  color: string;
  xp: number;
  level: number;
  members: number;
}

export interface SpaceEvent {
  id: number;
  kind: "meteor" | "eclipse" | "conjunction" | "mission";
  title: string;
  description: string;
  starts_on: string;
  note: string | null;
}
