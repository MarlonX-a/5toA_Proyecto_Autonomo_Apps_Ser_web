import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { RegisterPage } from './pages/registerPage';
import { WorkDetails } from './components/WorkDetails';
import { ProfilePage } from './pages/profilePage';
import NuevoServicio from './pages/Proveedor/NuevoServicio';
import { ReservaPage } from './pages/Cliente/reservaPage';
import { ReservasCliente } from './pages/Cliente/ReservasCliente';
import Pago from './pages/Cliente/pago';
import { Fotos } from './pages/Proveedor/foto';
import { ServiciosProveedor } from './pages/Proveedor/MisServicios';
import { ServiciosCliente } from './pages/Cliente/TodosServicios';
import { ServicioDetalles } from './pages/Cliente/DetallesServicio';
import { ComentariosServicio } from './pages/Cliente/Comentario';
import { Calificaciones } from './pages/Cliente/Calificaciones';
import { Ubicaciones } from './pages/Proveedor/Ubicaciones';
import { ReservaServicio } from './pages/Cliente/ReservaServicio';
import { ServicioReservaList } from './pages/Cliente/ServicioReservaList';

function App() {

  return (
    <div>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/singup" element={<RegisterPage />} />
          <Route path="/mis-servicios" element={<ServiciosProveedor />} />
          <Route path="/todos-servicios" element={<ServiciosCliente />} />
          <Route path="/crear-nuevo-servicio" element={<NuevoServicio />} />
          <Route path="/crear-nuevo-servicio/:id" element={<NuevoServicio />} />
          <Route path="/todos-servicios/:id" element={<ServicioDetalles />} />
          <Route path="/todos-servicios/:servicio_id/comentarios" element={<ComentariosServicio />} />
          <Route path="/crear-nuevo-servicio/agregar-fotos/:servicio_id" element={<Fotos />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/crear-nuevo-servicio/ubicaciones/:servicio_id" element={<Ubicaciones />} />
          <Route path="/work-details" element={<WorkDetails />} />
          <Route path="/servicios/reserva/form" element={<ReservaPage />} />
          <Route path="/servicios/reserva-list/" element={<ReservasCliente />} />
          <Route path="/servicios/reserva-list/reservados/:reserva_id" element={<ServicioReservaList />} />
          <Route path="/servicios/reserva-list/reserva/pago/:id" element={<Pago />} />
          <Route path='/todos-servicios/:servicio_id/calificaciones' element={<Calificaciones />} />
          <Route path='/todos-servicios/:servicio_id/reservaServicio' element={<ReservaServicio />} />
          <Route path='/servicios/reserva-list/reservados/:reserva_id/:id' element={<ReservaServicio />} />

        </Routes>
        
    </div>
  )
}

export default App
