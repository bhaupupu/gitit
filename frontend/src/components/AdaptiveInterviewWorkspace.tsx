"use client";

import { useState } from "react";
import {
  InterviewQuestion,
  InterviewQuestionsData,
  evaluateAdaptiveInterview,
  AdaptiveFollowupResponse,
} from "@/lib/api";
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Code2,
  MessageSquare,
} from "lucide-react";

interface AdaptiveInterviewWorkspaceProps {
  questionsData?: InterviewQuestionsData | null;
  candidateName: string;
}

export default function AdaptiveInterviewWorkspace({
  questionsData,
  candidateName,
}: AdaptiveInterviewWorkspaceProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(
    questionsData?.medium?.[0] || questionsData?.easy?.[0] || null
  );
  const [rating, setRating] = useState<"correct" | "partially_correct" | "incorrect" | null>(null);
  const [loading, setLoading] = useState(false);
  const [followupResponse, setFollowupResponse] = useState<AdaptiveFollowupResponse | null>(null);
  const [candidateNotes, setCandidateNotes] = useState("");

  const currentQuestions = questionsData ? questionsData[selectedDifficulty] || [] : [];

  const handleEvaluate = async (userRating: "correct" | "partially_correct" | "incorrect") => {
    if (!selectedQuestion) return;

    setRating(userRating);
    setLoading(true);

    try {
      const res = await evaluateAdaptiveInterview({
        original_question: selectedQuestion.question,
        category: selectedQuestion.category,
        difficulty: selectedQuestion.difficulty,
        repo_context: selectedQuestion.repo_context,
        user_response_rating: userRating,
        candidate_answer_notes: candidateNotes,
      });
      setFollowupResponse(res);
    } catch (err) {
      console.error("Adaptive interview error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card-classic"
      style={{
        border: "2px solid var(--border-dark)",
        boxShadow: "4px 4px 0px var(--border-dark)",
        background: "var(--bg-card, #faf8f5)",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 700,
              color: "var(--stamp-red)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ADAPTIVE INTERVIEW SUITE • REPOSITORY ANCHORED
          </div>
          <h3 className="font-headline" style={{ fontSize: "22px", fontWeight: 800, margin: "2px 0 0 0" }}>
            Personalized Questions for {candidateName}
          </h3>
        </div>

        {/* Difficulty Selector Tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                const qList = questionsData ? questionsData[diff] : [];
                setSelectedQuestion(qList[0] || null);
                setRating(null);
                setFollowupResponse(null);
              }}
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "'Courier Prime', monospace",
                fontWeight: 700,
                textTransform: "uppercase",
                border: "1px solid var(--border-dark)",
                background: selectedDifficulty === diff ? "var(--border-dark)" : "var(--bg-primary)",
                color: selectedDifficulty === diff ? "white" : "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              [{diff.toUpperCase()}]
            </button>
          ))}
        </div>
      </div>

      <div className="rule-double" style={{ margin: "12px 0 20px" }} />

      {/* Main Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
        {/* Question Selector Sidebar */}
        <div style={{ borderRight: "1px solid var(--border-light, #e0dcd5)", paddingRight: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "10px",
              color: "var(--text-secondary)",
            }}
          >
            SELECT QUESTION ({currentQuestions.length}):
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {currentQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                onClick={() => {
                  setSelectedQuestion(q);
                  setRating(null);
                  setFollowupResponse(null);
                }}
                style={{
                  padding: "10px 12px",
                  border: selectedQuestion?.id === q.id ? "2px solid var(--border-dark)" : "1px solid var(--border-light)",
                  background: selectedQuestion?.id === q.id ? "var(--accent-light, #fff9db)" : "var(--bg-primary)",
                  boxShadow: selectedQuestion?.id === q.id ? "2px 2px 0px var(--border-dark)" : "none",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, marginBottom: "4px" }}>
                  <span style={{ color: "var(--stamp-red)" }}>{q.category}</span>
                  <span style={{ color: "var(--text-muted)" }}>{q.difficulty}</span>
                </div>
                <div style={{ fontWeight: 600, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {q.question}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Question Detail & Interactive Evaluation Workspace */}
        <div>
          {selectedQuestion ? (
            <div>
              {/* Context Header */}
              <div
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-dark)",
                  fontSize: "11px",
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "12px",
                }}
              >
                <Code2 size={14} /> {selectedQuestion.repo_context} • CATEGORY: {selectedQuestion.category}
              </div>

              {/* Question Text */}
              <h4
                className="font-headline"
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  lineHeight: "1.4",
                  marginBottom: "14px",
                }}
              >
                &ldquo;{selectedQuestion.question}&rdquo;
              </h4>

              {/* Ideal Answer Key Points */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(0, 0, 0, 0.02)",
                  borderLeft: "3px solid var(--border-dark)",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                  IDEAL ANSWER KEY POINTS TO LOOK FOR:
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: "1.5" }}>
                  {selectedQuestion.ideal_answer_points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Interactive Candidate Rating Buttons */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                  RATE CANDIDATE RESPONSE TO ADAPT QUESTION:
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleEvaluate("correct")}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "2px solid #2b8a3e",
                      background: rating === "correct" ? "#2b8a3e" : "#ebfbee",
                      color: rating === "correct" ? "white" : "#2b8a3e",
                      fontWeight: 700,
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircle2 size={16} /> CORRECT (PUSH HARDER)
                  </button>

                  <button
                    onClick={() => handleEvaluate("partially_correct")}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "2px solid #f59f00",
                      background: rating === "partially_correct" ? "#f59f00" : "#fff9db",
                      color: rating === "partially_correct" ? "white" : "#f59f00",
                      fontWeight: 700,
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <AlertCircle size={16} /> PARTIAL (PROBE EDGE)
                  </button>

                  <button
                    onClick={() => handleEvaluate("incorrect")}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "2px solid #c92a2a",
                      background: rating === "incorrect" ? "#c92a2a" : "#fff5f5",
                      color: rating === "incorrect" ? "white" : "#c92a2a",
                      fontWeight: 700,
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <XCircle size={16} /> INCORRECT (SIMPLIFY)
                  </button>
                </div>
              </div>

              {/* Dynamic Follow-Up Response Display */}
              {loading && (
                <div style={{ padding: "16px", textAlign: "center", fontFamily: "'Courier Prime', monospace", fontSize: "13px" }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: "inline-block", marginRight: "8px" }} />
                  ADAPTIVE ENGINE GENERATING FOLLOW-UP QUESTIONS...
                </div>
              )}

              {followupResponse && !loading && (
                <div
                  style={{
                    padding: "16px",
                    border: "2px solid var(--border-dark)",
                    background: "var(--accent-light, #fff9db)",
                    boxShadow: "3px 3px 0px var(--border-dark)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, color: "var(--stamp-red)", marginBottom: "8px" }}>
                    <Sparkles size={15} /> ADAPTIVE FOLLOW-UP GENERATED:
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ fontSize: "12px", fontFamily: "'Courier Prime', monospace" }}>RECOMMENDED FOLLOW-UP:</strong>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {followupResponse.follow_up_question}
                    </p>
                  </div>

                  {rating === "correct" && (
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ fontSize: "12px", fontFamily: "'Courier Prime', monospace", color: "#2b8a3e" }}>HARDER PROBE:</strong>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>{followupResponse.harder_question}</p>
                    </div>
                  )}

                  {rating === "incorrect" && (
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ fontSize: "12px", fontFamily: "'Courier Prime', monospace", color: "var(--stamp-red)" }}>EASIER BACKUP QUESTION:</strong>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>{followupResponse.easier_question}</p>
                    </div>
                  )}

                  <div>
                    <strong style={{ fontSize: "12px", fontFamily: "'Courier Prime', monospace" }}>DEEPER ARCHITECTURE PROBE:</strong>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>{followupResponse.deeper_architecture_question}</p>
                  </div>

                  <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed var(--border-dark)", fontSize: "11px", color: "var(--text-secondary)", fontFamily: "'Courier Prime', monospace" }}>
                    NOTE: {followupResponse.guidance_notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Select a question from the left sidebar to start the interview session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
