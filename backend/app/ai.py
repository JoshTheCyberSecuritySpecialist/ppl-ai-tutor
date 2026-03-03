from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from app.auth import verify_token
from app.config import settings
from app.db import supabase
import json

router = APIRouter()
client = OpenAI(api_key=settings.openai_api_key)

TOPICS = ["weather", "airspace", "performance", "regulations", "navigation", "emergency"]

def clamp(n: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, n))

def next_difficulty(current: int, score: int) -> int:
    # simple progression:
    # score >= 8 -> +1
    # score <= 4 -> -1
    # else same
    if score >= 8:
        return clamp(current + 1, 1, 5)
    if score <= 4:
        return clamp(current - 1, 1, 5)
    return clamp(current, 1, 5)

def get_session(user: str, session_id: str):
    res = supabase.table("sessions").select("*").eq("id", session_id).eq("username", user).limit(1).execute()
    if not res.data:
        return None
    return res.data[0]

def calc_session_avg(user: str, session_id: str) -> float:
    res = supabase.table("conversations") \
        .select("score") \
        .eq("username", user) \
        .eq("session_id", session_id) \
        .eq("mode", "dpe") \
        .order("created_at", desc=True) \
        .limit(100) \
        .execute()

    scores = [r.get("score") for r in (res.data or []) if isinstance(r.get("score"), int)]
    return round(sum(scores) / len(scores), 2) if scores else 0.0


@router.post("/ask")
def ask_ai(
    question: str,
    mode: str = "normal",
    session_id: str | None = None,
    seconds_taken: int | None = None,
    user: str = Depends(verify_token)
):
    # Require session_id in dpe mode so we can track progress cleanly
    session = None
    if mode == "dpe":
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required for dpe mode")
        session = get_session(user, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

    # =========================
    # DPE MODE
    # =========================
    if mode == "dpe":
        difficulty = int(session.get("difficulty", 1))
        timed_seconds = session.get("timed_seconds")

        # Step 1: Start scenario
        if question.lower().strip() == "start":
            system_prompt = f"""
You are an FAA Designated Pilot Examiner (Private Pilot).

Generate ONE scenario-based oral exam QUESTION.
Difficulty level: {difficulty}/5.
If timed pressure is enabled, keep it concise.

Return ONLY the question text.
Make it immersive and specific.
"""

            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "system", "content": system_prompt}],
                temperature=0.8,
            )

            scenario = response.choices[0].message.content

            supabase.table("conversations").insert({
                "username": user,
                "session_id": session_id,
                "question": "start",
                "answer": scenario,
                "mode": "dpe",
                "difficulty": difficulty
            }).execute()

            return {
                "answer": scenario,
                "difficulty": difficulty,
                "timed_seconds": timed_seconds,
                "session_avg": calc_session_avg(user, session_id)
            }

        # Step 2: Evaluate answer (STRICT JSON)
        system_prompt = f"""
You are an FAA Designated Pilot Examiner conducting a Private Pilot oral exam.

Difficulty level: {difficulty}/5.

Evaluate the student's answer.

Return STRICT JSON ONLY:

{{
  "score": 1-10,
  "topic": "{' | '.join(TOPICS)}",
  "correct": ["bullet1", "bullet2"],
  "missing": ["bullet1", "bullet2"],
  "acs_codes": ["PA.I.B.K1"],
  "follow_up": "next scenario-based examiner question"
}}

Rules:
- Return ONLY valid JSON.
- No markdown, no extra text.
- acs_codes must be realistic codes.
"""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            temperature=0.4,
        )

        raw = response.choices[0].message.content

        try:
            data = json.loads(raw)
        except Exception:
            return {"answer": "⚠️ Evaluation parsing failed. AI did not return valid JSON."}

        score = int(data.get("score", 0))
        topic = (data.get("topic") or "unknown").strip()

        # Lookup ACS details from Supabase
        acs_details = []
        for code in data.get("acs_codes", []):
            r = supabase.table("acs_table").select("*").eq("code", code).limit(1).execute()
            if r.data:
                acs_details.append(r.data[0])

        # Difficulty progression
        new_diff = next_difficulty(difficulty, score)
        if new_diff != difficulty:
            supabase.table("sessions").update({"difficulty": new_diff}).eq("id", session_id).eq("username", user).execute()

        # Save conversation row
        supabase.table("conversations").insert({
            "username": user,
            "session_id": session_id,
            "question": question,
            "answer": raw,  # store the raw json from AI for audit
            "mode": "dpe",
            "score": score,
            "topic": topic,
            "difficulty": difficulty,
            "seconds_taken": seconds_taken
        }).execute()

        # Format for frontend
        acs_blocks = ""
        for item in acs_details:
            acs_blocks += f"""
**{item.get("code")} — {item.get("area")}**

Task: {item.get("task")}
Knowledge Element: {item.get("knowledge_element")}

{item.get("description")}

"""

        formatted = f"""
### Score: {score}/10

**Topic:** {topic}

**What was correct**
{chr(10).join(["- " + c for c in data.get("correct", [])])}

**What was missing**
{chr(10).join(["- " + m for m in data.get("missing", [])])}

---

### FAA ACS Standard (Official)

{acs_blocks if acs_blocks else "ACS reference not found in database yet."}

---

### Next Question
{data.get("follow_up", "")}
"""

        return {
            "answer": formatted,
            "score": score,
            "topic": topic,
            "difficulty": new_diff,
            "session_avg": calc_session_avg(user, session_id),
            "timed_seconds": timed_seconds
        }

    # =========================
    # NORMAL MODE
    # =========================
    system_prompt = """
You are an expert FAA Private Pilot instructor.

Provide:
- Clear structured explanations
- Practical examples
- Reference FAA standards when appropriate
"""

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        temperature=0.6,
    )

    answer = response.choices[0].message.content

    supabase.table("conversations").insert({
        "username": user,
        "session_id": session_id,
        "question": question,
        "answer": answer,
        "mode": "normal"
    }).execute()

    return {"answer": answer}