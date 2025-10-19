import { useEffect, useState } from "react";
import { getUsers } from "../../api/usersApi";
import type { Ireserva } from "../../interfaces/reserva";
import { createReserva } from "../../api/reserva";
import { useForm } from "react-hook-form";

export function ReservaPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cliente, setCliente] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Ireserva>>();

  // 🔹 Obtener cliente autenticado desde el token
  useEffect(() => {
    const saveToken = localStorage.getItem("token");
    if (!saveToken) return;
    setToken(saveToken);

    async function loadCliente() {
      try {
        const res = await getUsers(saveToken);
        setCliente(res.data.cliente || res.data); // cliente dentro del profile
      } catch (err) {
        console.error("Error cargando cliente:", err);
      }
    }

    loadCliente();
  }, []);

  // 🔹 Enviar formulario
  const onSubmit = async (data: Partial<Ireserva>) => {
    if (!token) return alert("No hay token guardado");
    if (!cliente) return alert("No se pudo obtener el cliente autenticado");

    // 🔹 Formatear la hora a HH:MM:SS
    let horaFormateada = data.hora || "";
    if (horaFormateada.length === 5) {
      horaFormateada = horaFormateada + ":00";
    }

    const reservaData = {
      cliente_id: cliente.id, // 🔹 usar cliente_id para el serializer
      fecha: data.fecha,
      hora: horaFormateada,
      total_estimado: Number(data.total_estimado),
      estado: "pendiente",
    };

    try {
      await createReserva(reservaData, token);
      alert("Reserva creada correctamente ✅");
    } catch (error: any) {
      console.error("Error creando reserva:", error);
      if (error.response?.data) {
        console.error("Detalles backend:", error.response.data);
      }
      alert("No se pudo crear la reserva ❌");
    }
  };

  return (
    <div>
      <h2>Crear Reserva</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            {...register("fecha", { required: "La fecha es obligatoria" })}
          />
          {errors.fecha && <span>{errors.fecha.message}</span>}
        </div>

        <div>
          <label>Hora:</label>
          <input
            type="time"
            {...register("hora", { required: "La hora es obligatoria" })}
          />
          {errors.hora && <span>{errors.hora.message}</span>}
        </div>

        <div>
          <label>Total estimado:</label>
          <input
            type="number"
            step="0.01"
            {...register("total_estimado", {
              required: "El total estimado es obligatorio",
              valueAsNumber: true,
            })}
          />
          {errors.total_estimado && <span>{errors.total_estimado.message}</span>}
        </div>

        <button type="submit">Crear Reserva</button>
      </form>
    </div>
  );
}
