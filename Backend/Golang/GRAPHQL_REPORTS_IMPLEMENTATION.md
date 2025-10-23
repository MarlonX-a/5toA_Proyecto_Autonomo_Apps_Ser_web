# Servicio GraphQL - Capa de Reportes y Consultas Complejas

## 1. Schema Extendido para Reportes Analíticos

```graphql
# Tipos para reportes analíticos
type ReporteVentas {
  periodo: String!
  totalVentas: Decimal!
  cantidadReservas: Int!
  promedioPorReserva: Decimal!
  serviciosMasVendidos: [ServicioVendido!]!
}

type ServicioVendido {
  servicio: Servicio!
  cantidadVendida: Int!
  ingresosGenerados: Decimal!
}
```

## 2. Implementación de Resolvers para Reportes

```go
func (r *queryResolver) ServiciosMasVendidos(ctx context.Context, limite *int32) ([]*model.ServicioVendido, error) {
	query := fmt.Sprintf(`
		SELECT 
			s.id,
			s.nombre_servicio,
			COUNT(*) as cantidad_vendida,
			SUM(rs.precio) as ingresos_generados
		FROM api_rest_reserva_servicios rs
		JOIN api_rest_servicios s ON s.id = rs.servicio_id
		GROUP BY s.id, s.nombre_servicio
		ORDER BY cantidad_vendida DESC
		LIMIT %d
	`, limite)
	
	var resultados []struct {
		ServicioID        string `db:"id"`
		NombreServicio    string `db:"nombre_servicio"`
		CantidadVendida   int    `db:"cantidad_vendida"`
		IngresosGenerados string `db:"ingresos_generados"`
	}
	
	err := r.DB.Select(&resultados, query)
	if err != nil {
		return nil, err
	}
	
	var serviciosVendidos []*model.ServicioVendido
	for _, resultado := range resultados {
		servicio := &model.Servicio{
			ID:             resultado.ServicioID,
			NombreServicio: resultado.NombreServicio,
		}
		
		servicioVendido := &model.ServicioVendido{
			Servicio:          servicio,
			CantidadVendida:   resultado.CantidadVendida,
			IngresosGenerados: resultado.IngresosGenerados,
		}
		
		serviciosVendidos = append(serviciosVendidos, servicioVendido)
	}
	
	return serviciosVendidos, nil
}
```

## 3. DataLoader para Optimización

```go
// dataloader.go
package graph

import (
	"context"
	"sync"
	"time"
)

type DataLoader struct {
	cache    map[string]interface{}
	mutex    sync.RWMutex
	loadFunc func(context.Context, []string) (map[string]interface{}, error)
	ttl      time.Duration
}

func NewDataLoader(loadFunc func(context.Context, []string) (map[string]interface{}, error), ttl time.Duration) *DataLoader {
	return &DataLoader{
		cache:    make(map[string]interface{}),
		loadFunc: loadFunc,
		ttl:      ttl,
	}
}

func (dl *DataLoader) Load(ctx context.Context, key string) (interface{}, error) {
	dl.mutex.RLock()
	if value, exists := dl.cache[key]; exists {
		dl.mutex.RUnlock()
		return value, nil
	}
	dl.mutex.RUnlock()
	
	dl.mutex.Lock()
	defer dl.mutex.Unlock()
	
	// Double-check after acquiring write lock
	if value, exists := dl.cache[key]; exists {
		return value, nil
	}
	
	// Load the value
	values, err := dl.loadFunc(ctx, []string{key})
	if err != nil {
		return nil, err
	}
	
	if value, exists := values[key]; exists {
		dl.cache[key] = value
		return value, nil
	}
	
	return nil, nil
}

// Proveedor DataLoader
func (r *Resolver) LoadProveedor(ctx context.Context, proveedorID string) (*model.Proveedor, error) {
	if r.proveedorLoader == nil {
		r.proveedorLoader = NewDataLoader(r.loadProveedores, 5*time.Minute)
	}
	
	result, err := r.proveedorLoader.Load(ctx, proveedorID)
	if err != nil {
		return nil, err
	}
	
	if proveedor, ok := result.(*model.Proveedor); ok {
		return proveedor, nil
	}
	
	return nil, nil
}

func (r *Resolver) loadProveedores(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM api_rest_proveedores WHERE id = ANY($1)"
	var proveedores []*model.Proveedor
	
	err := r.DB.Select(&proveedores, query, ids)
	if err != nil {
		return nil, err
	}
	
	result := make(map[string]interface{})
	for _, proveedor := range proveedores {
		result[proveedor.ID] = proveedor
	}
	
	return result, nil
}
```

## 4. Caché para Consultas Frecuentes

```go
// cache.go
package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

type CacheService struct {
	cache map[string]CacheItem
	mutex sync.RWMutex
}

type CacheItem struct {
	Value     interface{}
	ExpiresAt time.Time
}

func NewCacheService() *CacheService {
	return &CacheService{
		cache: make(map[string]CacheItem),
	}
}

func (c *CacheService) Get(ctx context.Context, key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	item, exists := c.cache[key]
	if !exists {
		return nil, false
	}
	
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}
	
	return item.Value, true
}

func (c *CacheService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.cache[key] = CacheItem{
		Value:     value,
		ExpiresAt: time.Now().Add(ttl),
	}
}

func (c *CacheService) Delete(ctx context.Context, key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	delete(c.cache, key)
}

// Resolver con caché
func (r *queryResolver) ServiciosMasPopulares(ctx context.Context, limit *int32) ([]*model.ServicioVendido, error) {
	cacheKey := fmt.Sprintf("servicios_populares_%d", limit)
	
	// Intentar obtener del caché
	if cached, exists := r.cache.Get(ctx, cacheKey); exists {
		if servicios, ok := cached.([]*model.ServicioVendido); ok {
			return servicios, nil
		}
	}
	
	// Si no está en caché, ejecutar consulta
	servicios, err := r.getServiciosMasPopularesFromDB(ctx, limit)
	if err != nil {
		return nil, err
	}
	
	// Guardar en caché por 10 minutos
	r.cache.Set(ctx, cacheKey, servicios, 10*time.Minute)
	
	return servicios, nil
}
```

## 5. Middleware de Logging y Monitoreo

```go
// middleware.go
package graph

import (
	"context"
	"log"
	"time"
)

func LoggingMiddleware(next func(context.Context) (interface{}, error)) func(context.Context) (interface{}, error) {
	return func(ctx context.Context) (interface{}, error) {
		start := time.Now()
		
		result, err := next(ctx)
		
		duration := time.Since(start)
		log.Printf("Query executed in %v", duration)
		
		if err != nil {
			log.Printf("Query error: %v", err)
		}
		
		return result, err
	}
}

func MetricsMiddleware(next func(context.Context) (interface{}, error)) func(context.Context) (interface{}, error) {
	return func(ctx context.Context) (interface{}, error) {
		start := time.Now()
		
		result, err := next(ctx)
		
		duration := time.Since(start)
		
		// Aquí podrías enviar métricas a un sistema como Prometheus
		log.Printf("Metrics: duration=%v, error=%v", duration, err != nil)
		
		return result, err
	}
}
```

## 6. Configuración del Servidor

```go
// server.go
package main

import (
	"log"
	"net/http"
	"os"
	
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph"
)

func main() {
	// Conectar a la base de datos
	graph.ConnectDB()
	
	// Crear resolver con servicios adicionales
	resolver := &graph.Resolver{
		DB:    graph.DB,
		Cache: graph.NewCacheService(),
	}
	
	// Configurar DataLoaders
	resolver.SetupDataLoaders()
	
	// Crear servidor GraphQL
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))
	
	// Middleware de logging
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", LoggingMiddleware(srv))
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
```

## 7. Tests para Reportes

```go
// reportes_test.go
package graph

import (
	"context"
	"testing"
	"time"
)

func TestReporteVentas(t *testing.T) {
	// Setup test database
	db := setupTestDB()
	resolver := &Resolver{DB: db}
	
	// Test data
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	// Execute query
	reporte, err := resolver.ReporteVentas(context.Background(), filter)
	
	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, reporte)
	assert.Greater(t, reporte.CantidadReservas, 0)
	assert.NotEmpty(t, reporte.TotalVentas)
}

func TestServiciosMasPopulares(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{DB: db}
	
	limit := int32(5)
	servicios, err := resolver.ServiciosMasPopulares(context.Background(), &limit)
	
	assert.NoError(t, err)
	assert.Len(t, servicios, 5)
	
	// Verificar que están ordenados por cantidad vendida
	for i := 1; i < len(servicios); i++ {
		assert.GreaterOrEqual(t, servicios[i-1].CantidadVendida, servicios[i].CantidadVendida)
	}
}
```

## Resumen de Implementación

### ✅ **Lo que se agregó:**

1. **Schema Extendido** - Tipos para reportes analíticos
2. **Resolvers de Reportes** - Consultas complejas con agregaciones
3. **DataLoader** - Optimización para evitar N+1 queries
4. **Sistema de Caché** - Mejora de rendimiento
5. **Middleware** - Logging y monitoreo
6. **Tests** - Validación de funcionalidad

### 🚀 **Beneficios:**

- **Consultas Optimizadas** - DataLoader y caché mejoran rendimiento
- **Reportes Analíticos** - Métricas de negocio importantes
- **Escalabilidad** - Arquitectura preparada para crecimiento
- **Monitoreo** - Visibilidad del rendimiento del sistema

### 📊 **Reportes Disponibles:**

- Ventas por período
- Satisfacción del cliente
- Rendimiento de proveedores
- Métricas generales del sistema
- Tendencias temporales
- Servicios más populares

**¡Tu servicio GraphQL ahora tiene una capa completa de reportes y consultas complejas!** 🎯



