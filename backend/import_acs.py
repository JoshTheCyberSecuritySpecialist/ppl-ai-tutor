import pdfplumber
import re
from app.db import supabase

PDF_PATH = "acs/private_airplane_acs.pdf"

code_pattern = re.compile(r"PA\.[IVX]+\.[A-Z]\.[KSR]\d+")


def clean_text(text):
    return text.replace("\n", " ").strip()


def run_import():
    print("Opening ACS PDF...")
    entries = []

    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            matches = code_pattern.findall(text)

            for code in matches:
                snippet_start = text.find(code)
                snippet = text[snippet_start:snippet_start + 800]

                entries.append({
                    "code": code,
                    "description": clean_text(snippet)
                })

    # Remove duplicates in memory
    unique_entries = {e["code"]: e for e in entries}.values()

    print(f"Found {len(unique_entries)} unique ACS codes.")

    # 🔥 Clear table before inserting (avoids duplicate key errors)
    print("Clearing acs_table...")
    supabase.table("acs_table").delete().neq("code", "").execute()

    print("Inserting entries...")

    for entry in unique_entries:
        supabase.table("acs_table").insert(entry).execute()

    print("ACS import complete.")


if __name__ == "__main__":
    run_import()