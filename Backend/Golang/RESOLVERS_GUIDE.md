# Guía Completa para Construir Resolvers GraphQL en Go

## Resumen de lo Implementado

He implementado un conjunto completo de resolvers GraphQL para tu esquema. Aquí te explico cómo construir los resolvers paso a paso:

## 1. Estructura Básica

### Archivo `resolver.go`
```go
package graph

import (
	"github.com/jmoiron/sqlx"
)

type Resolver struct {
	DB *sqlx.DB
}
```

### Archivo `db_models.go`
Creé modelos de base de datos con campos de ID para las relaciones, separados de los modelos GraphQL generados.

## 2. Tipos de Resolvers Implementados

### A. Query Resolvers (Consultas)
- **Lista con paginación**: `Users`, `Ubicaciones`, `Clientes`, etc.
- **Individual**: `User`, `Ubicacion`, `Cliente`, etc.
- **Con filtros**: `Servicios` (por categoría, proveedor, ciudad, rating)
- **Con filtros complejos**: `Reservas` (por cliente, estado, fechas)

### B. Mutation Resolvers (Operaciones CRUD)
- **Create**: Crear nuevas entidades
- **Update**: Actualizar entidades existentes
- **Delete**: Eliminar entidades

### C. Field Resolvers (Relaciones)
- Resuelven las relaciones entre entidades
- Ejemplo: `User.Cliente`, `Servicio.Proveedor`, `Reserva.Detalles`

## 3. Patrones de Implementación

### Query Resolver Básico
```go
func (r *queryResolver) Users(ctx context.Context, pagination *model.Pagination) ([]*model.User, error) {
	var users []*model.User
	query := "SELECT * FROM api_rest_users"
	
	// Aplicar paginación
	if pagination != nil {
		if pagination.Limit != nil {
			query += fmt.Sprintf(" LIMIT %d", *pagination.Limit)
		}
		if pagination.Offset != nil {
			query += fmt.Sprintf(" OFFSET %d", *pagination.Offset)
		}
	}
	
	err := r.DB.Select(&users, query)
	if err != nil {
		return nil, err
	}
	return users, nil
}
```

### Mutation Resolver (Create)
```go
func (r *mutationResolver) CreateUser(ctx context.Context, input model.UserInput) (*model.User, error) {
	user := &model.User{
		Username:  input.Username,
		Email:     input.Email,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Rol:       input.Rol,
	}
	query := "INSERT INTO api_rest_users (username,email,first_name,last_name,rol,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING id"
	err := r.DB.QueryRow(query, user.Username, user.Email, user.FirstName, user.LastName, user.Rol).Scan(&user.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
```

### Query con Filtros
```go
func (r *queryResolver) Servicios(ctx context.Context, filter *model.ServicioFilter, pagination *model.Pagination) ([]*model.Servicio, error) {
	var servicios []*model.Servicio
	query := "SELECT s.* FROM api_rest_servicios s"
	args := []interface{}{}
	argIndex := 1
	
	// Construir WHERE clause basado en filtros
	whereClauses := []string{}
	
	if filter != nil {
		if filter.CategoriaID != nil {
			whereClauses = append(whereClauses, fmt.Sprintf("s.categoria_id = $%d", argIndex))
			args = append(args, *filter.CategoriaID)
			argIndex++
		}
		// Más filtros...
	}
	
	if len(whereClauses) > 0 {
		query += " WHERE " + strings.Join(whereClauses, " AND ")
	}
	
	// Aplicar paginación
	if pagination != nil {
		if pagination.Limit != nil {
			query += fmt.Sprintf(" LIMIT $%d", argIndex)
			args = append(args, *pagination.Limit)
			argIndex++
		}
		if pagination.Offset != nil {
			query += fmt.Sprintf(" OFFSET $%d", argIndex)
			args = append(args, *pagination.Offset)
		}
	}
	
	err := r.DB.Select(&servicios, query, args...)
	if err != nil {
		return nil, err
	}
	return servicios, nil
}
```

### Field Resolver (Relaciones)
```go
func (r *userResolver) Cliente(ctx context.Context, obj *model.User) (*model.Cliente, error) {
	var cliente model.Cliente
	query := "SELECT * FROM api_rest_clientes WHERE user_id = $1"
	err := r.DB.Get(&cliente, query, obj.ID)
	if err != nil {
		return nil, err
	}
	return &cliente, nil
}
```

## 4. Características Implementadas

### ✅ Paginación
- Soporte para `limit` y `offset`
- Aplicable a todas las consultas de lista

### ✅ Filtros Avanzados
- **Servicios**: Por categoría, proveedor, ciudad, rating mínimo
- **Reservas**: Por cliente, estado, rango de fechas

### ✅ Relaciones Complejas
- Resolución automática de relaciones entre entidades
- Soporte para relaciones opcionales (nullable)

### ✅ Manejo de Errores
- Validación de entrada
- Manejo de errores de base de datos
- Respuestas consistentes

### ✅ Transacciones
- Cálculo automático de subtotales en ReservaServicio
- Validación de integridad referencial

## 5. Próximos Pasos Recomendados

### A. Optimización de Consultas
```go
// Implementar DataLoader para evitar N+1 queries
func (r *servicioResolver) Proveedor(ctx context.Context, obj *model.Servicio) (*model.Proveedor, error) {
	// Usar DataLoader aquí
	return r.proveedorLoader.Load(ctx, obj.ProveedorID)
}
```

### B. Validación de Entrada
```go
func (r *mutationResolver) CreateUser(ctx context.Context, input model.UserInput) (*model.User, error) {
	// Validar email único
	var count int
	err := r.DB.Get(&count, "SELECT COUNT(*) FROM api_rest_users WHERE email = $1", input.Email)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("email already exists")
	}
	// Continuar con creación...
}
```

### C. Autenticación y Autorización
```go
func (r *mutationResolver) CreateServicio(ctx context.Context, input model.ServicioInput) (*model.Servicio, error) {
	// Verificar que el usuario autenticado es el proveedor
	userID := getUserIDFromContext(ctx)
	var proveedorID string
		err := r.DB.Get(&proveedorID, "SELECT id FROM api_rest_proveedores WHERE user_id = $1", userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}
	// Continuar con creación...
}
```

### D. Logging y Monitoreo
```go
func (r *queryResolver) Users(ctx context.Context, pagination *model.Pagination) ([]*model.User, error) {
	log.Printf("Querying users with pagination: %+v", pagination)
	start := time.Now()
	defer func() {
		log.Printf("Users query took %v", time.Since(start))
	}()
	// Implementación...
}
```

## 6. Estructura de Archivos Recomendada

```
graph/
├── resolver.go           # Resolver principal
├── db_models.go         # Modelos de base de datos
├── schema.resolvers.go  # Resolvers generados por gqlgen
├── generated.go         # Código generado por gqlgen
├── schema.graphqls      # Esquema GraphQL
└── database.go         # Configuración de base de datos
```

## 7. Comandos Útiles

### Regenerar código después de cambios en el esquema
```bash
go run github.com/99designs/gqlgen generate
```

### Ejecutar el servidor
```bash
go run server.go
```

## 8. Testing

### Ejemplo de test para resolver
```go
func TestCreateUser(t *testing.T) {
	// Setup test database
	db := setupTestDB()
	resolver := &Resolver{DB: db}
	
	// Test input
	input := model.UserInput{
		Username: "testuser",
		Email:    "test@example.com",
		Rol:      "cliente",
	}
	
	// Execute mutation
	user, err := resolver.CreateUser(context.Background(), input)
	
	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, input.Username, user.Username)
	assert.Equal(t, input.Email, user.Email)
}
```

## Conclusión

He implementado un conjunto completo de resolvers que cubren:
- ✅ Todas las operaciones CRUD
- ✅ Consultas con paginación y filtros
- ✅ Resolución de relaciones
- ✅ Manejo de errores
- ✅ Estructura escalable

Los resolvers están listos para usar y pueden ser extendidos fácilmente con funcionalidades adicionales como autenticación, validación avanzada, y optimizaciones de rendimiento.



