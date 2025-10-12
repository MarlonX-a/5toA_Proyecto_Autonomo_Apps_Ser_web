import type { Iwork } from "../interfaces/Works";
import { useState } from "react";

export function WorkForm() {
  const [work, setWork] = useState<Iwork & { photos?: File[] }>({
    title: "",
    description: "",
    company: "",
    location: "",
    cost: 0,
    postedDate: new Date(),
    photos: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Iwork | 'photos', string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === "number") {
      setWork({ ...work, [name]: Number(value) });
    } else if (type === "date") {
      setWork({ ...work, [name]: new Date(value) });
    } else if (type === "file" && files) {
      setWork({ ...work, photos: Array.from(files) });
    } else {
      setWork({ ...work, [name]: value });
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!work.title.trim()) newErrors.title = "El título es obligatorio";
    if (!work.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (!work.company.trim()) newErrors.company = "La compañía es obligatoria";
    if (!work.location.trim()) newErrors.location = "La ubicación es obligatoria";
    if (work.cost <= 0) newErrors.cost = "El costo debe ser mayor a 0";
    if (!work.postedDate) newErrors.postedDate = "Selecciona la fecha de publicación";
    if (!work.photos || work.photos.length === 0) newErrors.photos = "Debes subir al menos una foto";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      console.log("Formulario válido:", work);
    } else {
      console.log("Errores en el formulario:", errors);
    }
  };

  return (
    <div>
      <h1>Crear Trabajo</h1>
      <form onSubmit={handleSubmit}>
        <label>Título:</label>
        <input type="text" name="title" value={work.title} onChange={handleChange} />
        {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}

        <label>Descripción:</label>
        <textarea name="description" value={work.description} onChange={handleChange}></textarea>
        {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

        <label>Compañía:</label>
        <input type="text" name="company" value={work.company} onChange={handleChange} />
        {errors.company && <p style={{ color: "red" }}>{errors.company}</p>}

        <label>Ubicación:</label>
        <input type="text" name="location" value={work.location} onChange={handleChange} />
        {errors.location && <p style={{ color: "red" }}>{errors.location}</p>}

        <label>Costo:</label>
        <input type="number" name="cost" value={work.cost} onChange={handleChange} />
        {errors.cost && <p style={{ color: "red" }}>{errors.cost}</p>}

        <label>Fecha de Publicación:</label>
        <input
          type="date"
          name="postedDate"
          value={work.postedDate.toISOString().split("T")[0]}
          onChange={handleChange}
        />
        {errors.postedDate && <p style={{ color: "red" }}>{errors.postedDate}</p>}

        <label>Fotos del trabajo:</label>
        <input type="file" name="photos" multiple onChange={handleChange} />
        {errors.photos && <p style={{ color: "red" }}>{errors.photos}</p>}

        <button type="submit">Crear Trabajo</button>
      </form>

      {work.photos && work.photos.length > 0 && (
        <div>
          <h3>Fotos seleccionadas:</h3>
          <ul>
            {work.photos.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

