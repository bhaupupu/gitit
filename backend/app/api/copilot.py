"""API routes for AI Technical Hiring Co-Pilot endpoints."""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import Engineer, JobMatch
from app.models.schemas import (
    JDMatchRequest,
    JDMatchResponse,
    ParseResumeRequest,
    ResumeAnalysis,
    AdaptiveFollowupRequest,
    AdaptiveFollowupResponse,
)
from app.services.agents import (
    ResumeIntelligenceAgent,
    JobDescriptionMatcherAgent,
    AdaptiveInterviewAssistant,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/copilot", tags=["copilot"])

resume_agent = ResumeIntelligenceAgent()
jd_matcher = JobDescriptionMatcherAgent()
adaptive_assistant = AdaptiveInterviewAssistant()


@router.post("/match-jd/{engineer_id}", response_model=JDMatchResponse)
async def match_job_description(
    engineer_id: str,
    payload: JDMatchRequest,
    db: AsyncSession = Depends(get_db),
):
    """Match candidate against a Job Description and calculate fit percentage with explainable reasoning."""
    try:
        uuid.UUID(engineer_id)
        is_uuid = True
    except ValueError:
        is_uuid = False

    if is_uuid:
        result = await db.execute(select(Engineer).where(Engineer.id == engineer_id))
    else:
        result = await db.execute(select(Engineer).where(Engineer.github_username.ilike(engineer_id)))

    engineer = result.scalar_one_or_none()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found.")

    profile_dict = {
        "primary_languages": engineer.primary_languages or {},
        "frameworks": engineer.frameworks or [],
        "expertise_areas": engineer.expertise_areas or [],
        "talent_score": engineer.talent_score or 75.0,
        "account_age": 3,
        "public_repos": engineer.public_repos or 10,
    }

    match_result = jd_matcher.match_jd(
        job_description=payload.job_description,
        candidate_profile=profile_dict,
        job_title=payload.job_title or "Software Engineer"
    )

    # Persist match in database
    job_match = JobMatch(
        engineer_id=engineer.id,
        job_title=match_result["job_title"],
        job_description=payload.job_description,
        match_percentage=match_result["match_percentage"],
        matching_skills=match_result["matching_skills"],
        missing_skills=match_result["missing_skills"],
        experience_match=match_result["experience_match"],
        candidate_fit=match_result["candidate_fit"],
        improvement_suggestions=match_result["improvement_suggestions"],
        reasoning=match_result["reasoning"],
    )
    db.add(job_match)
    await db.commit()

    return JDMatchResponse(**match_result)


@router.post("/parse-resume", response_model=ResumeAnalysis)
async def parse_resume(payload: ParseResumeRequest, db: AsyncSession = Depends(get_db)):
    """Parse resume text and extract skill matrix, strengths, weaknesses, and candidate summary."""
    result = resume_agent.analyze_resume(
        resume_text=payload.resume_text,
        github_username=payload.candidate_id
    )

    # If candidate_id supplied, update their resume_data in DB
    if payload.candidate_id:
        res = await db.execute(
            select(Engineer).where(
                (Engineer.id == payload.candidate_id) | (Engineer.github_username.ilike(payload.candidate_id))
            )
        )
        eng = res.scalar_one_or_none()
        if eng:
            eng.resume_data = result
            await db.commit()

    return ResumeAnalysis(**result)


@router.post("/adaptive-interview", response_model=AdaptiveFollowupResponse)
async def adaptive_interview_followup(payload: AdaptiveFollowupRequest):
    """Evaluate candidate interview response and generate dynamic follow-up question."""
    res = adaptive_assistant.evaluate_response(payload.model_dump())
    return AdaptiveFollowupResponse(**res)


@router.get("/explain-scores/{engineer_id}")
async def get_explainable_scores(engineer_id: str, db: AsyncSession = Depends(get_db)):
    """Get explicit, itemized reasoning for all candidate scores."""
    try:
        uuid.UUID(engineer_id)
        is_uuid = True
    except ValueError:
        is_uuid = False

    if is_uuid:
        result = await db.execute(select(Engineer).where(Engineer.id == engineer_id))
    else:
        result = await db.execute(select(Engineer).where(Engineer.github_username.ilike(engineer_id)))

    engineer = result.scalar_one_or_none()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found.")

    return {
        "github_username": engineer.github_username,
        "talent_score": engineer.talent_score,
        "would_hire_score": engineer.would_hire_score,
        "profile_confidence": engineer.profile_confidence,
        "score_breakdown": {
            "technical_depth": {
                "score": engineer.score_technical_depth,
                "reasoning": f"Score {engineer.score_technical_depth}/10 based on language breadth ({len(engineer.primary_languages or {})} languages) and architecture complexity."
            },
            "output_quality": {
                "score": engineer.score_output_quality,
                "reasoning": f"Score {engineer.score_output_quality}/10 based on repository stars, forks, and documentation ratio."
            },
            "consistency": {
                "score": engineer.score_consistency,
                "reasoning": f"Score {engineer.score_consistency}/10 based on account longevity and sustained commit cadence."
            },
            "collaboration": {
                "score": engineer.score_collaboration,
                "reasoning": f"Score {engineer.score_collaboration}/10 based on follower count, PR activity, and community engagement."
            },
            "specialization": {
                "score": engineer.score_specialization,
                "reasoning": f"Score {engineer.score_specialization}/10 based on archetype concentration in {engineer.archetype} domain."
            }
        },
        "authenticity_reasoning": (engineer.authenticity_data or {}).get("explainable_reasoning", "High commit authenticity verified."),
        "skills_assessment": engineer.skills_assessment,
        "hiring_recommendation": engineer.hiring_recommendation,
    }
