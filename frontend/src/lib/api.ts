const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScoreBreakdown {
  technical_depth: number;
  output_quality: number;
  consistency: number;
  collaboration: number;
  specialization: number;
}

export interface RepoSummary {
  repo_full_name: string;
  repo_url: string | null;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  is_fork: boolean;
  analysis_data: Record<string, unknown> | null;
}

export interface EngineerCard {
  id: string;
  github_username: string;
  name: string | null;
  avatar_url: string | null;
  location: string | null;
  talent_score: number | null;
  profile_confidence: number | null;
  archetype: string | null;
  primary_languages: Record<string, number> | null;
  expertise_areas: string[] | null;
  would_hire_score: number | null;
}

export interface SkillMatrixItem {
  skill: string;
  category: string;
  proficiency_level: string;
  years_experience?: number;
  evidence: string;
}

export interface ResumeData {
  candidate_summary: string;
  resume_score: number;
  skills_extracted: string[];
  experience: Array<{ role: string; company: string; duration: string; highlights: string[] }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  projects: Array<{ name: string; description: string }>;
  achievements: string[];
  certifications: string[];
  skill_matrix: SkillMatrixItem[];
  strengths: string[];
  weaknesses: string[];
}

export interface JDMatchResponse {
  job_title?: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: { required_level: string; candidate_level: string; is_match: boolean };
  candidate_fit: string;
  improvement_suggestions: string[];
  reasoning: Record<string, string>;
}

export interface TimelineEvent {
  date: string;
  event_type: string;
  repo_name: string;
  description: string;
  impact: string;
}

export interface AuthenticityData {
  authenticity_score: number;
  confidence_level: string;
  supporting_evidence: string[];
  timeline_summary: TimelineEvent[];
  repository_evolution: string;
  commit_cadence: string;
  refactoring_insights: string;
  code_consistency_notes: string;
  explainable_reasoning: string;
}

export interface SkillScoreDetail {
  domain: string;
  score: number;
  level: string;
  evidence: string[];
  reasoning: string;
}

export interface EngineeringSkillsAssessment {
  backend: SkillScoreDetail;
  frontend: SkillScoreDetail;
  ai_ml: SkillScoreDetail;
  devops: SkillScoreDetail;
  security: SkillScoreDetail;
  testing: SkillScoreDetail;
  system_design: SkillScoreDetail;
  database_design: SkillScoreDetail;
  cloud: SkillScoreDetail;
  scalability: SkillScoreDetail;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  repo_context: string;
  ideal_answer_points: string[];
  rationale: string;
}

export interface InterviewQuestionsData {
  easy: InterviewQuestion[];
  medium: InterviewQuestion[];
  hard: InterviewQuestion[];
}

export interface AdaptiveFollowupResponse {
  rating: string;
  follow_up_question: string;
  harder_question: string;
  easier_question: string;
  alternative_scenario: string;
  deeper_architecture_question: string;
  guidance_notes: string;
}

export interface HiringRecommendationData {
  recommendation: string;
  overall_fit: string;
  engineering_maturity: string;
  confidence_score: number;
  strengths: string[];
  risks: string[];
  supporting_evidence: string[];
  final_summary: string;
}

export interface AgentProgressStep {
  agent_id: string;
  agent_name: string;
  status: string;
  detail: string;
}

export interface AgentProgressState {
  username: string;
  current_agent: string;
  steps: AgentProgressStep[];
}

export interface EngineerProfile extends EngineerCard {
  github_id: number;
  bio: string | null;
  email: string | null;
  blog_url: string | null;
  company: string | null;
  followers: number;
  following: number;
  public_repos: number;
  ai_summary: string | null;
  strengths: string[] | null;
  growth_areas: string[] | null;
  frameworks: string[] | null;
  domains: string[] | null;
  gaming_warnings: string[] | null;
  resume_data?: ResumeData | null;
  authenticity_data?: AuthenticityData | null;
  skills_assessment?: EngineeringSkillsAssessment | null;
  interview_questions?: InterviewQuestionsData | null;
  hiring_recommendation?: HiringRecommendationData | null;
  score_breakdown: ScoreBreakdown | null;
  top_repos: RepoSummary[];
  created_at: string | null;
  last_analyzed_at: string | null;
}

export interface EngineerListResponse {
  engineers: EngineerCard[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalysisResponse {
  status: string;
  message: string;
  engineer_id: string | null;
  profile: EngineerProfile | null;
  agent_progress?: AgentProgressState | null;
}

export interface PlatformStats {
  total_engineers: number;
  avg_talent_score: number;
  avg_confidence: number;
}

// ── API Functions ───────────────────────────────────────────────

export async function analyzeEngineer(
  username: string
): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/analyze/${username}`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Analysis failed (${res.status})`);
  }
  return res.json();
}

export async function getEngineers(params: {
  query?: string;
  languages?: string;
  archetype?: string;
  talent_score_min?: number;
  talent_score_max?: number;
  confidence_min?: number;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}): Promise<EngineerListResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const res = await fetch(`${API_BASE}/api/engineers?${searchParams}`);
  if (!res.ok) throw new Error(`Failed to fetch engineers (${res.status})`);
  return res.json();
}

export async function getEngineer(id: string): Promise<EngineerProfile> {
  const res = await fetch(`${API_BASE}/api/engineers/${id}`);
  if (!res.ok) throw new Error(`Engineer not found (${res.status})`);
  return res.json();
}

export async function getEngineerByUsername(username: string): Promise<EngineerProfile> {
  const res = await fetch(`${API_BASE}/api/engineers/by-username/${username}`);
  if (!res.ok) throw new Error(`Engineer not found`);
  return res.json();
}

export async function getStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_BASE}/api/engineers/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
  return res.json();
}

export async function getArchetypes(): Promise<
  { archetype: string; count: number }[]
> {
  const res = await fetch(`${API_BASE}/api/engineers/archetypes`);
  if (!res.ok) return [];
  return res.json();
}

export async function matchJobDescription(
  engineerId: string,
  jobDescription: string,
  jobTitle: string = "Software Engineer"
): Promise<JDMatchResponse> {
  const res = await fetch(`${API_BASE}/api/copilot/match-jd/${engineerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_description: jobDescription, job_title: jobTitle }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Job matching failed (${res.status})`);
  }
  return res.json();
}

export async function parseResumeText(
  resumeText: string,
  candidateId?: string
): Promise<ResumeData> {
  const res = await fetch(`${API_BASE}/api/copilot/parse-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText, candidate_id: candidateId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Resume parsing failed (${res.status})`);
  }
  return res.json();
}

export async function evaluateAdaptiveInterview(
  payload: {
    original_question: string;
    category: string;
    difficulty: string;
    repo_context?: string;
    user_response_rating: "correct" | "partially_correct" | "incorrect";
    candidate_answer_notes?: string;
  }
): Promise<AdaptiveFollowupResponse> {
  const res = await fetch(`${API_BASE}/api/copilot/adaptive-interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Adaptive interview call failed (${res.status})`);
  }
  return res.json();
}

