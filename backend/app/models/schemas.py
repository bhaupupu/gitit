"""Pydantic schemas for API request/response serialization."""

from pydantic import BaseModel, Field
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=255)


class SearchFilters(BaseModel):
    languages: list[str] | None = None
    expertise_areas: list[str] | None = None
    archetype: str | None = None
    talent_score_min: float | None = None
    talent_score_max: float | None = None
    confidence_min: float | None = None
    query: str | None = None
    sort_by: str = "talent_score"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 20


class ParseResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=10)
    candidate_id: str | None = None


class JDMatchRequest(BaseModel):
    job_title: str | None = "Software Engineer"
    job_description: str = Field(..., min_length=20)


class AdaptiveFollowupRequest(BaseModel):
    original_question: str
    category: str
    difficulty: str
    repo_context: str | None = ""
    user_response_rating: str  # "correct", "partially_correct", "incorrect"
    candidate_answer_notes: str | None = ""


# ── Response Schemas & Component Schemas ──────────────────────────


class SkillMatrixItem(BaseModel):
    skill: str
    category: str
    proficiency_level: str  # "Beginner", "Intermediate", "Advanced", "Expert"
    years_experience: float | None = 0
    evidence: str


class ResumeAnalysis(BaseModel):
    candidate_summary: str
    resume_score: float  # 0-10 or 0-100
    skills_extracted: list[str]
    experience: list[dict]
    education: list[dict]
    projects: list[dict]
    achievements: list[str]
    certifications: list[str]
    skill_matrix: list[SkillMatrixItem]
    strengths: list[str]
    weaknesses: list[str]


class JDMatchResponse(BaseModel):
    job_title: str | None = None
    match_percentage: float
    matching_skills: list[str]
    missing_skills: list[str]
    experience_match: dict
    candidate_fit: str
    improvement_suggestions: list[str]
    reasoning: dict


class TimelineEvent(BaseModel):
    date: str
    event_type: str
    repo_name: str
    description: str
    impact: str


class AuthenticityAnalysis(BaseModel):
    authenticity_score: float  # 0-10 scale or 0-100
    confidence_level: str  # "High", "Medium", "Low"
    supporting_evidence: list[str]
    timeline_summary: list[TimelineEvent]
    repository_evolution: str
    commit_cadence: str
    refactoring_insights: str
    code_consistency_notes: str
    explainable_reasoning: str


class SkillScoreDetail(BaseModel):
    domain: str
    score: float  # 0-10
    level: str  # "Junior", "Mid", "Senior", "Staff+"
    evidence: list[str]
    reasoning: str


class EngineeringSkillsAssessment(BaseModel):
    backend: SkillScoreDetail
    frontend: SkillScoreDetail
    ai_ml: SkillScoreDetail
    devops: SkillScoreDetail
    security: SkillScoreDetail
    testing: SkillScoreDetail
    system_design: SkillScoreDetail
    database_design: SkillScoreDetail
    cloud: SkillScoreDetail
    scalability: SkillScoreDetail


class InterviewQuestion(BaseModel):
    id: str
    question: str
    difficulty: str  # "Easy", "Medium", "Hard"
    category: str  # "Architecture", "Trade-offs", "Debugging", "Security", "Scalability", "Performance", "Engineering Decisions"
    repo_context: str
    ideal_answer_points: list[str]
    rationale: str


class InterviewSuite(BaseModel):
    easy: list[InterviewQuestion]
    medium: list[InterviewQuestion]
    hard: list[InterviewQuestion]


class AdaptiveFollowupResponse(BaseModel):
    rating: str
    follow_up_question: str
    harder_question: str
    easier_question: str
    alternative_scenario: str
    deeper_architecture_question: str
    guidance_notes: str


class HiringRecommendation(BaseModel):
    recommendation: str  # "Strong Hire", "Hire", "Borderline", "No Hire"
    overall_fit: str
    engineering_maturity: str  # "Junior", "Mid-Level", "Senior", "Staff", "Principal"
    confidence_score: float  # 0-100%
    strengths: list[str]
    risks: list[str]
    supporting_evidence: list[str]
    final_summary: str


class AgentProgressStep(BaseModel):
    agent_id: str
    agent_name: str
    status: str  # "pending", "in_progress", "complete", "failed"
    detail: str


class AgentProgressState(BaseModel):
    username: str
    current_agent: str
    steps: list[AgentProgressStep]


class RepoSummary(BaseModel):
    repo_full_name: str
    repo_url: str | None = None
    description: str | None = None
    stars: int = 0
    forks: int = 0
    language: str | None = None
    is_fork: bool = False
    topics: list[str] | None = None
    readme_summary: str | None = None
    analysis_data: dict | None = None

    model_config = {"from_attributes": True}


class ScoreBreakdown(BaseModel):
    technical_depth: float = 0.0
    output_quality: float = 0.0
    consistency: float = 0.0
    collaboration: float = 0.0
    specialization: float = 0.0


class EngineerCard(BaseModel):
    """Compact view for search results / cards."""

    id: str
    github_username: str
    name: str | None = None
    avatar_url: str | None = None
    location: str | None = None
    talent_score: float | None = None
    profile_confidence: float | None = None
    archetype: str | None = None
    primary_languages: dict | None = None
    expertise_areas: list[str] | None = None
    would_hire_score: float | None = None

    model_config = {"from_attributes": True}


class EngineerProfile(BaseModel):
    """Full profile detail view."""

    id: str
    github_username: str
    github_id: int
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = None
    email: str | None = None
    blog_url: str | None = None
    company: str | None = None
    followers: int = 0
    following: int = 0
    public_repos: int = 0

    # Computed profile
    talent_score: float | None = None
    profile_confidence: float | None = None
    archetype: str | None = None
    primary_languages: dict | None = None
    expertise_areas: list[str] | None = None
    ai_summary: str | None = None
    strengths: list[str] | None = None
    growth_areas: list[str] | None = None
    would_hire_score: float | None = None
    frameworks: list[str] | None = None
    domains: list[str] | None = None
    gaming_warnings: list[str] | None = None

    # Extended AI Hiring Co-Pilot Data
    resume_data: dict | None = None
    authenticity_data: dict | None = None
    skills_assessment: dict | None = None
    interview_questions: dict | None = None
    hiring_recommendation: dict | None = None

    # Score breakdown
    score_breakdown: ScoreBreakdown | None = None

    # Repos
    top_repos: list[RepoSummary] = []

    # Timestamps
    created_at: datetime | None = None
    last_analyzed_at: datetime | None = None

    model_config = {"from_attributes": True}


class EngineerListResponse(BaseModel):
    engineers: list[EngineerCard]
    total: int
    page: int
    page_size: int
    total_pages: int


class AnalysisResponse(BaseModel):
    status: str
    message: str
    engineer_id: str | None = None
    profile: EngineerProfile | None = None
    agent_progress: AgentProgressState | None = None


class AnalysisStatus(BaseModel):
    status: str  # "pending", "analyzing", "complete", "error"
    progress: int = 0  # 0-100
    message: str = ""

