export interface Team {
  id: number
  name: string
  code: string
  flag_url: string | null
  group_letter: string | null
}

export interface Match {
  id: number
  home_team_id: number
  away_team_id: number
  home_score: number | null
  away_score: number | null
  match_date: string | null
  stage: string
  group_letter: string | null
  is_finished: boolean
  created_at: string
  home_team?: Team
  away_team?: Team
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  home_score: number
  away_score: number
  points_earned: number
  created_at: string
  match?: Match
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  points: number
  created_at: string
}

export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
}

export interface PredictionWithMatch extends Prediction {
  match: MatchWithTeams
}
