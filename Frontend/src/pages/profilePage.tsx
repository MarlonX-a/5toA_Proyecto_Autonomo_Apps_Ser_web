import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUsers, updateCliente, updateProveedor } from "../api/usersApi";
import type { IclienteRegister } from "../interfaces/cliente";
import type { IproveedorRegister } from "../interfaces/proveedor";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const { register, handleSubmit, reset, getValues } = useForm<IclienteRegister | IproveedorRegister>();
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState<"cliente" | "proveedor" | null>(null);
  const [registroId, setRegistroId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return;
    setToken(savedToken);

    async function loadData() {
      try {
        const res = await getUsers(savedToken);
        const data = res.data;

        if ("telefono" in data && !("descripcion" in data)) {
          setRol("cliente");
          setRegistroId(data.id);
          reset({
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            telefono: data.telefono,
            direccion: data.ubicacion?.direccion || "",
            ciudad: data.ubicacion?.ciudad || "",
            provincia: data.ubicacion?.provincia || "",
            pais: data.ubicacion?.pais || "",
          });
        } else if ("descripcion" in data) {
          setRol("proveedor");
          setRegistroId(data.id);
          reset({
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
          });
        } else {
          setRol(null);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [reset]);

  const buildUserPayload = (formData: any) => {
    // Always include rol in user payload (registro/serializer espera rol en create; safe in update)
    const userPayload: any = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      rol: rol ?? undefined,
    };
    // include password only if non-empty
    if (formData.password) userPayload.password = formData.password;
    return userPayload;
  };

  const buildUbicacionPayload = (formData: any) => {
    const direccion = formData.direccion?.trim();
    const ciudad = formData.ciudad?.trim();
    const provincia = formData.provincia?.trim();
    const pais = formData.pais?.trim();

    // if there's no meaningful ubicacion data, return null so backend doesn't try to validate an empty object
    if (!direccion && !ciudad && !provincia && !pais) return null;

    return {
      direccion: direccion || "",
      ciudad: ciudad || "",
      provincia: provincia || "",
      pais: pais || "",
    };
  };

  const onSubmit = async (formData: any) => {
    if (!token || !rol || !registroId) return;

    try {
      const user = buildUserPayload(formData);
      const ubicacion = buildUbicacionPayload(formData);

      if (rol === "cliente") {
        const payload: any = {
          user,
          telefono: formData.telefono || "",
          ubicacion: ubicacion, // may be null
        };
        await updateCliente(registroId, payload, token);
        alert("Cliente actualizado correctamente ✅");
        navigate("/");
      } else if (rol === "proveedor") {
        const payload: any = {
          user,
          telefono: formData.telefono || "",
          descripcion: formData.descripcion || "",
          ubicacion: ubicacion,
        };
        await updateProveedor(registroId, payload, token);
        alert("Proveedor actualizado correctamente ✅");
        navigate("/")
      }

      // recargar perfil para reflejar cambios
      const res = await getUsers(token);
      const data = res.data;
      // actualizar el formulario con datos devueltos por backend
      reset({
        username: data.user.username,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        email: data.user.email,
        telefono: data.telefono,
        descripcion: data.descripcion || "",
        direccion: data.ubicacion?.direccion || "",
        ciudad: data.ubicacion?.ciudad || "",
        provincia: data.ubicacion?.provincia || "",
        pais: data.ubicacion?.pais || "",
      });
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      // si el backend devuelve errores en err.response.data, muéstralos en consola
      if (err.response?.data) console.log("Detalles backend:", err.response.data);
      alert("Error al guardar los cambios ❌");
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!rol) return <p>No se encontró el perfil del usuario.</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Editar perfil de {rol}</h2>

      <label>Nombre</label>
      <input {...register("first_name")} />

      <label>Apellido</label>
      <input {...register("last_name")} />

      <label>Username</label>
      <input {...register("username")} />

      <label>Email</label>
      <input type="email" {...register("email")} />

      <label>Contraseña (dejar vacío si no cambiar)</label>
      <input type="password" {...register("password")} />

      <label>Teléfono</label>
      <input {...register("telefono")} />

      {rol === "proveedor" && (
        <>
          <label>Descripción</label>
          <input {...register("descripcion")} />
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
