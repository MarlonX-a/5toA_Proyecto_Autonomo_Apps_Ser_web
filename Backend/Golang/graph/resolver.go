package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"context"
	"strconv"
	"time"

	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
	"github.com/jmoiron/sqlx"
)

// Resolvers para el backend
type Resolver struct {
	DB              *sqlx.DB
	Cache           *CacheService
	Metrics         *MetricsCollector
	proveedorLoader *DataLoader
	servicioLoader  *DataLoader
	clienteLoader   *DataLoader
	RESTClient      RestClient
}

// SetupDataLoaders configura los DataLoaders para optimizar consultas
func (r *Resolver) SetupDataLoaders() {
	r.proveedorLoader = NewDataLoader(r.loadProveedores, 5*time.Minute)
	r.servicioLoader = NewDataLoader(r.loadServicios, 5*time.Minute)
	r.clienteLoader = NewDataLoader(r.loadClientes, 5*time.Minute)
}

// loadProveedores carga múltiples proveedores por ID
func (r *Resolver) loadProveedores(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM api_rest_proveedor WHERE id = ANY($1)"
	var proveedores []*model.Proveedor

	// Convertir ids de string a int32
	intIDs := make([]int32, len(ids))
	for i, id := range ids {
		val, err := strconv.ParseInt(id, 10, 32)
		if err != nil {
			return nil, err
		}
		intIDs[i] = int32(val)
	}

	err := r.DB.Select(&proveedores, query, intIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[string]interface{})
	for _, proveedor := range proveedores {
		// Convertir int32 a string para el map key
		key := strconv.Itoa(int(proveedor.ID))
		result[key] = proveedor
	}

	return result, nil
}

// loadServicios carga múltiples servicios por ID
func (r *Resolver) loadServicios(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM api_rest_servicio WHERE id = ANY($1)"
	var servicios []*model.Servicio

	intIDs := make([]int32, len(ids))
	for i, id := range ids {
		val, err := strconv.ParseInt(id, 10, 32)
		if err != nil {
			return nil, err
		}
		intIDs[i] = int32(val)
	}

	err := r.DB.Select(&servicios, query, intIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[string]interface{})
	for _, servicio := range servicios {
		key := strconv.Itoa(int(servicio.ID))
		result[key] = servicio
	}

	return result, nil
}

// loadClientes carga múltiples clientes por ID
func (r *Resolver) loadClientes(ctx context.Context, ids []string) (map[string]interface{}, error) {
	query := "SELECT * FROM api_rest_cliente WHERE id = ANY($1)"
	var clientes []*model.Cliente

	intIDs := make([]int32, len(ids))
	for i, id := range ids {
		val, err := strconv.ParseInt(id, 10, 32)
		if err != nil {
			return nil, err
		}
		intIDs[i] = int32(val)
	}

	err := r.DB.Select(&clientes, query, intIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[string]interface{})
	for _, cliente := range clientes {
		key := strconv.Itoa(int(cliente.ID))
		result[key] = cliente
	}

	return result, nil
}
