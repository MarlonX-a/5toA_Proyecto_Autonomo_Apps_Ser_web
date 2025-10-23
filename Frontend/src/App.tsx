import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { RegisterPage } from './pages/registerPage';
import { WorkList } from './components/WorkList';
import { WorkDetails } from './components/WorkDetails';
import { ProfilePage } from './pages/profilePage';
import NuevoServicio from './pages/Proveedor/NuevoServicio';
import { ReservaPage } from './pages/Proveedor/reservaPage';

function App() {

  return (
    <div>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/singup" element={<RegisterPage />} />
          <Route path="/work-list" element={<WorkList />} />
          <Route path="/work-form" element={<NuevoServicio />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/work-details" element={<WorkDetails />} />
          <Route path="/servicios-reserva" element={<ReservaPage />} />

        </Routes>
        
    </div>
  )
}

export default App
