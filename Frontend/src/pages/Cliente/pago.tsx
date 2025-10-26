import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Ireserva } from "../../interfaces/reserva";
import { useForm } from "react-hook-form";
import type { Ipago } from "../../interfaces/pago";
import { getReserva } from "../../api/reserva";
import { createPago } from "../../api/pago";

export default function Pago() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState<Ireserva | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Ipago>>();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setError("El usuario no está autenticado");
      setLoading(false);
      return;
    }
    setToken(savedToken);

    async function loadReserva() {
      if (!id) return;
      try {
        const res = await getReserva(Number(id), savedToken);
        setReserva(res.data);
      } catch (err) {
        console.error("Error cargando reserva:", err);
        setError("No se pudo cargar la reserva");
      } finally {
        setLoading(false);
      }
    }

    loadReserva();
  }, [id]);

  const onSubmit = async (data: Partial<Ipago>) => {
    if (!token || !reserva) return;

    const pagoData = {
      reserva_id: reserva.id,
      monto: reserva.total_estimado,
      estado: "pendiente",
      metodo_pago: data.metodo_pago,
      referencia: data.referencia || "",
      fecha_pago: new Date().toISOString(),
    };

    try {
      await createPago(pagoData, token);
      alert("Pago registrado exitosamente ✅");
      navigate("/servicios/reserva-list/");
    } catch (err: any) {
      console.error("Error registrando pago:", err.response?.data || err);
      alert("Error al registrar el pago. Revisa los datos.");
    }
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Cargando reserva...</p>;
  if (error)
    return <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>;
  if (!reserva) return null;

  return (
    <div className="homepage-container">
      <h2>Pagar Reserva #{reserva.id}</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ maxWidth: "400px", margin: "2rem auto" }}
      >
        <div>
          <label>Monto a pagar:</label>
          <input type="number" value={reserva.total_estimado} disabled />
        </div>

        <div>
          <label>Método de pago:</label>
          <select
            {...register("metodo_pago", { required: "Selecciona un método de pago" })}
          >
            <option value="">Seleccione</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
          {errors.metodo_pago && <span>{errors.metodo_pago.message}</span>}
        </div>

        <div>
          <label>Referencia (opcional):</label>
          <input
            type="text"
            {...register("referencia")}
            placeholder="Número de referencia"
          />
        </div>

        <button type="submit">Registrar Pago</button>
      </form>
    </div>
  );
}
