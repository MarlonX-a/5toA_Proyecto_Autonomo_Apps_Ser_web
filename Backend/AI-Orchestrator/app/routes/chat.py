from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.routes.tools import get_caller

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None
    top_k: int = 5


class ToolCall(BaseModel):
    tool: str
    params: dict | None = None


@router.post("/query")
async def query_chat(payload: ChatRequest, caller=Depends(get_caller)):
    """Handle a chat query: retrieve relevant docs, call LLM adapter, and return answer.

    This is a scaffold; implement retrieval and LLM adapter integration.
    """
    if not payload.query:
        raise HTTPException(status_code=400, detail="Empty query")

    # TODO: validate JWT, perform retrieval, call lllm adapter, return streaming or final response
    # Use default adapter (OpenAI or Hugging Face depending on env)
    from app.llm_adapter import get_default_adapter

    adapter = get_default_adapter()
    answer = await adapter.generate(payload.query)

    return {"answer": answer, "sources": []}


@router.post("/stream")
async def stream_chat(payload: ChatRequest, caller=Depends(get_caller)):
    """Stream an answer back to client as Server-Sent Events (text/event-stream).

    The client should POST the payload (with Authorization header) and read the response body as a stream.
    """
    from fastapi.responses import StreamingResponse
    import asyncio

    adapter = __import__('app.llm_adapter', fromlist=['get_default_adapter']).get_default_adapter()

    async def event_stream():
        # Attempt to stream from adapter if it supports 'stream_generate'
        if hasattr(adapter, 'stream_generate'):
            async for chunk in adapter.stream_generate(payload.query):
                yield f"data: {chunk}\n\n"
            yield "event: done\n\n"
            return

        # Fallback: generate whole answer and yield in chunks
        answer = await adapter.generate(payload.query)
        # naive chunking: sentences
        import re
        parts = re.split(r'(?<=[.!?])\s+', answer)
        for part in parts:
            if not part:
                continue
            yield f"data: {part}\n\n"
            await asyncio.sleep(0.05)
        yield "event: done\n\n"

    return StreamingResponse(event_stream(), media_type='text/event-stream')

@router.post("/call-tool")
async def call_tool(req: ToolCall, caller=Depends(get_caller)):
    from app.tools import get_default_registry

    registry = get_default_registry()
    try:
        res = await registry.execute(req.tool, req.params or {})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return res
