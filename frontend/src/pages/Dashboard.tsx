import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "normal" | "dpe";

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<Mode>("normal");

  // session + progression
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [sessionAvg, setSessionAvg] = useState<number>(0);

  // timed pressure mode
  const [timedOn, setTimedOn] = useState(false);
  const [timedSeconds, setTimedSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const token = () => localStorage.getItem("token");

  const newSession = async (m: Mode) => {
    const t = token();
    if (!t) return navigate("/");

    const res = await axios.post(
      "http://127.0.0.1:8000/sessions/new",
      {},
      {
        params: { mode: m, timed_seconds: m === "dpe" && timedOn ? timedSeconds : undefined },
        headers: { Authorization: `Bearer ${t}` },
      }
    );

    setSessionId(res.data.session_id);
    setDifficulty(res.data.difficulty || 1);
    setSessionAvg(0);
    setMessages([]);
    setQuestion("");

    // start DPE with a scenario immediately
    if (m === "dpe") {
      await startDPE(res.data.session_id);
    }
  };

  useEffect(() => {
    // first load: create a normal session
    newSession("normal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when switching modes, start a new session each time (clean analytics)
  useEffect(() => {
    newSession(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // countdown timer behavior
  useEffect(() => {
    if (!timedOn || mode !== "dpe") {
      setTimeLeft(null);
      return;
    }
    // if user is in the middle of answering, timer runs
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // auto-submit when time hits 0
      askAI(true);
      return;
    }

    const id = setInterval(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timedOn, mode]);

  const startDPE = async (sid?: string) => {
    try {
      setLoading(true);
      setMessages([]);

      const t = token();
      if (!t) return navigate("/");

      const res = await axios.post(
        "http://127.0.0.1:8000/ask",
        {},
        {
          params: {
            question: "start",
            mode: "dpe",
            session_id: sid || sessionId,
          },
          headers: { Authorization: `Bearer ${t}` },
        }
      );

      setMessages([{ role: "assistant", content: res.data.answer }]);
      setSessionAvg(res.data.session_avg || 0);
      setDifficulty(res.data.difficulty || difficulty);

      if (timedOn) setTimeLeft(timedSeconds);
    } catch (err) {
      console.error(err);
      alert("Error starting DPE session");
    } finally {
      setLoading(false);
    }
  };

  const askAI = async (autoSubmit = false) => {
    const text = question.trim();
    if (!text && !autoSubmit) return;

    const outgoing = autoSubmit ? text || "(No answer submitted - time expired)" : text;

    const userMessage: Message = { role: "user", content: outgoing };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    const startedAt = Date.now();

    try {
      setLoading(true);

      const t = token();
      if (!t) return navigate("/");

      const res = await axios.post(
        "http://127.0.0.1:8000/ask",
        {},
        {
          params: {
            question: outgoing,
            mode,
            session_id: sessionId || undefined,
            seconds_taken:
              mode === "dpe" && timedOn && timeLeft !== null
                ? timedSeconds - timeLeft
                : Math.round((Date.now() - startedAt) / 1000),
          },
          headers: { Authorization: `Bearer ${t}` },
        }
      );

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);

      if (mode === "dpe") {
        if (typeof res.data.difficulty === "number") setDifficulty(res.data.difficulty);
        if (typeof res.data.session_avg === "number") setSessionAvg(res.data.session_avg);
        if (timedOn) setTimeLeft(timedSeconds); // restart timer for next answer
      }
    } catch (err) {
      console.error(err);
      alert("Error asking AI");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h2 style={styles.title}>Private Pilot AI</h2>
          <div style={styles.topRight}>
            <button style={styles.smallBtn} onClick={() => navigate("/analytics")}>
              Analytics
            </button>
            <button
              style={styles.smallBtn}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* MODE SELECTOR */}
        <div style={styles.modeSelector}>
          <button
            onClick={() => setMode("normal")}
            style={mode === "normal" ? styles.activeMode : styles.modeButton}
          >
            Study Mode
          </button>

          <button
            onClick={() => setMode("dpe")}
            style={mode === "dpe" ? styles.activeMode : styles.modeButton}
          >
            🎤 DPE Oral Exam
          </button>
        </div>

        {/* DPE HUD */}
        {mode === "dpe" && (
          <div style={styles.hud}>
            <div>
              <div style={styles.hudLabel}>Difficulty</div>
              <div style={styles.hudValue}>{difficulty}/5</div>
            </div>
            <div>
              <div style={styles.hudLabel}>Session Avg</div>
              <div style={styles.hudValue}>{sessionAvg}/10</div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={timedOn}
                  onChange={(e) => {
                    setTimedOn(e.target.checked);
                    setTimeLeft(null);
                  }}
                />
                Timed Pressure
              </label>

              {timedOn && (
                <>
                  <input
                    style={styles.secondsInput}
                    type="number"
                    min={15}
                    max={180}
                    value={timedSeconds}
                    onChange={(e) => setTimedSeconds(Number(e.target.value))}
                  />
                  <span style={{ opacity: 0.8 }}>sec</span>

                  <div style={styles.timerPill}>
                    ⏱ {timeLeft === null ? formatTime(timedSeconds) : formatTime(timeLeft)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (mode === "dpe") startDPE();
            else setMessages([]);
          }}
          style={{ ...styles.button, marginBottom: "15px" }}
        >
          New Session
        </button>

        <div style={styles.chatContainer}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={msg.role === "user" ? styles.userBubble : styles.aiBubble}
              className="markdown"
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div style={styles.aiBubble}>
              {mode === "dpe" ? "Evaluating..." : "Thinking..."}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <textarea
          placeholder={mode === "dpe" ? "Answer the examiner..." : "Ask an FAA question..."}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={styles.textarea}
          onFocus={() => {
            if (mode === "dpe" && timedOn) setTimeLeft(timedSeconds);
          }}
        />

        <button onClick={() => askAI(false)} style={styles.button}>
          {mode === "dpe" ? "Submit Answer" : "Ask"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    padding: 40,
    color: "white",
  },
  content: { maxWidth: 900, margin: "0 auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  topRight: { display: "flex", gap: 10 },
  title: { marginBottom: 0, fontSize: 26 },

  modeSelector: { display: "flex", gap: 10, marginBottom: 14 },
  modeButton: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  activeMode: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#2563eb,#3b82f6)",
    color: "white",
    fontWeight: 700,
  },

  hud: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    background: "rgba(30, 41, 59, 0.75)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 14,
    alignItems: "center",
  },
  hudLabel: { fontSize: 11, opacity: 0.7 },
  hudValue: { fontSize: 18, fontWeight: 700 },

  secondsInput: {
    width: 70,
    padding: "6px 8px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  },
  timerPill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.2)",
    border: "1px solid rgba(59,130,246,0.45)",
    fontWeight: 700,
  },

  chatContainer: { display: "flex", flexDirection: "column", gap: 15, marginBottom: 20 },
  userBubble: {
    alignSelf: "flex-end",
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    padding: "12px 16px",
    borderRadius: 14,
    maxWidth: "75%",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    padding: 16,
    borderRadius: 14,
    maxWidth: "85%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  textarea: {
    width: "100%",
    height: 110,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "white",
    marginBottom: 15,
    resize: "none",
    outline: "none",
  },
  button: {
    padding: "10px 25px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  smallBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
};