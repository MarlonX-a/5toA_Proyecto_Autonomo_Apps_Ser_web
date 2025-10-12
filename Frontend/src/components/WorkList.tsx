import type { Iwork } from "../interfaces/Works";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sampleWorks: Iwork[] = [
  {
    title: "Desarrollador Frontend",
    description: "Se ofrecen servicio de desarrollador frontend.",
    company: "TechCorp",
    location: "Quito",
    cost: 1200,
    postedDate: new Date(),
    photos: [],
    mode: "remoto",
  },
  {
    title: "Diseñador UX/UI",
    description: "Diseñador con experiencia en Figma y prototipos.",
    company: "Creative Studio",
    location: "Guayaquil",
    cost: 1000,
    postedDate: new Date(),
    photos: [],
    mode: "presencial",
  },
  {
    title: "Administrador de sistemas",
    description: "Encargado de servidores y redes internas.",
    company: "DataCorp",
    location: "Quito",
    cost: 1500,
    postedDate: new Date(),
    photos: [],
    mode: "hibrido",
  },
];

export function WorkList() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorks = sampleWorks.filter((work) => {
    const matchesMode = filterMode === "todos" || work.mode === filterMode;
    const matchesSearch =
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div>
      <h1>Trabajos Disponibles</h1>

      <input
        type="text"
        placeholder="Buscar por título o compañía..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
        value={filterMode}
        onChange={(e) => setFilterMode(e.target.value)}
      >
        <option value="todos">Todos</option>
        <option value="remoto">Remoto</option>
        <option value="presencial">Presencial</option>
        <option value="hibrido">Híbrido</option>
      </select>

      <button onClick={() => navigate("/work-form")}>
        Crear tu trabajo
      </button>

      <div className="card-container">
        {filteredWorks.map((work, index) => (
          <div key={index} className="card">
            <h2>{work.title}</h2>
            <p><strong>Compañía:</strong> {work.company}</p>
            <p><strong>Ubicación:</strong> {work.location}</p>
            <p><strong>Modalidad:</strong> {work.mode}</p>
            <p><strong>Costo:</strong> ${work.cost}</p>
            <p>{work.description}</p>
            <button onClick={() => navigate('/work-details')}>Ver detalles</button>
          </div>
            
        ))}
        {filteredWorks.length === 0 && <p>No se encontraron trabajos.</p>}
      </div>
    </div>
  );
}
