import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllServicios } from "../../api/servicio";
import type { Iservicio } from "../../interfaces/servicio";
import "../../App.css";

export function ServiciosCliente() {
  const [servicios, setServicios] = useState<Iservicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadServicios() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay token disponible");
        setLoading(false);
        return;
      }

      try {
        const res = await getAllServicios(token);
        setServicios(res.data);
      } catch (err) {
        console.error("Error al cargar los servicios: ", err);
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    }

    loadServicios();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando servicios...</p>;
  if (error) return <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>;

  const filteredServicios = servicios.filter((servicio) =>
    servicio.nombre_servicio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="homepage-container">
      <h1>Servicios Disponibles</h1>

      <input
        type="text"
        placeholder="Buscar servicios..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      <div className="card-container">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="card">
            <h2>{servicio.nombre_servicio}</h2>
            <p><strong>Categoría:</strong> {servicio.categoria?.nombre || "Sin categoría"}</p>
            <p><strong>Descripción:</strong> {servicio.descripcion}</p>
            <p><strong>Duración:</strong> {servicio.duracion || "No especificada"}</p>
            <p><strong>Rating:</strong> {servicio.rating_promedio.toFixed(1)} ⭐</p>

            <button onClick={() => navigate(`/todos-servicios/${servicio.id}`)}>
              Ver detalles
            </button>
          </div>
        ))}

        {filteredServicios.length === 0 && (
          <p style={{ textAlign: "center" }}>No se encontraron servicios.</p>
        )}
      </div>
    </div>
  );
}
