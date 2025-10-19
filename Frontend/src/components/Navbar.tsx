import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export function Navbar(){
    const { token, logout } = useContext(AuthContext);

    return(
        <nav className='navbar'>
            <ul>
                <li><Link to='/'>Inicio</Link></li>
                <div className='right'>
                    {!token ? (
                        <>
                            <li><Link to='/login'>Iniciar Sesión</Link></li> 
                            <li><Link to='/singup'>Registrarse</Link></li>
                        </>
                    ):(
                        <>
                            <li><Link to='/' onClick={logout}>Cerrar Sesión</Link></li>
                            <li><Link to='/profile'>Perfil</Link></li>
                        </>
                        
                    )} 
                </div>
                
            </ul>
        </nav>
    )
}