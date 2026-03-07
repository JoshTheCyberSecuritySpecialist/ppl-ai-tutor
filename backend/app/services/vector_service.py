from typing import Any, Dict, List

from openai import OpenAI

from app.config import settings
from app.db import supabase


client = OpenAI(api_key=settings.openai_api_key)


def generate_embedding(text: str) -> List[float]:
    """
    Generate an OpenAI embedding for the given text.
    """
    response = client.embeddings.create(
        model=settings.openai_embedding_model,
        input=text,
    )
    return response.data[0].embedding


def fetch_acs_context(question: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve the top-k relevant FAA ACS chunks for a question using pgvector.

    This function expects a Postgres RPC function (e.g. `match_acs`) to be
    defined in Supabase that accepts:
      - query_embedding: vector
      - match_count: integer
    and returns rows from acs_table ordered by similarity.
    """
    embedding = generate_embedding(question)

    # Call a Postgres RPC function that performs the pgvector similarity search
    response = supabase.rpc(
        "match_acs",
        {
            "query_embedding": embedding,
            "match_count": k,
        },
    ).execute()

    return response.data or []

