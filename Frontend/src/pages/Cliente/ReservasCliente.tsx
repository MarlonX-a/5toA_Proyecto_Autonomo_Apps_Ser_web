import { getReservasByCliente } from "../../api/reserva";
import { getUsers } from "../../api/usersApi";
import { updateReserva } from "../../api/reserva"; // función PUT
import type { Ireserva } from "../../interfaces/reserva";
import { useEffect, useState } from "react";
import "../../App.css";
import { useNavigate } from "react-router-dom";

export function ReservasCliente() {
  const [reservas, setReservas] = useState<Ireserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadReservas() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay token guardado");
        setLoading(false);
        return;
      }

      try {
        const perfilRes = await getUsers(token);
        const clienteId = perfilRes.data.id;

        const reservasRes = await getReservasByCliente(clienteId, token);
        setReservas(reservasRes.data);
      } catch (err) {
        console.error("Error al cargar las reservas: ", err);
        setError("No se pudieron cargar las reservas");
      } finally {
        setLoading(false);
      }
    }
    loadReservas();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center" }}>Cargando reservas...</p>;
  if (error)
    return <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>;


  // ✅ Función para actualizar estado de la reserva sin eliminar canceladas
  const actualizarEstado = async (id: number, nuevoEstado: "confirmada" | "cancelada") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateReserva(id, { estado: nuevoEstado }, token);

      // actualizar estado en el front sin eliminar canceladas
      setReservas(prev =>
        prev.map(r => (r.id === id ? { ...r, estado: nuevoEstado } : r))
      );
    } catch (err) {
      console.error(`Error actualizando reserva ${id}:`, err);
      alert("No se pudo actualizar la reserva");
    }
  };

  return (
    <div className="homepage-container">
      <h2 style={{ marginBottom: "1rem" }}>Mis Reservas</h2>

      {reservas.length === 0 ? (
        <p style={{ textAlign: "center" }}>No tienes reservas registradas</p>
      ) : (
        <div className="card-container">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="card">
              <h3>Reserva #{reserva.id}</h3>
              <p><strong>Fecha:</strong> {reserva.fecha}</p>
              <p><strong>Hora:</strong> {reserva.hora}</p>
              <p><strong>Total estimado:</strong> ${reserva.total_estimado}</p>
              <p>
                <strong>Estado:</strong>{" "}
                <span
                  style={{
                    color:
                      reserva.estado === "pendiente"
                        ? "#ff9800"
                        : reserva.estado === "confirmada"
                        ? "#4caf50"
                        : "#f44336",
                    fontWeight: "bold",
                  }}
                >
                  {reserva.estado.toUpperCase()}
                </span>
              </p>

              {/* Mostrar botones solo si la reserva está pendiente */}
              {reserva.estado === "pendiente" && (
                <>
                  <button onClick={() => navigate(`/servicios/reserva-list/reservados/${reserva.id}`)}>ver servicios reservados</button>
                  <button
                    style={{ marginLeft: "0.5rem", backgroundColor: "#f44336" }}
                    onClick={() => actualizarEstado(reserva.id, "cancelada")}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          ))}
          <button type="button" onClick={() => navigate("/servicios/reserva/form")}>Agregar reservas</button>
        </div>
      )}
    </div>
  );
}
