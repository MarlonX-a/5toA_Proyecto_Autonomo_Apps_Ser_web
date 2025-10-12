import { useState } from "react";
import type { IRegister } from "../interfaces/Register";

export function Profile() {
  const [user, setUser] = useState<IRegister>({
    nombre: "Juan",
    apellido: "Pérez",
    username: "juan123",
    password: "123456",
    confirmPassword: "123456",
    rol: "trabajador",
    profesion: "Desarrollador",
    photo: "",
  });

  const [editMode, setEditMode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setUser({ ...user, photo: files[0] });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSave = () => {
    setEditMode(false);
    console.log("Usuario actualizado:", user);
  };

  return (
    <div className="container">
      <h1>Perfil</h1>
      <form className="form" style={{ maxWidth: 400, margin: "2rem auto" }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {user.photo ? (
            <img
              src={typeof user.photo === "string" ? user.photo : URL.createObjectURL(user.photo)}
              alt="Perfil"
              style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#444", display: "inline-block", lineHeight: "100px", color: "#ccc" }}>
              Sin foto
            </div>
          )}
        </div>

        {editMode && (
          <input type="file" name="photo" accept="image/*" onChange={handleChange} className="input" />
        )}

        <label className="label">Nombre:</label>
        {editMode ? (
          <input className="input" type="text" name="nombre" value={user.nombre} onChange={handleChange} />
        ) : (
          <p>{user.nombre}</p>
        )}

        <label className="label">Apellido:</label>
        {editMode ? (
          <input className="input" type="text" name="apellido" value={user.apellido} onChange={handleChange} />
        ) : (
          <p>{user.apellido}</p>
        )}

        <label className="label">Username:</label>
        <p>{user.username}</p>

        <label className="label">Rol:</label>
        <p>{user.rol}</p>

        {user.rol === "trabajador" && (
          <>
            <label className="label">Profesión:</label>
            {editMode ? (
              <input className="input" type="text" name="profesion" value={user.profesion} onChange={handleChange} />
            ) : (
              <p>{user.profesion}</p>
            )}
          </>
        )}

        <div style={{ marginTop: "1rem" }}>
          {editMode ? (
            <>
              <button type="button" className="button" onClick={handleSave} style={{ marginRight: 8 }}>Guardar</button>
              <button type="button" className="button" onClick={() => setEditMode(false)}>Cancelar</button>
            </>
          ) : (
            <button type="button" className="button" onClick={() => setEditMode(true)}>
              Editar información
            </button>
          )}
        </div>
      </form>
    </div>
  );
}