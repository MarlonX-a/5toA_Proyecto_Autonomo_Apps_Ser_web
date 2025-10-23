import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const autenticado = localStorage.getItem("token");

  return (
    <div className="homepage-container">
      <section className="banner">
        <h1>FindYourWork</h1>
        <p>Encuentra y contrata los mejores servicios profesionales cerca de ti.</p>
        <div className="banner-buttons">
          {autenticado ? (
            <>
              <button onClick={() => navigate('/work-list')}>Ver trabajos</button>
              <button onClick={() => navigate('/work-form')}>Publicar trabajo</button>
            </>
          ): (
            <>
              <button onClick={() => navigate('/login')}>Iniciar sesión</button>
              <button onClick={() => navigate('/singup')}>Registrarse</button>
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



