import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../api/usersApi";
import { deleteServicio, getServicioByProveedor } from "../../api/servicio";
import type { Iservicio } from "../../interfaces/servicio";

export function ServiciosProveedor() {
  const [servicios, setServicios] = useState<Iservicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadServicios() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay token guardado");
        setLoading(false);
        return;
      }

      try {
        // Obtener el proveedor autenticado
        const perfilRes = await getUsers(token);
        if (perfilRes.data.rol !== "proveedor") {
          setError("El usuario no tiene rol de proveedor");
          setLoading(false);
          return;
        }
        const proveedorId = perfilRes.data.id;

        // Obtener servicios del proveedor
        const serviciosRes = await getServicioByProveedor(proveedorId, token);
        setServicios(serviciosRes.data);
      } catch (err) {
        console.error("Error al cargar los servicios: ", err);
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    }

    loadServicios();
  }, []);

  const handleDelete = async (servicioId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay token guardado");
      return;
    }
    try {
      await deleteServicio(servicioId, token);
      setServicios(servicios.filter((s) => s.id !== servicioId));
      alert("Servicio eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar el servicio: ", err);
      alert("No se pudo eliminar el servicio");
    }
  }

  if (loading)
    return <p style={{ textAlign: "center" }}>Cargando servicios...</p>;
  if (error)
    return <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>;

  if (servicios.length === 0)
    return <p style={{ textAlign: "center" }}>No tienes servicios registrados</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <h2>Mis Servicios</h2>
      <div className="card-container">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="card"
            style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}
          >
            <h3>{servicio.nombre_servicio}</h3>
            <p>{servicio.descripcion}</p>
            <p>Duración: {servicio.duracion}</p>
            <p>Rating: {servicio.rating_promedio}</p>
            <button onClick={() => navigate(`/crear-nuevo-servicio/agregar-fotos/${servicio.id}`)}>
              Ver fotos
            </button>
            <button onClick={() => navigate(`/crear-nuevo-servicio/ubicaciones/${servicio.id}`)} style={{ marginLeft: "1rem" }}>
              Ver Ubicaciones
            </button>
            <br />
            <br />
            <button onClick={() => navigate(`/crear-nuevo-servicio/${servicio.id}`)} style={{ marginLeft: "1rem" }}>
              editar
            </button>
            <button onClick={() => handleDelete(servicio.id)} style={{ marginLeft: "7rem", backgroundColor: "#f44336", color: "#fff" }}>
              Eliminar Servicio
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/crear-nuevo-servicio")}>Agregar servicios</button>
    </div>
  );
}
