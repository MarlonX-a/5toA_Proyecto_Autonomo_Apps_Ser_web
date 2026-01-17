from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.routes.tools import get_caller
from app.tools import get_default_registry, ToolError

router = APIRouter()

# System prompt con contexto de FindYourWork y herramientas MCP
SYSTEM_PROMPT = """Eres el asistente virtual de FindYourWork, una plataforma de reservas de servicios profesionales (peluquería, spa, masajes, etc.).

Tienes acceso a las siguientes herramientas para ayudar a los usuarios:

## HERRAMIENTAS DISPONIBLES:

### Consultas:
1. **buscar_productos** - Buscar servicios disponibles
   - Parámetros: q (texto de búsqueda), categoria (opcional)
   - Ejemplo: {"tool": "buscar_productos", "params": {"q": "corte cabello"}}

2. **ver_reserva** - Ver detalle de una reserva específica
   - Parámetros: reserva_id (número)
   - Ejemplo: {"tool": "ver_reserva", "params": {"reserva_id": 1}}

3. **obtener_cliente** - Obtener información de un cliente
   - Parámetros: user_id (número)
   - Ejemplo: {"tool": "obtener_cliente", "params": {"user_id": 1}}

### Acciones:
4. **crear_reserva** - Crear una nueva reserva
   - Parámetros: cliente_id, fecha (YYYY-MM-DD), hora (HH:MM), estado, total_estimado
   - Ejemplo: {"tool": "crear_reserva", "params": {"cliente_id": 1, "fecha": "2026-01-20", "hora": "15:00", "estado": "pendiente", "total_estimado": "50.00"}}

5. **registrar_cliente** - Registrar un nuevo cliente
   - Parámetros: nombre, apellido, email, telefono (10 dígitos)
   - Ejemplo: {"tool": "registrar_cliente", "params": {"nombre": "Juan", "apellido": "Pérez", "email": "juan@email.com", "telefono": "0999123456"}}

6. **procesar_pago** - Registrar un pago
   - Parámetros: reserva_id, monto, metodo_pago (efectivo/tarjeta/transferencia)
   - Ejemplo: {"tool": "procesar_pago", "params": {"reserva_id": 1, "monto": "50.00", "metodo_pago": "tarjeta"}}

### Reportes:
7. **resumen_ventas** - Obtener resumen de ventas
   - Parámetros: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)
   - Ejemplo: {"tool": "resumen_ventas", "params": {"start_date": "2026-01-01", "end_date": "2026-01-17"}}

## INSTRUCCIONES:
- Cuando el usuario pida algo que requiera una herramienta, DEBES responder con el JSON de la herramienta en este formato exacto:
  TOOL_CALL: {"tool": "nombre_herramienta", "params": {...}}
- Si no necesitas una herramienta, responde normalmente en español.
- Sé amable y conciso.
- Los servicios de FindYourWork incluyen: cortes de cabello, manicure, pedicure, masajes, spa, tratamientos faciales, etc.
"""


def build_prompt(user_query: str) -> str:
    """Construye el prompt completo con contexto del sistema."""
    return f"{SYSTEM_PROMPT}\n\n## Mensaje del usuario:\n{user_query}\n\n## Tu respuesta:"


async def execute_tool_if_needed(response: str) -> tuple[str, dict | None]:
    """Detecta y ejecuta llamadas a herramientas en la respuesta del LLM."""
    import json
    import re
    
    # Buscar patrón TOOL_CALL: {...}
    tool_match = re.search(r'TOOL_CALL:\s*(\{[^}]+\})', response, re.IGNORECASE)
    if not tool_match:
        return response, None
    
    try:
        tool_json = json.loads(tool_match.group(1))
        tool_name = tool_json.get('tool')
        params = tool_json.get('params', {})
        
        registry = get_default_registry()
        result = await registry.execute(tool_name, params)
        
        return f"✅ Resultado de {tool_name}:\n```json\n{json.dumps(result, indent=2, ensure_ascii=False)}\n```", result
    except json.JSONDecodeError:
        return response, None
    except ToolError as e:
        return f"❌ Error ejecutando herramienta: {str(e)}", None
    except Exception as e:
        return f"❌ Error: {str(e)}", None


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None
    top_k: int = 5


class ToolCall(BaseModel):
    tool: str
    params: dict | None = None


@router.post("/query")
async def query_chat(payload: ChatRequest, caller=Depends(get_caller)):
    """Handle a chat query: retrieve relevant docs, call LLM adapter, and return answer."""
    if not payload.query:
        raise HTTPException(status_code=400, detail="Empty query")

    from app.llm_adapter import get_default_adapter

    adapter = get_default_adapter()
    
    # Construir prompt con contexto del sistema
    full_prompt = build_prompt(payload.query)
    answer = await adapter.generate(full_prompt)
    
    # Detectar y ejecutar herramientas si es necesario
    final_answer, tool_result = await execute_tool_if_needed(answer)

    return {"answer": final_answer, "sources": [], "tool_result": tool_result}


@router.post("/stream")
async def stream_chat(payload: ChatRequest, caller=Depends(get_caller)):
    """Stream an answer back to client as Server-Sent Events (text/event-stream).

    The client should POST the payload (with Authorization header) and read the response body as a stream.
    """
    from fastapi.responses import StreamingResponse
    import asyncio
    import json
    import re

    adapter = __import__('app.llm_adapter', fromlist=['get_default_adapter']).get_default_adapter()
    
    # Construir prompt con contexto del sistema
    full_prompt = build_prompt(payload.query)

    async def event_stream():
        full_response = ""
        
        # Attempt to stream from adapter if it supports 'stream_generate'
        if hasattr(adapter, 'stream_generate'):
            async for chunk in adapter.stream_generate(full_prompt):
                full_response += chunk
                yield f"data: {chunk}\n\n"
        else:
            # Fallback: generate whole answer
            answer = await adapter.generate(full_prompt)
            full_response = answer
            
            # Chunking por oraciones para simular streaming
            parts = re.split(r'(?<=[.!?])\s+', answer)
            for part in parts:
                if not part:
                    continue
                yield f"data: {part}\n\n"
                await asyncio.sleep(0.05)
        
        # Detectar si hay una llamada a herramienta en la respuesta
        tool_match = re.search(r'TOOL_CALL:\s*(\{[^}]+\})', full_response, re.IGNORECASE)
        if tool_match:
            try:
                tool_json = json.loads(tool_match.group(1))
                tool_name = tool_json.get('tool')
                params = tool_json.get('params', {})
                
                registry = get_default_registry()
                result = await registry.execute(tool_name, params)
                
                # Enviar resultado de la herramienta
                result_text = f"\n\n✅ **Resultado de {tool_name}:**\n```json\n{json.dumps(result, indent=2, ensure_ascii=False)}\n```"
                yield f"data: {result_text}\n\n"
            except Exception as e:
                yield f"data: \n\n❌ Error ejecutando herramienta: {str(e)}\n\n"
        
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
