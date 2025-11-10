import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Iservicio } from "../../interfaces/servicio";
import { graphQLRequest } from "../../api/graphql";
import { QUERY_SERVICIOS } from "../../api/graphqlQueries";
import "../../App.css";

export function ServiciosCliente() {
  const [servicios, setServicios] = useState<Iservicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
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
        const categoriaParam = searchParams.get("categoria");
        const categoriaId = categoriaParam ? Number(categoriaParam) : null;

        const data = await graphQLRequest<{ servicios: any[] }>({
          query: QUERY_SERVICIOS,
          variables: {
            filter: categoriaId ? { categoriaId } : null,
            pagination: { limit: 50, offset: 0 }
          },
          token,
        });

        const mapped: Iservicio[] = data.servicios.map((s) => ({
          id: s.id,
          categoria: { id: s.categoria?.id, nombre: s.categoria?.nombre },
          nombre_servicio: s.nombreServicio,
          descripcion: s.descripcion ?? "",
          duracion: s.duracion ?? "",
          rating_promedio: s.ratingPromedio ?? 0,
          precio: Number(s.precio ?? 0),
    }));

    setServicios(mapped);
  } catch (err) {
    console.error("Error al cargar los servicios: ", err);
    setError("No se pudieron cargar los servicios desde GraphQL");
  } finally {
    setLoading(false);
  }
}


    loadServicios();
  }, [searchParams]);

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
