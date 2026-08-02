"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getEngineer, parseResumeText, type EngineerProfile } from "@/lib/api";
import JobMatchModal from "@/components/JobMatchModal";
import AdaptiveInterviewWorkspace from "@/components/AdaptiveInterviewWorkspace";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FolderGit2,
  BarChart3,
  Award,
  Star,
  MapPin,
  Building2,
  Users,
  Code2,
  Check,
  Zap,
  Clock,
  ShieldAlert,
  Layers,
  GitFork,
  FileText,
  Target,
  FileSpreadsheet,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<EngineerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJobMatchOpen, setIsJobMatchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "resume" | "authenticity" | "skills" | "interview" | "recommendation"
  >("overview");
  const [resumeInput, setResumeInput] = useState("");
  const [parsingResume, setParsingResume] = useState(false);

  const handleResumeParse = async () => {
    if (!resumeInput.trim() || !profile) return;
    setParsingResume(true);
    try {
      const updatedData = await parseResumeText(resumeInput, profile.id);
      setProfile({
        ...profile,
        resume_data: updatedData,
      });
      setResumeInput("");
      alert("Resume parsed successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to parse resume");
    } finally {
      setParsingResume(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) setResumeInput(content);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getEngineer(id);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg-primary)",
          padding: "40px",
        }}
      >
        <div className="rubber-stamp-circle" style={{ width: "90px", height: "90px" }}>
          MISSING
        </div>
        <h2 className="font-headline" style={{ fontSize: "32px", fontWeight: 800 }}>
          DOSSIER NOT FOUND IN GAZETTE ARCHIVE
        </h2>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "14px", color: "var(--text-secondary)" }}>{error}</p>
        <button className="btn-vintage" onClick={() => router.push("/")}>
          ← RETURN TO FRONT PAGE
        </button>
      </div>
    );
  }

  const score = profile.talent_score ?? 0;
  const confidence = profile.profile_confidence ?? 0;
  const breakdown = profile.score_breakdown;

  const confidenceLabel =
    confidence >= 0.8
      ? "High Confidence"
      : confidence >= 0.5
        ? "Medium Confidence"
        : "Low Confidence";

  const topLangs = profile.primary_languages
    ? Object.entries(profile.primary_languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Top Utility Bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border-dark)",
          padding: "6px 24px",
          fontSize: "11px",
          fontFamily: "'Courier Prime', monospace",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-secondary)",
          letterSpacing: "0.05em",
        }}
      >
        <span>OFFICIAL DOSSIER FILE NO. #{profile.id.slice(0, 8).toUpperCase()}</span>
        <span style={{ fontWeight: 700 }}>THE TALENT TIMES • INTELLIGENCE REPORT</span>
        <span>CONFIDENTIAL</span>
      </div>

      {/* Header / Masthead Nav */}
      <header
        style={{
          padding: "16px 48px",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => router.back()}
          className="btn-vintage-outline"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          ← RETURN
        </button>
        <div style={{ textAlign: "center" }}>
          <span className="font-headline" style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase" }}>
            {profile.name || profile.github_username}
          </span>
          {profile.archetype && (
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "12px", color: "var(--stamp-red)", marginLeft: "10px", fontWeight: 700 }}>
              [{profile.archetype}]
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsJobMatchOpen(true)}
            style={{
              padding: "6px 14px",
              background: "var(--stamp-red)",
              color: "white",
              border: "2px solid var(--border-dark)",
              boxShadow: "2px 2px 0px var(--border-dark)",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Target size={14} /> MATCH WITH JD
          </button>
          <a
            href={`https://github.com/${profile.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-vintage"
            style={{ fontSize: "11px", textDecoration: "none", padding: "6px 14px" }}
          >
            VIEW GITHUB ↗
          </a>
        </div>
      </header>

      <div className="rule-double" style={{ maxWidth: "1280px", margin: "0 auto 16px" }} />

      {/* Navigation Tabs for Co-Pilot Experience */}
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto 24px",
          padding: "0 48px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "overview", label: "[ OVERVIEW & SUMMARY ]", icon: FileText },
          { id: "recommendation", label: "[ HIRING RECOMMENDATION ]", icon: Award },
          { id: "authenticity", label: "[ PROJECT AUTHENTICITY ]", icon: ShieldCheck },
          { id: "skills", label: "[ 10-DOMAIN SKILLS ]", icon: Cpu },
          { id: "interview", label: "[ ADAPTIVE INTERVIEW ]", icon: Sparkles },
          { id: "resume", label: "[ RESUME INTELLIGENCE ]", icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "8px 14px",
                border: "2px solid var(--border-dark)",
                background: isActive ? "var(--border-dark)" : "var(--bg-card)",
                color: isActive ? "white" : "var(--text-primary)",
                fontFamily: "'Courier Prime', monospace",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: isActive ? "3px 3px 0px var(--stamp-red)" : "2px 2px 0px var(--border-dark)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Dossier Container */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px 80px" }}>

        {/* Dossier Banner / Hero Box */}
        <div
          className="vintage-box"
          style={{
            marginBottom: "32px",
            background: "var(--bg-card)",
            padding: "36px",
            display: "flex",
            gap: "36px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            boxShadow: "var(--shadow-offset)",
          }}
        >
          {/* Avatar & Profile Identity */}
          <div style={{ display: "flex", gap: "24px", flex: "1 1 400px", alignItems: "flex-start" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.github_username}&background=8C241B&color=fff&size=120`
              }
              alt={profile.github_username}
              width={96}
              height={96}
              style={{
                border: "3px solid var(--border-dark)",
                boxShadow: "3px 3px 0px var(--border-dark)",
              }}
            />
            <div>
              <div className="stamp-badge" style={{ marginBottom: "8px" }}>
                OFFICIAL DOSSIER FILE
              </div>

              <h1
                className="font-headline"
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                  lineHeight: 1.1,
                }}
              >
                {profile.name || profile.github_username}
              </h1>

              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stamp-red)",
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                @{profile.github_username}
              </p>

              {profile.bio && (
                <p
                  className="font-body"
                  style={{
                    fontSize: "16px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: "14px",
                    maxWidth: "540px",
                  }}
                >
                  {profile.bio}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  fontSize: "12px",
                  fontFamily: "'Courier Prime', monospace",
                  color: "var(--text-secondary)",
                  flexWrap: "wrap",
                }}
              >
                {profile.location && (
                  <span>📍 {profile.location}</span>
                )}
                {profile.company && (
                  <span>🏢 {profile.company}</span>
                )}
                <span>👥 {profile.followers} FOLLOWERS</span>
                <span>📦 {profile.public_repos} REPOSITORIES</span>
              </div>
            </div>
          </div>

          {/* Certificate Rating Box */}
          <div
            style={{
              textAlign: "center",
              flex: "0 0 220px",
              background: "var(--bg-secondary)",
              padding: "24px 20px",
              border: "2px solid var(--border-dark)",
              boxShadow: "var(--shadow-offset)",
            }}
          >
            <div style={{ fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "4px" }}>
              COMPOSITE SCORE
            </div>

            <div
              className="font-headline"
              style={{
                fontSize: "64px",
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: "4px",
                color: "var(--text-primary)",
              }}
            >
              {Math.round(score)}
            </div>

            <div className="score-bar-vintage" style={{ marginBottom: "12px" }}>
              <div className="score-bar-vintage-fill" style={{ width: `${score}%` }} />
            </div>

            <span
              className="stamp-badge"
              style={{
                borderColor: "var(--border-dark)",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
              }}
            >
              {confidenceLabel} ({(confidence * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Job Match Modal */}
        <JobMatchModal
          engineerId={profile.id}
          candidateName={profile.name || profile.github_username}
          isOpen={isJobMatchOpen}
          onClose={() => setIsJobMatchOpen(false)}
        />

        {/* Tab 1: Hiring Recommendation Agent Report */}
        {activeTab === "recommendation" && profile.hiring_recommendation && (
          <div className="vintage-box" style={{ padding: "32px", marginBottom: "32px" }}>
            <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)" }}>
                HIRING RECOMMENDATION AGENT • FINAL VERDICT REPORT
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    fontFamily: "'Courier Prime', monospace",
                    padding: "6px 16px",
                    background: profile.hiring_recommendation.recommendation === "Strong Hire" ? "#2b8a3e" : "var(--stamp-red)",
                    color: "white",
                    border: "2px solid var(--border-dark)",
                    boxShadow: "3px 3px 0px var(--border-dark)",
                  }}
                >
                  VERDICT: {profile.hiring_recommendation.recommendation.toUpperCase()}
                </span>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "13px", marginTop: "10px", color: "var(--text-secondary)" }}>
                  Engineering Maturity: <strong>{profile.hiring_recommendation.engineering_maturity}</strong> • Confidence: <strong>{profile.hiring_recommendation.confidence_score}%</strong>
                </p>
              </div>

              <div className="rubber-stamp" style={{ fontSize: "20px" }}>
                APPROVED
              </div>
            </div>

            <p style={{ fontSize: "16px", lineHeight: "1.6", fontFamily: "'Newsreader', serif", textAlign: "justify", marginBottom: "24px" }}>
              {profile.hiring_recommendation.final_summary}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ border: "1px solid var(--border-dark)", padding: "16px", background: "rgba(43, 138, 62, 0.05)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "'Courier Prime', monospace", color: "#2b8a3e", marginBottom: "8px" }}>
                  ✓ KEY EVALUATION STRENGTHS:
                </div>
                <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px" }}>
                  {profile.hiring_recommendation.strengths.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              <div style={{ border: "1px solid var(--border-dark)", padding: "16px", background: "rgba(201, 42, 42, 0.05)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "'Courier Prime', monospace", color: "var(--stamp-red)", marginBottom: "8px" }}>
                  ⚠ IDENTIFIED RISKS & MITIGATIONS:
                </div>
                <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px" }}>
                  {profile.hiring_recommendation.risks.map((rk, i) => (
                    <li key={i}>{rk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Project Authenticity Agent Analysis */}
        {activeTab === "authenticity" && profile.authenticity_data && (
          <div className="vintage-box" style={{ padding: "32px", marginBottom: "32px" }}>
            <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)" }}>
                PROJECT AUTHENTICITY AGENT • ENGINEERING EVIDENCE REPORT
              </span>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ padding: "16px 24px", border: "2px solid var(--border-dark)", background: "var(--accent-light, #fff9db)", boxShadow: "3px 3px 0px var(--border-dark)" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Courier Prime', monospace", fontWeight: 700 }}>AUTHENTICITY SCORE</div>
                <div className="font-headline" style={{ fontSize: "36px", fontWeight: 900, color: "var(--stamp-red)" }}>
                  {profile.authenticity_data.authenticity_score} / 10
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'Courier Prime', monospace" }}>
                  CONFIDENCE LEVEL: {profile.authenticity_data.confidence_level.toUpperCase()}
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  {profile.authenticity_data.explainable_reasoning}
                </p>
              </div>
            </div>

            <div className="rule-single" style={{ margin: "20px 0" }} />

            <h4 style={{ fontSize: "14px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              REPOSITORY EVOLUTION TIMELINE EVIDENCE:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {profile.authenticity_data.timeline_summary.map((evt, idx) => (
                <div key={idx} style={{ padding: "12px", border: "1px solid var(--border-dark)", background: "var(--bg-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, marginBottom: "4px" }}>
                    <span style={{ color: "var(--stamp-red)" }}>{evt.repo_name} • {evt.event_type}</span>
                    <span>{evt.date}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{evt.description}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Impact: {evt.impact}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: 10-Domain Engineering Skills Assessment */}
        {activeTab === "skills" && profile.skills_assessment && (
          <div className="vintage-box" style={{ padding: "32px", marginBottom: "32px" }}>
            <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "20px" }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)" }}>
                ENGINEERING SKILLS ASSESSMENT • 10-DOMAIN PROFICIENCY WITH EXPLAINABLE REASONING
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {Object.entries(profile.skills_assessment).map(([domainKey, detail]) => (
                <div key={domainKey} style={{ padding: "16px", border: "1px solid var(--border-dark)", background: "var(--bg-primary)", boxShadow: "2px 2px 0px var(--border-dark)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>
                      {detail.domain}
                    </span>
                    <span>
                      <strong style={{ fontSize: "16px", color: "var(--stamp-red)" }}>{detail.score}</strong>/10
                      <span style={{ fontSize: "11px", marginLeft: "6px", fontFamily: "'Courier Prime', monospace", color: "var(--text-muted)" }}>[{detail.level}]</span>
                    </span>
                  </div>
                  <div className="score-bar-vintage" style={{ marginBottom: "8px" }}>
                    <div className="score-bar-vintage-fill" style={{ width: `${(detail.score / 10) * 100}%` }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                    {detail.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Adaptive Interview Suite */}
        {activeTab === "interview" && (
          <div style={{ marginBottom: "32px" }}>
            <AdaptiveInterviewWorkspace
              questionsData={profile.interview_questions}
              candidateName={profile.name || profile.github_username}
            />
          </div>
        )}

        {/* Tab 5: Resume Intelligence & Skill Matrix */}
        {activeTab === "resume" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>

            {/* Interactive Resume Upload & Paste Box */}
            <div className="vintage-box" style={{ padding: "28px", background: "var(--bg-secondary)" }}>
              <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)" }}>
                  📄 UPLOAD OR PASTE CANDIDATE RESUME FOR AI PARSING
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <label
                    className="btn-vintage"
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", background: "#fff" }}
                  >
                    📂 Choose File (.txt, .pdf, .doc)
                    <input type="file" accept=".txt,.pdf,.doc,.docx,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                  <span style={{ fontSize: "12px", fontFamily: "'Courier Prime', monospace", color: "var(--text-muted)" }}>
                    or paste raw resume text below:
                  </span>
                </div>

                <textarea
                  className="vintage-input"
                  value={resumeInput}
                  onChange={(e) => setResumeInput(e.target.value)}
                  placeholder="Paste resume plain text here (e.g. Senior Software Engineer with 5+ years experience in Python, TypeScript, React, Docker...)"
                  rows={4}
                  style={{ width: "100%", padding: "12px", fontFamily: "'Courier Prime', monospace", fontSize: "13px" }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleResumeParse}
                    disabled={parsingResume || !resumeInput.trim()}
                    className="btn-vintage btn-vintage-primary"
                    style={{ fontSize: "12px", padding: "10px 20px" }}
                  >
                    {parsingResume ? "Parsing Resume..." : "⚡ PARSE RESUME INTELLIGENCE"}
                  </button>
                </div>
              </div>
            </div>

            {profile.resume_data && (
              <div className="vintage-box" style={{ padding: "32px" }}>
                <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "20px" }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)" }}>
                    RESUME INTELLIGENCE AGENT • SKILL MATRIX & EXTRACTED EXPERIENCE
                  </span>
                </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 className="font-headline" style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Candidate Resume Profile</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  {profile.resume_data.candidate_summary}
                </p>
              </div>
              <div style={{ padding: "12px 20px", border: "2px solid var(--border-dark)", background: "var(--accent-light)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontFamily: "'Courier Prime', monospace", fontWeight: 700 }}>RESUME SCORE</div>
                <div className="font-headline" style={{ fontSize: "28px", fontWeight: 900, color: "var(--stamp-red)" }}>
                  {profile.resume_data.resume_score} / 10
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: "13px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", marginBottom: "10px" }}>
              EXTRACTED SKILL MATRIX ({profile.resume_data.skill_matrix.length}):
            </h4>
            <div style={{ overflowX: "auto", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "'Courier Prime', monospace" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", borderBottom: "2px solid var(--border-dark)" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>SKILL</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>CATEGORY</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>PROFICIENCY</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>EVIDENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.resume_data.skill_matrix.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "8px", fontWeight: 700 }}>{item.skill}</td>
                      <td style={{ padding: "8px" }}>{item.category}</td>
                      <td style={{ padding: "8px", color: "var(--stamp-red)" }}>{item.proficiency_level}</td>
                      <td style={{ padding: "8px", color: "var(--text-secondary)" }}>{item.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

        {/* Tab 0 / Default: Main 2-Column Newspaper Layout (Overview) */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>

          {/* Left Column: Dossier Report & Repos */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* AI Summary Report */}
            <div className="vintage-box" style={{ padding: "32px" }}>
              <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--stamp-red)" }}>
                  REPORT SUMMARY • INTELLIGENCE EVALUATION
                </span>
              </div>

              <h3 className="font-headline" style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
                ANALYSIS OF ENGINEERING CAPABILITIES
              </h3>

              <p className="drop-cap font-body" style={{ fontSize: "18px", lineHeight: 1.7, textAlign: "justify" }}>
                {profile.ai_summary || "No AI summary report compiled for this engineer."}
              </p>
            </div>

            {/* Strengths & Growth Areas Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Strengths */}
              <div className="vintage-box" style={{ padding: "24px" }}>
                <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "14px" }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-green)" }}>
                    ✓ VERIFIED STRENGTHS
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(profile.strengths || []).map((s, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontFamily: "'Newsreader', serif",
                        paddingLeft: "18px",
                        position: "relative",
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, color: "var(--stamp-green)", fontWeight: 700 }}>✓</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Areas */}
              <div className="vintage-box" style={{ padding: "24px" }}>
                <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "14px" }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-gold)" }}>
                    △ AREAS FOR GROWTH
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(profile.growth_areas || []).map((g, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontFamily: "'Newsreader', serif",
                        paddingLeft: "18px",
                        position: "relative",
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, color: "var(--stamp-gold)", fontWeight: 700 }}>△</span>
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Repositories */}
            <div className="vintage-box" style={{ padding: "32px" }}>
              <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "20px" }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  REPOSITORY MANIFEST ({profile.top_repos.length} ANALYZED)
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {profile.top_repos.slice(0, 8).map((repo, i) => (
                  <a
                    key={i}
                    href={repo.repo_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      background: "var(--bg-primary)",
                      border: "2px solid var(--border-dark)",
                      textDecoration: "none",
                      color: "inherit",
                      boxShadow: "2px 2px 0px var(--border-dark)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          fontFamily: "'Courier Prime', monospace",
                          color: "var(--stamp-red)",
                          marginBottom: "4px",
                        }}
                      >
                        {repo.repo_full_name}
                        {repo.is_fork && (
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px", fontWeight: 400 }}>
                            (fork)
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {repo.description.length > 110
                            ? repo.description.slice(0, 110) + "..."
                            : repo.description}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "12px",
                        fontFamily: "'Courier Prime', monospace",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {repo.language && <span className="tag-vintage">{repo.language}</span>}
                      <span>★ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Score Breakdown & Official Hire Recommendation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Score Breakdown Box */}
            {breakdown && (
              <div className="vintage-box" style={{ padding: "28px" }}>
                <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "18px" }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                    SCORE BREAKDOWN MATRIX
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <ScoreRow label="TECHNICAL DEPTH" value={breakdown.technical_depth} weight="30%" />
                  <ScoreRow label="OUTPUT QUALITY" value={breakdown.output_quality} weight="25%" />
                  <ScoreRow label="CONSISTENCY" value={breakdown.consistency} weight="20%" />
                  <ScoreRow label="COLLABORATION" value={breakdown.collaboration} weight="15%" />
                  <ScoreRow label="SPECIALIZATION" value={breakdown.specialization} weight="10%" />
                </div>
              </div>
            )}

            {/* Official Hire Recommendation Coupon */}
            <div className="coupon-box" style={{ textAlign: "center", padding: "28px" }}>
              <div style={{ fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", color: "var(--stamp-red)", marginBottom: "8px" }}>
                ★ OFFICIAL RECOMMENDATION ★
              </div>
              <div className="star-rating" style={{ justifyContent: "center", marginBottom: "14px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "26px",
                      color: s <= Math.round(profile.would_hire_score || 0) ? "var(--stamp-gold)" : "var(--border-muted)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <h4 className="font-headline" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                {(profile.would_hire_score || 0) >= 4
                  ? "STRONG HIRE RECOMMENDATION"
                  : (profile.would_hire_score || 0) >= 3
                    ? "HIRE RECOMMENDATION"
                    : (profile.would_hire_score || 0) >= 2
                      ? "LEAN HIRE RECOMMENDATION"
                      : "FURTHER DATA REQUIRED"}
              </h4>
            </div>

            {/* Languages Breakdown */}
            {topLangs.length > 0 && (
              <div className="vintage-box" style={{ padding: "28px" }}>
                <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                    LANGUAGE RATIO DISTRIBUTION
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {topLangs.map(([lang, pct]) => (
                    <div key={lang}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        <span>{lang}</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="score-bar-vintage">
                        <div className="score-bar-vintage-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialization Tags */}
            <div className="vintage-box" style={{ padding: "28px" }}>
              <div style={{ borderBottom: "2px solid var(--border-dark)", paddingBottom: "6px", marginBottom: "16px" }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  DOMAINS & SPECIALIZATIONS
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                {(profile.expertise_areas || []).map((area, i) => (
                  <span key={i} className="tag-vintage">
                    {area}
                  </span>
                ))}
              </div>

              {profile.frameworks &&
                profile.frameworks.length > 0 &&
                profile.frameworks[0] !== "Not detected" && (
                  <>
                    <div style={{ fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, marginBottom: "8px" }}>
                      FRAMEWORKS DETECTED:
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {profile.frameworks.map((fw, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "2px 8px",
                            border: "1px solid var(--border-dark)",
                            fontSize: "11px",
                            fontFamily: "'Courier Prime', monospace",
                            background: "var(--bg-secondary)",
                          }}
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </>
                )}
            </div>

            {/* Stamp Meta File Box */}
            <div
              className="vintage-box"
              style={{
                padding: "16px 20px",
                fontSize: "11px",
                fontFamily: "'Courier Prime', monospace",
                color: "var(--text-muted)",
              }}
            >
              {profile.last_analyzed_at && (
                <div style={{ marginBottom: "4px" }}>
                  DATE ANALYZED:{" "}
                  {new Date(profile.last_analyzed_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
        )}

        <div className="rule-double" style={{ marginTop: "60px" }} />
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  const pct = (value / 10) * 100;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontFamily: "'Courier Prime', monospace",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <span>{label}</span>
        <span>
          <span style={{ color: "var(--stamp-red)", fontWeight: 700 }}>{value.toFixed(1)}</span>
          <span style={{ color: "var(--text-muted)", marginLeft: "4px", fontSize: "10px" }}>
            ({weight})
          </span>
        </span>
      </div>
      <div className="score-bar-vintage">
        <div className="score-bar-vintage-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        padding: "40px 48px",
      }}
    >
      <div className="skeleton" style={{ height: "40px", width: "160px", marginBottom: "32px", border: "2px solid var(--border-dark)" }} />
      <div className="skeleton" style={{ height: "200px", marginBottom: "28px", border: "2px solid var(--border-dark)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}>
        <div className="skeleton" style={{ height: "300px", border: "2px solid var(--border-dark)" }} />
        <div className="skeleton" style={{ height: "300px", border: "2px solid var(--border-dark)" }} />
      </div>
    </div>
  );
}
