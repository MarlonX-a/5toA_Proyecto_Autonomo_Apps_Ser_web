import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getAllCategorias } from "../../api/categoria";
import { createServicio } from "../../api/servicio";
import type { Icategoria } from "../../interfaces/categoria";
import type { Iservicio } from "../../interfaces/servicio";
import { useNavigate, useParams } from "react-router-dom";
import { getUsers } from "../../api/usersApi";


export default function NuevoServicio() {
  const [categorias, setCategorias] = useState<Icategoria[]>([]);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [ token, setToken ] = useState<string | null>(null);
  const params = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Iservicio>();

  useEffect(() => {
    async function loadCategorias() {
      const respuesta = await getAllCategorias();
      setCategorias(respuesta.data);
    }
    loadCategorias();
  }, []);

  useEffect(() => {
    const saveToken = localStorage.getItem("token");
    if (!saveToken) {
      return;
    }
    setToken(saveToken);
    async function loadProveedor() {
      try {
        const res = await getUsers(saveToken);
        const data = (res.data);
        if (data.rol === "proveedor") {
          setProveedorId(data.id);
        } else {
          alert("Solo los proveedores pueden crear servicios.");
        }
      } catch (error) {
        console.error("Error obteniendo perfil:", error);
      }
    }

    loadProveedor();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    if (!proveedorId) {
      alert("No se pudo obtener el proveedor autenticado.");
      return;
    }

    const body = {
      nombre_servicio: data.nombre_servicio,
      descripcion: data.descripcion,
      duracion: data.duracion,
      proveedor: proveedorId,
      categoria: Number(data.categoria),
    };

    try {
      await createServicio(body);
      alert("✅ Servicio creado correctamente");
    } catch (error) {
      console.error("Error al crear servicio:", error);
      alert("❌ No se pudo crear el servicio");
    }
  });

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Nombre del servicio"
          {...register("nombre_servicio", { required: true })}
        />
        {errors.nombre_servicio && <span>Es obligatorio ingresar el nombre</span>}

        <textarea
          placeholder="Descripción"
          {...register("descripcion", { required: true })}
        />
        {errors.descripcion && <span>Es obligatorio ingresar la descripción</span>}

        <input
          type="time"
          placeholder="Duración"
          {...register("duracion", { required: true })}
        />
        {errors.duracion && <span>Es obligatorio ingresar la duración</span>}

        <select {...register("categoria", { required: true })}>
          <option value="">Seleccione una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        {errors.categoria && <span>Debe seleccionar una categoría</span>}

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
