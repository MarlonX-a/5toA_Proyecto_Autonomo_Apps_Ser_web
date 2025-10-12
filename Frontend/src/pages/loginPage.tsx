import { useForm, type SubmitHandler} from 'react-hook-form';
import type { Ilogin } from '../interfaces/login';
import { login } from '../api/login';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


export function LoginPage() {

  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null >(null);

  
  const { register, handleSubmit, formState: { errors } } = useForm<Ilogin>();

  const onSubmit: SubmitHandler<Ilogin> = async (data) => {
    try {
        const loginData: Ilogin = {
          username: data.username,
          password: data.password
        }
        const res = await login(loginData);
        console.log("Bienvenido: ", res.data);
        navigate("/")
    } catch (err: unknown) {
      setApiError("Error al Iniciar Sesión, revisa tus datos");
      console.error(err);
    }
  };

  return (
    <div className="container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder='Usuario' {...register('username', { required: 'Obligatorio' })} />
          {errors.username && <span> {errors.username.message} </span> }

          <input type="password" placeholder='Contraseña' {...register('password', { required: 'Obligatorio' })} />
          {errors.password && <span> {errors.password.message} </span>}

          <p><Link to='/singup'>¿No tienes cuenta? Registrate aquí</Link></p>


          {apiError && <p style={{ color: 'red' }}>{apiError}</p>}
          <button type='submit'>Iniciar Sesión</button>
        </form>
    </div>
  )
}
