from fastapi import APIRouter, Depends
from app.auth import verify_token
from app.db import supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(user: str = Depends(verify_token)):
    # Pull recent scored DPE entries
    res = supabase.table("conversations") \
        .select("score,topic,created_at") \
        .eq("username", user) \
        .eq("mode", "dpe") \
        .order("created_at", desc=True) \
        .limit(200) \
        .execute()

    rows = res.data or []

    # Aggregate
    by_topic = {}
    total = 0
    count = 0

    for r in rows:
        s = r.get("score")
        t = r.get("topic") or "unknown"
        if isinstance(s, int):
            total += s
            count += 1
            by_topic.setdefault(t, []).append(s)

    topic_avg = {k: round(sum(v) / len(v), 2) for k, v in by_topic.items()}

    return {
        "attempts": count,
        "avg_score": round(total / count, 2) if count else 0,
        "topic_avg": topic_avg
    }