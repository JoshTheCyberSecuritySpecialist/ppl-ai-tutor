import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 Auto redirect if token already exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await axios.post(
        "http://127.0.0.1:8000/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Quick demo login
  const demoLogin = async () => {
    setUsername("pilot");
    setPassword("password");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />

      <div style={styles.card}>
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>🛩️</div>

        <h1 style={styles.title}>Private Pilot AI</h1>
        <p style={styles.subtitle}>
          AI-Powered Oral Exam Training System
        </p>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        <button
          onClick={handleLogin}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button onClick={demoLogin} style={styles.demoButton}>
          Use Demo Account
        </button>

        <p style={styles.tagline}>
          DPE Mode • Weakness Tracking • Scenario Training
        </p>
      </div>

      <div style={styles.footerBrand}>
        Powered by NextWave Digital Solutions
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    position: "relative" as const,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute" as const,
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
    borderRadius: "50%",
    top: "-150px",
    right: "-150px",
  },
  card: {
    position: "relative" as const,
    background: "rgba(30, 41, 59, 0.9)",
    backdropFilter: "blur(14px)",
    padding: "50px",
    borderRadius: "18px",
    width: "360px",
    textAlign: "center" as const,
    color: "white",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
    animation: "float 6s ease-in-out infinite",
  },
  title: {
    marginBottom: "8px",
    fontSize: "24px",
    fontWeight: 600,
  },
  subtitle: {
    marginBottom: "30px",
    fontSize: "14px",
    opacity: 0.7,
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
    marginBottom: "10px",
  },
  demoButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "20px",
  },
  tagline: {
    fontSize: "12px",
    opacity: 0.6,
    marginTop: "10px",
  },
  footerBrand: {
    position: "absolute" as const,
    bottom: "20px",
    right: "30px",
    fontSize: "12px",
    opacity: 0.4,
    color: "white",
  },
};