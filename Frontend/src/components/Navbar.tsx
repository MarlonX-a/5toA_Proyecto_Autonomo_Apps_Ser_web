import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { getUsers } from '../api/usersApi';
import { Home, LogIn, UserPlus, LogOut, User, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const [rol, setRol] = useState('');

  useEffect(() => {
    async function loadCliente() {
      if (!token) return;
      try {
        const res = await getUsers(token);
        const data = res.data;
        setRol(data.rol);
      } catch (err) {
        console.error('Error cargando cliente', err);
      }
    }
    loadCliente();
  }, [token]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <Home size={20} />
          <span>Inicio</span>
        </Link>
      </div>

      <ul className="navbar-right">
        {!token ? (
          <>
            <li>
              <Link to="/login">
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </Link>
            </li>
            <li>
              <Link to="/signup">
                <UserPlus size={18} />
                <span>Registrarse</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            {rol === 'proveedor' && (
              <li>
                <Link to="/proveedor/dashboard">
                  <LayoutDashboard size={18} />
                  <span>Panel Proveedor</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/profile">
                <User size={18} />
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <button className="logout-btn" onClick={logout}>
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
