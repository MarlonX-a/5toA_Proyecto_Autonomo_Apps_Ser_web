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


def extract_json_from_response(response: str) -> dict | None:
    """Extrae el JSON del TOOL_CALL manejando objetos anidados."""
    import json
    
    # Buscar el inicio de TOOL_CALL:
    start_marker = "TOOL_CALL:"
    start_idx = response.upper().find(start_marker.upper())
    if start_idx == -1:
        return None
    
    # Encontrar el inicio del JSON (primer '{')
    json_start = response.find('{', start_idx)
    if json_start == -1:
        return None
    
    # Contar llaves para encontrar el JSON completo
    brace_count = 0
    json_end = json_start
    
    for i, char in enumerate(response[json_start:], start=json_start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                json_end = i + 1
                break
    
    json_str = response[json_start:json_end]
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


async def execute_tool_if_needed(response: str) -> tuple[str, dict | None]:
    """Detecta y ejecuta llamadas a herramientas en la respuesta del LLM."""
    import json
    
    tool_json = extract_json_from_response(response)
    if not tool_json:
        return response, None
    
    try:
        tool_name = tool_json.get('tool')
        params = tool_json.get('params', {})
        
        if not tool_name:
            return response, None
        
        registry = get_default_registry()
        result = await registry.execute(tool_name, params)
        
        # Formatear resultado de forma legible
        if isinstance(result, list):
            if len(result) == 0:
                return "No se encontraron resultados para tu búsqueda.", result
            
            # Formatear lista de servicios/productos
            formatted = f"✅ Encontré {len(result)} resultado(s):\n\n"
            for i, item in enumerate(result[:10], 1):  # Limitar a 10
                nombre = item.get('nombre_servicio') or item.get('nombre') or item.get('nombreServicio') or 'Sin nombre'
                precio = item.get('precio', 'N/A')
                desc = item.get('descripcion', '')[:100] if item.get('descripcion') else ''
                formatted += f"**{i}. {nombre}** - ${precio}\n"
                if desc:
                    formatted += f"   {desc}...\n"
            return formatted, result
        
        return f"✅ Resultado:\n```json\n{json.dumps(result, indent=2, ensure_ascii=False)}\n```", result
        
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
        
        # Primero obtenemos la respuesta completa para detectar TOOL_CALL
        if hasattr(adapter, 'stream_generate'):
            async for chunk in adapter.stream_generate(full_prompt):
                full_response += chunk
        else:
            full_response = await adapter.generate(full_prompt)
        
        # Detectar si hay una llamada a herramienta en la respuesta
        tool_json = extract_json_from_response(full_response)
        
        if tool_json and tool_json.get('tool'):
            # Si hay TOOL_CALL, ejecutar la herramienta y mostrar resultados amigables
            try:
                tool_name = tool_json.get('tool')
                params = tool_json.get('params', {})
                
                # Mensaje de estado mientras buscamos
                yield f"data: 🔍 Buscando información...\n\n"
                await asyncio.sleep(0.1)
                
                registry = get_default_registry()
                result = await registry.execute(tool_name, params)
                
                # Formatear resultado de forma legible según el tipo de herramienta
                if tool_name == 'buscar_productos':
                    if isinstance(result, list):
                        if len(result) == 0:
                            result_text = "📭 No encontré servicios que coincidan con tu búsqueda. ¿Podrías intentar con otros términos?"
                        else:
                            query = params.get('q', '')
                            if query:
                                result_text = f"✅ Encontré **{len(result)} servicio(s)** relacionados con \"{query}\":\n\n"
                            else:
                                result_text = f"✅ Aquí tienes **{len(result)} servicio(s)** disponibles:\n\n"
                            
                            for i, item in enumerate(result[:10], 1):
                                nombre = item.get('nombre_servicio') or item.get('nombre') or 'Sin nombre'
                                precio = item.get('precio', 'N/A')
                                categoria = item.get('categoria_nombre') or item.get('categoria', {}).get('nombre', '')
                                desc = item.get('descripcion', '')
                                
                                result_text += f"**{i}. {nombre}**\n"
                                result_text += f"   💰 Precio: ${precio}\n"
                                if categoria:
                                    result_text += f"   📁 Categoría: {categoria}\n"
                                if desc:
                                    result_text += f"   📝 {desc[:100]}{'...' if len(desc) > 100 else ''}\n"
                                result_text += "\n"
                            
                            if len(result) > 10:
                                result_text += f"_...y {len(result) - 10} servicios más._\n"
                    else:
                        result_text = f"✅ **Resultado:** {json.dumps(result, ensure_ascii=False)}"
                
                elif tool_name == 'ver_reserva':
                    if result:
                        result_text = f"📅 **Detalles de la reserva:**\n\n"
                        result_text += f"- **ID:** {result.get('id', 'N/A')}\n"
                        result_text += f"- **Fecha:** {result.get('fecha', 'N/A')}\n"
                        result_text += f"- **Estado:** {result.get('estado', 'N/A')}\n"
                        result_text += f"- **Servicio:** {result.get('servicio_nombre', result.get('servicio', 'N/A'))}\n"
                    else:
                        result_text = "❌ No se encontró la reserva solicitada."
                
                elif tool_name == 'obtener_cliente':
                    if result:
                        result_text = f"👤 **Información del cliente:**\n\n"
                        result_text += f"- **Nombre:** {result.get('nombre', 'N/A')}\n"
                        result_text += f"- **Email:** {result.get('email', 'N/A')}\n"
                        result_text += f"- **Teléfono:** {result.get('telefono', 'N/A')}\n"
                    else:
                        result_text = "❌ No se encontró el cliente."
                
                elif tool_name == 'resumen_ventas':
                    if result:
                        result_text = f"📊 **Resumen de ventas:**\n\n"
                        result_text += f"- **Total ventas:** ${result.get('total', 0)}\n"
                        result_text += f"- **Cantidad de transacciones:** {result.get('count', 0)}\n"
                    else:
                        result_text = "📊 No hay datos de ventas disponibles."
                
                else:
                    # Formato genérico para otras herramientas
                    result_text = f"✅ **Resultado de {tool_name}:**\n```json\n{json.dumps(result, indent=2, ensure_ascii=False)}\n```"
                
                yield f"data: {result_text}\n\n"
                
            except Exception as e:
                yield f"data: ❌ Lo siento, hubo un error al procesar tu solicitud: {str(e)}\n\n"
        else:
            # Si NO hay TOOL_CALL, mostrar la respuesta normal del LLM
            # Limpiar cualquier mención de TOOL_CALL que haya quedado
            clean_response = re.sub(r'TOOL_CALL:\s*\{[^}]*\}', '', full_response).strip()
            
            if clean_response:
                # Hacer streaming de la respuesta limpia
                parts = re.split(r'(?<=[.!?])\s+', clean_response)
                for part in parts:
                    if part.strip():
                        yield f"data: {part} \n\n"
                        await asyncio.sleep(0.03)
            else:
                yield f"data: 🤔 No estoy seguro de cómo ayudarte con eso. ¿Podrías reformular tu pregunta?\n\n"
        
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
