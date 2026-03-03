from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
from app.db import supabase

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/new")
def new_session(mode: str = "normal", timed_seconds: int | None = None, user: str = Depends(verify_token)):
    # difficulty starts at 1
    res = supabase.table("sessions").insert({
        "username": user,
        "mode": mode,
        "difficulty": 1,
        "timed_seconds": timed_seconds
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    session = res.data[0]
    return {
        "session_id": session["id"],
        "difficulty": session["difficulty"],
        "timed_seconds": session.get("timed_seconds"),
        "mode": session["mode"]
    }


@router.post("/{session_id}/set")
def set_session(session_id: str, difficulty: int | None = None, timed_seconds: int | None = None, user: str = Depends(verify_token)):
    update = {}
    if difficulty is not None:
        update["difficulty"] = difficulty
    if timed_seconds is not None:
        update["timed_seconds"] = timed_seconds

    if not update:
        return {"ok": True}

    supabase.table("sessions").update(update).eq("id", session_id).eq("username", user).execute()
    return {"ok": True}