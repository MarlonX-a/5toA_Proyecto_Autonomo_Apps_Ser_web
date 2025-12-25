from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import BackgroundTasks
from typing import Any

router = APIRouter()


@router.post("/")
async def ingest_file(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    """Ingest a file: save, extract text, create embeddings and persist to vector DB.

    This is a scaffold: implement extraction and embedding in background tasks.
    """
    # TODO: Save file to storage (Django media or local), enqueue background ingestion job
    # For now just validate content-type and return a placeholder response
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file")

    return {"status": "accepted", "filename": file.filename}
