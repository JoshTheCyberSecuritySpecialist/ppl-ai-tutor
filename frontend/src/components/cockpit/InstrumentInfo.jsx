import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

const instrumentDescriptions = {
  airspeed: {
    name: "Airspeed Indicator",
    purpose:
      "Shows indicated airspeed in knots. It is primary for pitch control in climbs and approaches and for staying within structural speed limits.",
    howToRead:
      "Read the needle relative to the colored arcs: white (flap operating range), green (normal), yellow (caution), red line (Vne). Memorize V-speeds for your aircraft.",
    mistakes: [
      "Treating indicated airspeed as true airspeed and ignoring density altitude effects.",
      "Flying approaches too fast, leading to long landing distances.",
      "Ignoring the yellow arc in turbulence and overspeeding the airframe.",
    ],
    faaRef: "See FAA Airplane Flying Handbook, Airspeed Indicator section and ACS performance standards.",
  },
  altimeter: {
    name: "Altimeter",
    purpose:
      "Indicates altitude above mean sea level. Used for terrain clearance, traffic separation, and complying with pattern and airspace altitudes.",
    howToRead:
      "Set the barometric pressure in the Kollsman window, then read hundreds, thousands, and tens of thousands of feet from the pointers. Cross-check with field elevation on startup.",
    mistakes: [
      "Flying with an incorrect altimeter setting, causing large altitude errors.",
      "Confusing indicated altitude with true altitude in high temperature/density altitude conditions.",
      "Not cross-checking assigned altitude during level-off and during IFR operations.",
    ],
    faaRef: "See FAA Instrument Flying Handbook and Airplane Flying Handbook, Altimeter setting procedures.",
  },
  attitude: {
    name: "Attitude Indicator",
    purpose:
      "Shows aircraft pitch and bank relative to the horizon. It is central to instrument scan and maintaining aircraft control in IMC.",
    howToRead:
      "Use the miniature airplane and artificial horizon to set pitch (nose up/down) and bank angle (wings relative to horizon line). Small changes prevent over-corrections.",
    mistakes: [
      "Staring at the attitude indicator instead of maintaining a full instrument scan.",
      "Making large abrupt control inputs when the symbol moves, creating oscillations.",
      "Failing to recognize and respond to instrument failure or precession.",
    ],
    faaRef: "See FAA Instrument Flying Handbook, Attitude Indicator, and ACS tasks for basic attitude instrument flying.",
  },
  heading: {
    name: "Heading Indicator",
    purpose:
      "Provides a stable directional reference used with the magnetic compass to maintain headings, fly pattern legs, and track courses.",
    howToRead:
      "Read the current heading at the index. Use heading bugs or reference marks to set assigned headings, intercepts, and rollout points.",
    mistakes: [
      "Not realigning the heading indicator with the magnetic compass regularly.",
      "Rolling into turns without pre-selecting and briefing the rollout heading.",
      "Over-banking because of late or rushed heading corrections.",
    ],
    faaRef: "See FAA Instrument Flying Handbook, Heading Indicator and navigation by reference to instruments.",
  },
  vsi: {
    name: "Vertical Speed Indicator (VSI)",
    purpose:
      "Shows rate of climb or descent in feet per minute. Helps stabilize climbs, approaches, and level-offs.",
    howToRead:
      "Read the needle in hundreds of feet per minute. Anticipate level-off by starting your pitch change 10% of your vertical speed (e.g., 500 fpm → start 50 ft early).",
    mistakes: [
      "Chasing the VSI needle instead of controlling pitch and using it as a trend indicator.",
      "Ignoring lag, leading to overshoots in climb or descent rates.",
      "Using large vertical speeds close to the ground, reducing safety margins.",
    ],
    faaRef: "See FAA Instrument Flying Handbook, Vertical Speed Indicator and climb/descent control.",
  },
  turn: {
    name: "Turn Coordinator",
    purpose:
      "Indicates rate and coordination of turn. Used to maintain standard-rate turns and keep the ball centered with rudder.",
    howToRead:
      "Use the miniature airplane or wings to judge rate of turn, and the slip/skid ball to coordinate with rudder. Keep the ball centered for coordinated flight.",
    mistakes: [
      "Ignoring the ball, flying consistently uncoordinated turns.",
      "Thinking the indicator shows bank angle instead of rate of turn.",
      "Not recognizing skids at low altitude, which can lead to cross-controlled stalls.",
    ],
    faaRef: "See FAA Airplane Flying Handbook, Turns, and Instrument Flying Handbook, Turn Coordinator.",
  },
};

export function InstrumentInfo({ selectedInstrumentId }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const key = selectedInstrumentId || "attitude";
  const info = instrumentDescriptions[key] ?? instrumentDescriptions.attitude;

  const handleAskAI = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setAnswer("");

      const prompt = `You are a FAA-aligned flight instructor teaching a student pilot about the ${info.name}.
The student asks a follow-up question about this instrument:

${trimmed}

Explain using clear, training-focused language and reference FAA guidance where appropriate.`;

      const res = await axios.post(
        "http://127.0.0.1:8000/ask",
        {},
        {
          params: {
            question: prompt,
            mode: "normal",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnswer(res.data?.answer ?? "No answer returned from AI.");
    } catch (err) {
      console.error(err);
      setAnswer("Error contacting AI tutor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200 md:text-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">{info.name}</h3>
        <p className="text-[11px] text-slate-400">
          Purpose: <span className="text-slate-200">{info.purpose}</span>
        </p>
      </div>

      <div className="mb-2 space-y-1 text-[11px] text-slate-300 md:text-xs">
        <div>
          <p className="font-semibold text-slate-100">How to read it</p>
          <p>{info.howToRead}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-100">Common student mistakes</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {info.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-100">FAA reference</p>
          <p>{info.faaRef}</p>
        </div>
      </div>

      <div className="mt-1 flex flex-1 flex-col gap-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold text-slate-200">Ask the AI tutor</p>
          <textarea
            className="h-16 w-full resize-none rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:text-sm"
            placeholder={`Example: "What happens if the ${info.name.toLowerCase()} is mis-set?"`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500">
              Your question is sent with context that you&apos;re learning the {info.name}.
            </span>
            <button
              type="button"
              onClick={handleAskAI}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow hover:bg-blue-400"
            >
              {loading ? "Asking..." : "Ask AI"}
            </button>
          </div>
        </div>

        <div className="mt-1 flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-[11px] text-slate-200 md:text-xs">
          {loading && <p className="text-slate-400">AI tutor is thinking...</p>}
          {!loading && !answer && (
            <p className="text-slate-500">
              AI responses will appear here. Ask about failures, limitations, or how this instrument is tested on the
              checkride.
            </p>
          )}
          {!loading && answer && (
            <div className="markdown">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

