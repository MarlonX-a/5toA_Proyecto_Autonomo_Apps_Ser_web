import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUsers, updateCliente, updateProveedor } from "../api/usersApi";
import { updateUbicacion } from "../api/ubicacion";
import type { IclienteRegister } from "../interfaces/cliente";
import type { IproveedorRegister } from "../interfaces/proveedor";
import type { Iubicacion } from "../interfaces/ubicacion";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const { register, handleSubmit, reset } = useForm<IclienteRegister | IproveedorRegister>();
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState<"cliente" | "proveedor" | null>(null);
  const [registroId, setRegistroId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<any>({});
  const navigate = useNavigate();

  // 🔹 Cargar datos del perfil
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return;
    setToken(savedToken);

    async function loadData() {
      try {
        const res = await getUsers(savedToken);
        const data = res.data;
        let formValues: any = {};

        if ("telefono" in data && !("descripcion" in data)) {
          setRol("cliente");
          setRegistroId(data.id);
          formValues = {
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            telefono: data.telefono,
            direccion: data.ubicacion?.direccion || "",
            ciudad: data.ubicacion?.ciudad || "",
            provincia: data.ubicacion?.provincia || "",
            pais: data.ubicacion?.pais || "",
          };
        } else if ("descripcion" in data) {
          setRol("proveedor");
          setRegistroId(data.id);
          formValues = {
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            telefono: data.telefono,
            descripcion: data.descripcion,
            direccion: data.ubicacion?.direccion || "",
            ciudad: data.ubicacion?.ciudad || "",
            provincia: data.ubicacion?.provincia || "",
            pais: data.ubicacion?.pais || "",
          };
        }

        setInitialValues(formValues);
        reset(formValues);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [reset]);

  // 🔹 Enviar solo campos modificados (independientes)
  const onSubmit = async (formData: any) => {
    if (!token || !rol || !registroId) return;

    // Detectar los cambios
    const changedFields: any = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialValues[key]) {
        changedFields[key] = formData[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      alert("No hay cambios para guardar ⚠️");
      return;
    }

    try {
      let payload: any = {};

      // 🔹 Campos de usuario (email, username)
      if (changedFields.username) payload.user = { username: changedFields.username };
      if (changedFields.email)
        payload.user = { ...payload.user, email: changedFields.email };

      // 🔹 Campos generales
      if (changedFields.telefono) payload.telefono = changedFields.telefono;
      if (rol === "proveedor" && changedFields.descripcion !== undefined)
        payload.descripcion = changedFields.descripcion;

      // 🔹 Campos de ubicación
      const ubicacion: any = {};
      ["direccion", "ciudad", "provincia", "pais"].forEach((campo) => {
        if (changedFields[campo] !== undefined) ubicacion[campo] = changedFields[campo];
      });

      if (Object.keys(ubicacion).length > 0) {
        payload.ubicacion = ubicacion;
      }

      if (Object.keys(payload).length === 0) {
        alert("No hay cambios válidos para enviar");
        return;
      }

      if (rol === "cliente") {
        await updateCliente(registroId, payload, token);
        alert("Cliente actualizado correctamente ✅");
      } else if (rol === "proveedor") {
        await updateProveedor(registroId, payload, token);
        alert("Proveedor actualizado correctamente ✅");
      }

      // 🔁 Actualizar valores iniciales para próximas ediciones
      setInitialValues({ ...initialValues, ...formData });
      navigate("/");
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al guardar los cambios ❌");
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!rol) return <p>No se encontró el perfil del usuario.</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Perfil de {rol}</h2>

      <label>Nombre</label>
      <input {...register("first_name")} readOnly />

      <label>Apellido</label>
      <input {...register("last_name")} readOnly />

      <label>Username</label>
      <input {...register("username")} />

      <label>Email</label>
      <input type="email" {...register("email")} />

      <label>Teléfono</label>
      <input {...register("telefono")} />

      {rol === "proveedor" && (
        <>
          <label>Descripción</label>
          <textarea {...register("descripcion")} rows={3} />
        </>
      )}

      <h3>Ubicación</h3>
      <input placeholder="Dirección" {...register("direccion")} />
      <input placeholder="Ciudad" {...register("ciudad")} />
      <input placeholder="Provincia" {...register("provincia")} />
      <input placeholder="País" {...register("pais")} />

      <button type="submit">Guardar cambios</button>
    </form>
  );
}
