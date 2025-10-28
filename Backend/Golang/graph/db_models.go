package graph

import (
	"time"
)

// Modelos de base de datos con campos de ID para las relaciones

type DBUser struct {
	ID        string    `db:"id"`
	Username  string    `db:"username"`
	Email     string    `db:"email"`
	FirstName *string   `db:"first_name"`
	LastName  *string   `db:"last_name"`
	Rol       string    `db:"rol"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type DBUbicacion struct {
	ID        string    `db:"id"`
	Direccion string    `db:"direccion"`
	Ciudad    string    `db:"ciudad"`
	Provincia string    `db:"provincia"`
	Pais      string    `db:"pais"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type DBCliente struct {
	ID          string    `db:"id"`
	UserID      string    `db:"user_id"`
	Telefono    string    `db:"telefono"`
	UbicacionID *string   `db:"ubicacion_id"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

type DBProveedor struct {
	ID          string    `db:"id"`
	UserID      string    `db:"user_id"`
	Telefono    string    `db:"telefono"`
	Descripcion *string   `db:"descripcion"`
	UbicacionID *string   `db:"ubicacion_id"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

type DBCategoria struct {
	ID          string    `db:"id"`
	Nombre      string    `db:"nombre"`
	Descripcion *string   `db:"descripcion"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

type DBServicio struct {
	ID             string    `db:"id"`
	ProveedorID    string    `db:"proveedor_id"`
	CategoriaID    string    `db:"categoria_id"`
	NombreServicio string    `db:"nombre_servicio"`
	Descripcion    *string   `db:"descripcion"`
	Duracion       *string   `db:"duracion"`
	RatingPromedio float64   `db:"rating_promedio"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

type DBFotoServicio struct {
	ID          string    `db:"id"`
	ServicioID  string    `db:"servicio_id"`
	URLFoto     string    `db:"url_foto"`
	Descripcion *string   `db:"descripcion"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

type DBReserva struct {
	ID            string    `db:"id"`
	ClienteID     string    `db:"cliente_id"`
	Fecha         string    `db:"fecha"`
	Hora          string    `db:"hora"`
	Estado        string    `db:"estado"`
	TotalEstimado string    `db:"total_estimado"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}

type DBReservaServicio struct {
	ID             string    `db:"id"`
	ReservaID      string    `db:"reserva_id"`
	ServicioID     string    `db:"servicio_id"`
	Cantidad       int32     `db:"cantidad"`
	PrecioUnitario string    `db:"precio_unitario"`
	Subtotal       string    `db:"subtotal"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

type DBPago struct {
	ID         string     `db:"id"`
	ReservaID  string     `db:"reserva_id"`
	MetodoPago string     `db:"metodo_pago"`
	Monto      string     `db:"monto"`
	Estado     string     `db:"estado"`
	Referencia *string    `db:"referencia"`
	FechaPago  *time.Time `db:"fecha_pago"`
	CreatedAt  time.Time  `db:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at"`
}

type DBCalificacion struct {
	ID         string    `db:"id"`
	ClienteID  string    `db:"cliente_id"`
	ServicioID string    `db:"servicio_id"`
	Fecha      time.Time `db:"fecha"`
	Puntuacion int32     `db:"puntuacion"`
	CreatedAt  time.Time `db:"created_at"`
	UpdatedAt  time.Time `db:"updated_at"`
}

type DBComentario struct {
	ID         string    `db:"id"`
	ClienteID  string    `db:"cliente_id"`
	ServicioID string    `db:"servicio_id"`
	Titulo     string    `db:"titulo"`
	Texto      string    `db:"texto"`
	Respuesta  *string   `db:"respuesta"`
	Fecha      time.Time `db:"fecha"`
	CreatedAt  time.Time `db:"created_at"`
	UpdatedAt  time.Time `db:"updated_at"`
}



