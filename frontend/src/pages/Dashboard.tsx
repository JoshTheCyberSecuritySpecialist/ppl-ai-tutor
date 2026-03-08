import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { AircraftSelector as AirframeSelector } from "../components/aircraft/AircraftSelector.jsx";
import { AircraftViewer } from "../components/aircraft/AircraftViewer.jsx";
import { CockpitHotspots } from "../components/aircraft/CockpitHotspots.jsx";
import { AircraftSelector as CockpitAircraftSelector } from "../components/cockpit/AircraftSelector.jsx";
import { CockpitPanel } from "../components/cockpit/CockpitPanel.jsx";
import { InstrumentInfoPanel } from "../components/cockpit/InstrumentInfoPanel.jsx";
import { C172Cockpit } from "../components/cockpit172/C172Cockpit.jsx";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "normal" | "dpe";

type CockpitSimTab = "trainer" | "viewer" | "study";

type Aircraft = {
  id: string;
  name: string;
  type: string;
  callsign: string;
};

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

  // Training aircraft: IDs must match AircraftSelector, CockpitHotspots, CockpitPanel (c172, archer, da40).
  const aircraftOptions: Aircraft[] = [
    { id: "c172", name: "Cessna 172S", type: "Single Engine", callsign: "N172JT" },
    { id: "archer", name: "Piper Archer", type: "Cross-country trainer", callsign: "N28PP" },
    { id: "da40", name: "Diamond DA40", type: "TAA / glass cockpit", callsign: "N40DA" },
  ];
  const [selectedAircraft, setSelectedAircraft] = useState<string>(aircraftOptions[0]?.id ?? "c172");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("attitude");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [cockpitSimTab, setCockpitSimTab] = useState<CockpitSimTab>("trainer");

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
    setTotalQuestions(0);

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
    setTotalQuestions((prev) => prev + 1);

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
    <div className="min-h-screen w-full text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-8">
        {/* Top navigation bar */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-400/60 shadow-soft-glow">
              <span className="text-xl font-semibold text-blue-300">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight md:text-2xl">AI Pilot Tutor</h1>
              <p className="text-xs text-slate-300 md:text-sm">Modern training cockpit for private pilots</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 hover:border-blue-500 hover:text-blue-200 md:text-sm"
              onClick={() => navigate("/analytics")}
            >
              Flight Analytics
            </button>
            <button
              className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-400 md:text-sm"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Mode + scenario bar */}
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 rounded-full bg-slate-900/80 p-1 text-xs md:text-sm">
              <button
                onClick={() => setMode("normal")}
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  mode === "normal"
                    ? "bg-blue-500 text-white shadow-soft-glow"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Study Mode
              </button>
              <button
                onClick={() => setMode("dpe")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
                  mode === "dpe"
                    ? "bg-amber-500 text-slate-950 shadow-soft-glow"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>🎤</span>
                <span>DPE Oral Exam</span>
              </button>
            </div>
            {mode === "dpe" && (
              <div className="flex items-center gap-4 text-xs text-slate-300 md:text-sm">
                <div>
                  <span className="uppercase tracking-wide text-slate-400">Difficulty</span>
                  <div className="font-semibold text-slate-100">{difficulty}/5</div>
                </div>
                <div>
                  <span className="uppercase tracking-wide text-slate-400">Session Avg</span>
                  <div className="font-semibold text-slate-100">{sessionAvg}/10</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500"
                      checked={timedOn}
                      onChange={(e) => {
                        setTimedOn(e.target.checked);
                        setTimeLeft(null);
                      }}
                    />
                    <span>Timed pressure</span>
                  </label>
                  {timedOn && (
                    <>
                      <input
                        className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:text-sm"
                        type="number"
                        min={15}
                        max={180}
                        value={timedSeconds}
                        onChange={(e) => setTimedSeconds(Number(e.target.value))}
                      />
                      <span className="text-slate-400">sec</span>
                      <div className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 md:text-sm">
                        <span>⏱</span>
                        <span>{timeLeft === null ? formatTime(timedSeconds) : formatTime(timeLeft)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (mode === "dpe") startDPE();
              else {
                setMessages([]);
                setTotalQuestions(0);
              }
            }}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-soft-glow hover:from-blue-400 hover:to-sky-300 md:text-sm"
          >
            {mode === "dpe" ? "Start New DPE Scenario" : "New Study Session"}
          </button>
        </section>

        {/* Main grid layout */}
        <main className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Left column: AI Tutor + Scenario */}
          <div className="flex flex-1 flex-col gap-4">
            {/* AI tutor chat panel */}
            <section className="flex h-[340px] flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-soft-glow backdrop-blur md:h-[380px]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100 md:text-base">AI Tutor</h2>
                  <p className="text-xs text-slate-400 md:text-xs">
                    Ask FAA questions or answer scenario prompts. Responses are grounded in ACS.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span>{mode === "dpe" ? "Exam mode" : "Study mode"}</span>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 pr-2 text-sm">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      ref={index === messages.length - 1 ? chatEndRef : undefined}
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs md:text-sm ${
                        msg.role === "user"
                          ? "ml-auto bg-gradient-to-r from-blue-500 to-sky-400 text-slate-950"
                          : "mr-auto bg-slate-800/90 text-slate-100"
                      } markdown`}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ))}

                  {loading && (
                    <div className="mr-auto flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-xs text-slate-200 md:text-sm">
                      <span className="h-2 w-2 animate-ping rounded-full bg-blue-400" />
                      <span>{mode === "dpe" ? "Evaluating answer..." : "Thinking..."}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  className="h-20 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:h-24"
                  placeholder={mode === "dpe" ? "Answer the examiner in your own words..." : "Ask an FAA question..."}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => {
                    if (mode === "dpe" && timedOn) setTimeLeft(timedSeconds);
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    {mode === "dpe"
                      ? "Your response will be graded against the ACS."
                      : "Grounded explanations with ACS references."}
                  </span>
                  <button
                    onClick={() => askAI(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-slate-50 shadow hover:bg-blue-400 md:text-sm"
                  >
                    <span>{mode === "dpe" ? "Submit answer" : "Ask AI"}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Scenario training panel */}
            <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm backdrop-blur md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-100 md:text-base">Scenario Training</h3>
                <p className="mb-3 text-xs text-slate-400 md:text-xs">
                  Use DPE mode to practice scenario-based oral questions under realistic pressure.
                </p>
                <ul className="mb-3 list-disc space-y-1 pl-4 text-xs text-slate-300 md:text-xs">
                  <li>Examiner-style questioning aligned with FAA ACS.</li>
                  <li>Difficulty adapts with your performance.</li>
                  <li>Optional countdown timer to simulate checkride stress.</li>
                </ul>
                <button
                  onClick={() => {
                    setMode("dpe");
                    startDPE();
                  }}
                  className="mt-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-amber-400 md:text-sm"
                >
                  Jump into DPE scenario
                </button>
              </div>

              <div className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300 md:text-xs">
                <div>
                  <p className="mb-2 font-semibold text-slate-100">Current session</p>
                  <p>Mode: {mode === "dpe" ? "DPE Oral Exam" : "Study"}</p>
                  <p>Difficulty: {difficulty}/5</p>
                  <p>Session average (DPE): {sessionAvg}/10</p>
                  <p>Questions this session: {totalQuestions}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-100">Training focus</p>
                  <p>Use analytics to track which ACS areas you consistently miss and rotate topics accordingly.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: Student progress */}
          <aside className="flex w-full flex-col gap-4 lg:w-[380px]">
            {/* Student progress dashboard */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm backdrop-blur">
              <h3 className="mb-1 text-sm font-semibold text-slate-100 md:text-base">Student Progress</h3>
              <p className="mb-3 text-xs text-slate-400">
                Quick snapshot of how this session is going. Detailed analytics are available on the Analytics page.
              </p>

              <div className="space-y-3 text-xs text-slate-200 md:text-sm">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span>Questions answered</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.min(100, totalQuestions * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span>Current DPE difficulty</span>
                    <span className="font-semibold">
                      {difficulty}/5 {mode !== "dpe" && <span className="text-xs text-slate-400">(latest)</span>}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(difficulty / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span>DPE session average</span>
                    <span className="font-semibold">{sessionAvg.toFixed(1)}/10</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Target a consistent score above 8/10 before booking the real checkride.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </main>

        {/* Aircraft Training Lab */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-cockpit-900/80 p-4 shadow-soft-glow backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 md:text-base">Aircraft Training Lab</h2>
              <p className="text-xs text-slate-400">
                Explore common training aircraft, visualize the airframe in 3D, and brief key cockpit instruments.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Interactive 3D lab</span>
            </div>
          </div>

          {/* Row 1: Airframe explorer */}
          <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]">
            {/* Left: selector */}
            <AirframeSelector selectedId={selectedAircraft} onSelect={setSelectedAircraft} />

            {/* Center: 3D viewer */}
            <AircraftViewer selectedId={selectedAircraft} />

            {/* Right: cockpit hotspots / info */}
            <CockpitHotspots selectedId={selectedAircraft} />
          </div>

          {/* Row 2: Interactive Cockpit Trainer — instruments ~60% width, explanation ~40% */}
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Left: cockpit aircraft selector */}
            <CockpitAircraftSelector selectedId={selectedAircraft} onSelect={setSelectedAircraft} />

            {/* Center: cockpit six-pack panel (~60% of center+right) */}
            <CockpitPanel selectedInstrumentId={selectedInstrument} onSelectInstrument={setSelectedInstrument} />

            {/* Right: instrument description + AI tutor (~40%) */}
            <InstrumentInfoPanel selectedInstrumentId={selectedInstrument} />
          </div>
        </section>

        {/* Cockpit Simulator */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft-glow backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 md:text-base">Cockpit Simulator</h2>
              <p className="text-xs text-slate-400">
                Switch between a six-pack cockpit trainer, external aircraft viewer, and focused study mode.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <div className="flex gap-1 rounded-full bg-slate-900/80 p-1">
                <button
                  type="button"
                  onClick={() => setCockpitSimTab("trainer")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    cockpitSimTab === "trainer"
                      ? "bg-blue-500 text-slate-950 shadow-soft-glow"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Cockpit Trainer
                </button>
                <button
                  type="button"
                  onClick={() => setCockpitSimTab("viewer")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    cockpitSimTab === "viewer"
                      ? "bg-sky-500 text-slate-950 shadow-soft-glow"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Aircraft Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setCockpitSimTab("study")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    cockpitSimTab === "study"
                      ? "bg-emerald-500 text-slate-950 shadow-soft-glow"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Study Mode
                </button>
              </div>
            </div>
          </div>

          {cockpitSimTab === "trainer" && (
            <C172Cockpit
              selectedInstrumentId={selectedInstrument}
              onSelectInstrument={setSelectedInstrument}
            />
          )}

          {cockpitSimTab === "viewer" && (
            <div className="mt-1">
              <AircraftViewer selectedId={selectedAircraft} />
            </div>
          )}

          {cockpitSimTab === "study" && (
            <div className="mt-1 grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <CockpitPanel
                selectedInstrumentId={selectedInstrument}
                onSelectInstrument={setSelectedInstrument}
              />
              <InstrumentInfoPanel selectedInstrumentId={selectedInstrument} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}