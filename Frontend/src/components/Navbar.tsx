import { Link } from 'react-router-dom';

export function Navbar(){
    return(
        <nav className='navbar'>
            <ul>
                <li><Link to='/'>Inicio</Link></li>
                <div className='right'>
                    
                    <li><Link to='/login'>Iniciar Sesión</Link></li>
                    <li><Link to='/singup'>Registrarse</Link></li>
                </div>
                

                <div className='left'>
                    <li><Link to='/profile'>Perfil</Link></li>
                </div>
            </ul>
        </nav>
    )
}