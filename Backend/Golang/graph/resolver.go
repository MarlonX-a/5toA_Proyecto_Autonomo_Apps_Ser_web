package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

//imports para lo que se necesite
import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
)

// Resolvers para el backend
type Resolver struct {
	DB             *sqlx.DB
	Cache          *CacheService
	Metrics        *MetricsCollector
	proveedorLoader *DataLoader
	servicioLoader  *DataLoader
	clienteLoader   *DataLoader
}

// SetupDataLoaders configura los DataLoaders para optimizar consultas
func (r *Resolver) SetupDataLoaders() {
	r.proveedorLoader = NewDataLoader(r.loadProveedores, 5*time.Minute)
	r.servicioLoader = NewDataLoader(r.loadServicios, 5*time.Minute)
	r.clienteLoader = NewDataLoader(r.loadClientes, 5*time.Minute)
}

// loadProveedores carga múltiples proveedores por ID
func (r *Resolver) loadProveedores(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM proveedores WHERE id = ANY($1)"
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

// loadServicios carga múltiples servicios por ID
func (r *Resolver) loadServicios(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM servicios WHERE id = ANY($1)"
	var servicios []*model.Servicio
	
	err := r.DB.Select(&servicios, query, ids)
	if err != nil {
		return nil, err
	}
	
	result := make(map[string]interface{})
	for _, servicio := range servicios {
		result[servicio.ID] = servicio
	}
	
	return result, nil
}

// loadClientes carga múltiples clientes por ID
func (r *Resolver) loadClientes(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM clientes WHERE id = ANY($1)"
	var clientes []*model.Cliente
	
	err := r.DB.Select(&clientes, query, ids)
	if err != nil {
		return nil, err
	}
	
	result := make(map[string]interface{})
	for _, cliente := range clientes {
		result[cliente.ID] = cliente
	}
	
	return result, nil
}
