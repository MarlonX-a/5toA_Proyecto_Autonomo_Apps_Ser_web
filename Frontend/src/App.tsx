import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { RegisterPage } from './pages/registerPage';
import { WorkForm } from './components/WorkForm';
import { WorkList } from './components/WorkList';
import { Profile } from './components/profile';
import { WorkDetails } from './components/WorkDetails';

function App() {

  return (
    <div>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/singup" element={<RegisterPage />} />
          <Route path="/work-list" element={<WorkList />} />
          <Route path="/work-form" element={<WorkForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/work-details" element={<WorkDetails />} />
        </Routes>
        
    </div>
  )
}

export default App
