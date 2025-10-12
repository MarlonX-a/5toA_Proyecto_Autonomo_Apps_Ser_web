import { useState } from "react";
import type { Iwork } from "../interfaces/Works";
import { useNavigate } from "react-router-dom";

export function WorkDetails() {

    const navigate = useNavigate();

    const [work] = useState<Iwork>({
        title: "Desarrollador Frontend",
        description: "Se buscan desarrolladores con experiencia en React y TypeScript para proyectos web.",
        company: "TechCorp",
        location: "Quito",
        cost: 1200,
        postedDate: new Date(),
        photos: [], 
        mode: "remoto",
    });

    return (
        <div className="work-details">
        <h1>{work.title}</h1>
        <p><strong>Compañía:</strong> {work.company}</p>
        <p><strong>Ubicación:</strong> {work.location}</p>
        <p><strong>Modalidad:</strong> {work.mode}</p>
        <p><strong>Costo:</strong> ${work.cost}</p>
        <p><strong>Publicado el:</strong> {work.postedDate.toLocaleDateString()}</p>
        <p><strong>Descripción:</strong></p>
        <p>{work.description}</p>

        {work.photos && work.photos.length > 0 ? (
            <div className="work-photos">
            {work.photos.map((photo, index) => (
                <img
                key={index}
                src={typeof photo === "string" ? photo : URL.createObjectURL(photo)}
                alt={`Foto ${index + 1}`}
                />
            ))}
            </div>
        ) : (
            <p>No hay fotos disponibles.</p>
        )}
        <button onClick={() => navigate('/work-list')}>Contratar</button>
        </div>
    );
}

