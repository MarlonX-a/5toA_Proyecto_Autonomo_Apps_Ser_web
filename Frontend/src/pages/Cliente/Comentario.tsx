import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getComentariosByServicio,
  createComentario,
  updateComentario,
  deleteComentario,
} from "../../api/comentarioApi";
import { getUsers } from "../../api/usersApi";
import type { Icomentario } from "../../interfaces/comentario";

export function ComentariosServicio() {
  const { servicio_id } = useParams<{ servicio_id: string }>();
  const [comentarios, setComentarios] = useState<Icomentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState({ titulo: "", texto: "" });

  const [clienteId, setClienteId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  // Obtener ID del cliente logueado
  useEffect(() => {
    async function loadCliente() {
      if (!token) {
        console.log("No hay token disponible");
        return;
      }

      try {
        const res = await getUsers(token);
        const data = res.data;
        console.log("Datos del usuario logueado:", data);

        if ("telefono" in data && !("descripcion" in data)) {
          setClienteId(data.id);
        } else {
          setClienteId(null);
          console.error("El usuario logueado no es un cliente");
        }
      } catch (err) {
        console.error("Error cargando cliente logueado:", err);
      }
    }

    loadCliente();
  }, [token]);

  // Cargar comentarios del servicio
  useEffect(() => {
    async function loadComentarios() {
      if (!token) return;
      if (!servicio_id) {
        console.error("No se recibió servicio_id en params");
        return;
      }

      try {
        const res = await getComentariosByServicio(Number(servicio_id), token);
        console.log("Comentarios cargados:", res.data);
        setComentarios(res.data);
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
        setError("No se pudieron cargar los comentarios");
      } finally {
        setLoading(false);
      }
    }

    loadComentarios();
  }, [servicio_id, token]);

  if (loading) return <p>Cargando comentarios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Crear comentario
  const handleCreate = async () => {
    if (!nuevoComentario.titulo || !nuevoComentario.texto || !token || !servicio_id || !clienteId) {
      console.error("Faltan datos para crear comentario:", { clienteId, servicio_id, token });
      alert("No se pudo crear el comentario. Revisa los datos.");
      return;
    }

    try {
      const body: Icomentario = {
        cliente_id: clienteId,
        servicio_id: Number(servicio_id),
        titulo: nuevoComentario.titulo,
        texto: nuevoComentario.texto,
      };
      console.log("Enviando comentario:", body);
      const res = await createComentario(body, token);
      console.log("Comentario creado:", res.data);
      setComentarios(prev => [...prev, res.data]);
      setNuevoComentario({ titulo: "", texto: "" });
    } catch (err) {
      console.error("Error creando comentario:", err);
      alert("No se pudo crear el comentario");
    }
  };

  // Editar comentario
  const handleEdit = async (id: number, texto: string) => {
    if (!token) return;

    try {
      const res = await updateComentario(id, { texto }, token);
      setComentarios(prev => prev.map(c => (c.id === id ? res.data : c)));
    } catch (err) {
      console.error("Error editando comentario:", err);
      alert("No se pudo editar el comentario");
    }
  };

  // Eliminar comentario
  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      await deleteComentario(id, token);
      setComentarios(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error eliminando comentario:", err);
      alert("No se pudo eliminar el comentario");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Comentarios del Servicio</h2>

      {/* Crear nuevo comentario */}
      {clienteId ? (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Título"
            value={nuevoComentario.titulo}
            onChange={(e) => setNuevoComentario(prev => ({ ...prev, titulo: e.target.value }))}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <textarea
            placeholder="Escribe tu comentario..."
            value={nuevoComentario.texto}
            onChange={(e) => setNuevoComentario(prev => ({ ...prev, texto: e.target.value }))}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button onClick={handleCreate}>Agregar Comentario</button>
        </div>
      ) : (
        <p>No se encontró el cliente logueado</p>
      )}

      {/* Listado de comentarios */}
      {comentarios.length === 0 && <p>No hay comentarios aún.</p>}
      {comentarios.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
          <h4>{c.titulo} - <small>{c.cliente.user.username}</small></h4>
          <p>{c.texto}</p>
          {c.respuesta && <p><strong>Respuesta:</strong> {c.respuesta}</p>}
          <p style={{ fontSize: "0.8rem", color: "#555" }}>{new Date(c.fecha || c.created_at).toLocaleString()}</p>

          {c.cliente.id === clienteId && (
            <div>
              <button onClick={() => {
                const nuevoTexto = prompt("Editar comentario:", c.texto);
                if (nuevoTexto) handleEdit(c.id!, nuevoTexto);
              }}>Editar</button>
              <button onClick={() => handleDelete(c.id!)} style={{ marginLeft: "0.5rem", backgroundColor: "#f44336" }}>Eliminar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
