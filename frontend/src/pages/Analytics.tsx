import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Summary = {
  attempts: number;
  avg_score: number;
  topic_avg: Record<string, number>;
};

export default function Analytics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const res = await axios.get("http://127.0.0.1:8000/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSummary(res.data);
    };

    load();
  }, [navigate]);

  if (!summary) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>Loading analytics...</div>
      </div>
    );
  }

  const topics = Object.entries(summary.topic_avg).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>ACS Analytics</h2>
        <div style={styles.headerBtns}>
          <button style={styles.smallBtn} onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.kpiLabel}>Attempts</div>
          <div style={styles.kpiValue}>{summary.attempts}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.kpiLabel}>Average Score</div>
          <div style={styles.kpiValue}>{summary.avg_score}/10</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginBottom: 12 }}>Weakness Tracker (by topic)</h3>

        {topics.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No scored DPE attempts yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topics.map(([topic, avg]) => {
              const pct = Math.max(0, Math.min(100, (avg / 10) * 100));
              return (
                <div key={topic}>
                  <div style={styles.rowTop}>
                    <span style={{ textTransform: "capitalize" }}>{topic}</span>
                    <span style={{ opacity: 0.8 }}>{avg}/10</span>
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    minHeight: "100vh",
    padding: 40,
    color: "white",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  },
  header: {
    maxWidth: 900,
    margin: "0 auto 20px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBtns: { display: "flex", gap: 10 },
  title: { fontSize: 26, margin: 0 },
  grid: {
    maxWidth: 900,
    margin: "0 auto 18px auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    background: "rgba(30, 41, 59, 0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },
  kpiLabel: { opacity: 0.75, fontSize: 12, marginBottom: 8 },
  kpiValue: { fontSize: 28, fontWeight: 700 },
  smallBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  rowTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  barBg: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
  },
};