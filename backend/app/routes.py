from fastapi import APIRouter, Depends
from app.auth import verify_token

router = APIRouter()

@router.get("/protected")
def protected_route(user: str = Depends(verify_token)):
    return {"message": f"Hello {user}, you are authenticated."}