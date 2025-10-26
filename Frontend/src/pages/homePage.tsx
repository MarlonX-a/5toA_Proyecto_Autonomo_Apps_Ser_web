import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api/usersApi";

export function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const res = await getUsers(token);
        console.log("Usuario cargado:", res.data);
        setRol(res.data.rol); // "cliente" o "proveedor"
      } catch (err) {
        console.error("Error cargando usuario:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  if (loading) return <p>Cargando...</p>;

  const handleMisTrabajos = () => {
    if (rol === "proveedor") {
      navigate("/mis-servicios");
    } else if (rol === "cliente") {
      navigate("/servicios/reserva-list/");
    } else {
      alert("Rol desconocido o no autorizado");
    }
  };

  return (
    <div className="homepage-container">
      <section className="banner">
        <h1>FindYourWork</h1>
        <p>Encuentra y contrata los mejores servicios profesionales cerca de ti.</p>
        <div className="banner-buttons">
          {token ? (
            <>
              <button onClick={() => navigate("/todos-servicios")}>
                Ver trabajos
              </button>

              <button onClick={handleMisTrabajos}>
                {rol === "proveedor" ? "Mis trabajos" : "Mis reservas"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Iniciar sesión</button>
              <button onClick={() => navigate("/singup")}>Registrarse</button>
            </>
          )}
        </div>
      </section>

      {/* Sección de categorías */}
      <section className="categories">
        <h2>Categorías populares</h2>
        <div className="category-list">
          <div className="category-card">Desarrollo</div>
          <div className="category-card">Diseño</div>
          <div className="category-card">Administración</div>
          <div className="category-card">Marketing</div>
        </div>
      </section>
    </div>
  );
}
