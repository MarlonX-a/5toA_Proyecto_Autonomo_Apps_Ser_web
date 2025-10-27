package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
)

// RestClient defines the interface for REST calls to the Django API
type RestClient interface {
	// Users
	GetUser(ctx context.Context, id string) (*model.User, error)
	ListUsers(ctx context.Context, pagination *model.Pagination) ([]*model.User, error)
	CreateUser(ctx context.Context, input model.UserInput) (*model.User, error)
	UpdateUser(ctx context.Context, id string, input model.UserInput) (*model.User, error)
	DeleteUser(ctx context.Context, id string) (bool, error)

	// ServicioUbicacion
	CreateServicioUbicacion(ctx context.Context, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error)
	UpdateServicioUbicacion(ctx context.Context, id string, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error)
	DeleteServicioUbicacion(ctx context.Context, id string) (bool, error)
	GetServicioUbicacion(ctx context.Context, id string) (*model.ServicioUbicacion, error)
	ListServicioUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.ServicioUbicacion, error)
	CreateCliente(ctx context.Context, input model.ClienteInput) (*model.Cliente, error)
	UpdateCliente(ctx context.Context, id string, input model.ClienteInput) (*model.Cliente, error)
	DeleteCliente(ctx context.Context, id string) (bool, error)
	CreateProveedor(ctx context.Context, input model.ProveedorInput) (*model.Proveedor, error)
	UpdateProveedor(ctx context.Context, id string, input model.ProveedorInput) (*model.Proveedor, error)
	DeleteProveedor(ctx context.Context, id string) (bool, error)
	GetServicio(ctx context.Context, id string) (*model.Servicio, error)

	// Reservas
	CreateReserva(ctx context.Context, input model.ReservaInput) (*model.Reserva, error)
	UpdateReserva(ctx context.Context, id string, input model.ReservaInput) (*model.Reserva, error)
	DeleteReserva(ctx context.Context, id string) (bool, error)

	// ReservaServicio
	CreateReservaServicio(ctx context.Context, input model.ReservaServicioInput) (*model.ReservaServicio, error)
	UpdateReservaServicio(ctx context.Context, id string, input model.ReservaServicioInput) (*model.ReservaServicio, error)
	DeleteReservaServicio(ctx context.Context, id string) (bool, error)

	// Pagos
	CreatePago(ctx context.Context, input model.PagoInput) (*model.Pago, error)
	UpdatePago(ctx context.Context, id string, input model.PagoInput) (*model.Pago, error)
	DeletePago(ctx context.Context, id string) (bool, error)
	CreateServicio(ctx context.Context, input model.ServicioInput) (*model.Servicio, error)
	UpdateServicio(ctx context.Context, id string, input model.ServicioInput) (*model.Servicio, error)
	DeleteServicio(ctx context.Context, id string) (bool, error)
	CreateFotoServicio(ctx context.Context, input model.FotoServicioInput) (*model.FotoServicio, error)
	UpdateFotoServicio(ctx context.Context, id string, input model.FotoServicioInput) (*model.FotoServicio, error)
	DeleteFotoServicio(ctx context.Context, id string) (bool, error)
	ListServicios(ctx context.Context, filter *model.ServicioFilter, pagination *model.Pagination) ([]*model.Servicio, error)
	GetProveedor(ctx context.Context, id string) (*model.Proveedor, error)
	ListProveedores(ctx context.Context, pagination *model.Pagination) ([]*model.Proveedor, error)
	ListReservas(ctx context.Context, filter *model.ReservaFilter, pagination *model.Pagination) ([]*model.Reserva, error)
	GetReserva(ctx context.Context, id string) (*model.Reserva, error)
	ListClientes(ctx context.Context, pagination *model.Pagination) ([]*model.Cliente, error)
	GetCliente(ctx context.Context, id string) (*model.Cliente, error)
	ListUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Ubicacion, error)
	GetUbicacion(ctx context.Context, id string) (*model.Ubicacion, error)
	ListCategorias(ctx context.Context, pagination *model.Pagination) ([]*model.Categoria, error)
	GetCategoria(ctx context.Context, id string) (*model.Categoria, error)
	ListCalificaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Calificacion, error)
	ListComentarios(ctx context.Context, pagination *model.Pagination) ([]*model.Comentario, error)
	ListPagos(ctx context.Context, pagination *model.Pagination) ([]*model.Pago, error)
	GetPago(ctx context.Context, id string) (*model.Pago, error)

	// CRUD Ubicacion
	CreateUbicacion(ctx context.Context, input model.UbicacionInput) (*model.Ubicacion, error)
	UpdateUbicacion(ctx context.Context, id string, input model.UbicacionInput) (*model.Ubicacion, error)
	DeleteUbicacion(ctx context.Context, id string) (bool, error)

	// CRUD Categoria
	CreateCategoria(ctx context.Context, input model.CategoriaInput) (*model.Categoria, error)
	UpdateCategoria(ctx context.Context, id string, input model.CategoriaInput) (*model.Categoria, error)
	DeleteCategoria(ctx context.Context, id string) (bool, error)

	// CRUD Calificacion
	CreateCalificacion(ctx context.Context, input model.CalificacionInput) (*model.Calificacion, error)
	UpdateCalificacion(ctx context.Context, id string, input model.CalificacionInput) (*model.Calificacion, error)
	DeleteCalificacion(ctx context.Context, id string) (bool, error)

	// CRUD Comentario
	CreateComentario(ctx context.Context, input model.ComentarioInput) (*model.Comentario, error)
	UpdateComentario(ctx context.Context, id string, input model.ComentarioInput) (*model.Comentario, error)
	DeleteComentario(ctx context.Context, id string) (bool, error)

	// Reports / metrics / advanced
	ReporteVentas(ctx context.Context, filter *model.ReporteFilter) (*model.ReporteVentas, error)
	ReporteSatisfaccion(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteSatisfaccion, error)
	ReporteProveedores(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteProveedor, error)
	ReporteClientes(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteCliente, error)
	MetricasGenerales(ctx context.Context, filter *model.MetricasFilter) (*model.MetricasGenerales, error)
	ServiciosMasPopulares(ctx context.Context, limit *int32) ([]*model.ServicioVendido, error)
	ProveedoresMejorCalificados(ctx context.Context, limit *int32) ([]*model.ReporteProveedor, error)
	ClientesMasActivos(ctx context.Context, limit *int32) ([]*model.ReporteCliente, error)
	TendenciasVentas(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error)
	TendenciasSatisfaccion(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error)
}

// DummyRestClient is a minimal implementation that can be replaced by a real HTTP client.
type DummyRestClient struct {
	HTTP    *http.Client
	BaseURL string
}

func NewDummyRestClient(baseURL string) *DummyRestClient {
	return &DummyRestClient{HTTP: &http.Client{}, BaseURL: baseURL}
}

func (c *DummyRestClient) ListUsers(ctx context.Context, pagination *model.Pagination) ([]*model.User, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api_rest/api/v1/users"
	} else {
		u.Path = u.Path + "/api_rest/api/v1/users"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.User
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) CreateUser(ctx context.Context, input model.UserInput) (*model.User, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api_rest/api/v1/users/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var user model.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (c *DummyRestClient) UpdateUser(ctx context.Context, id string, input model.UserInput) (*model.User, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api_rest/api/v1/users/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var user model.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (c *DummyRestClient) DeleteUser(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api_rest/api/v1/users/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

func (c *DummyRestClient) CreateCliente(ctx context.Context, input model.ClienteInput) (*model.Cliente, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api_rest/api/v1/cliente/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var cliente model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&cliente); err != nil {
		return nil, err
	}
	return &cliente, nil
}

func (c *DummyRestClient) UpdateCliente(ctx context.Context, id string, input model.ClienteInput) (*model.Cliente, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/clientes/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var cliente model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&cliente); err != nil {
		return nil, err
	}
	return &cliente, nil
}

func (c *DummyRestClient) DeleteCliente(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/clientes/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

func (c *DummyRestClient) CreateProveedor(ctx context.Context, input model.ProveedorInput) (*model.Proveedor, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/proveedores/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var proveedor model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&proveedor); err != nil {
		return nil, err
	}
	return &proveedor, nil
}

func (c *DummyRestClient) UpdateProveedor(ctx context.Context, id string, input model.ProveedorInput) (*model.Proveedor, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/proveedores/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var proveedor model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&proveedor); err != nil {
		return nil, err
	}
	return &proveedor, nil
}

func (c *DummyRestClient) DeleteProveedor(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/proveedores/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

// Reservas
func (c *DummyRestClient) CreateReserva(ctx context.Context, input model.ReservaInput) (*model.Reserva, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/reservas/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var r model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return nil, err
	}
	return &r, nil
}

func (c *DummyRestClient) UpdateReserva(ctx context.Context, id string, input model.ReservaInput) (*model.Reserva, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/reservas/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var r model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return nil, err
	}
	return &r, nil
}

func (c *DummyRestClient) DeleteReserva(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/reservas/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

// ReservaServicio
func (c *DummyRestClient) CreateReservaServicio(ctx context.Context, input model.ReservaServicioInput) (*model.ReservaServicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/reserva-servicios/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var rs model.ReservaServicio
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (c *DummyRestClient) UpdateReservaServicio(ctx context.Context, id string, input model.ReservaServicioInput) (*model.ReservaServicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/reserva-servicios/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var rs model.ReservaServicio
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (c *DummyRestClient) DeleteReservaServicio(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/reserva-servicios/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

// Pagos
func (c *DummyRestClient) CreatePago(ctx context.Context, input model.PagoInput) (*model.Pago, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/pagos/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var pago model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&pago); err != nil {
		return nil, err
	}
	return &pago, nil
}

func (c *DummyRestClient) UpdatePago(ctx context.Context, id string, input model.PagoInput) (*model.Pago, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/pagos/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var pago model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&pago); err != nil {
		return nil, err
	}
	return &pago, nil
}

func (c *DummyRestClient) DeletePago(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/pagos/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}
func (c *DummyRestClient) GetUser(ctx context.Context, id string) (*model.User, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/users/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var user model.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

// buildURL builds a URL for the servicios endpoint with query params from filter/pagination
func (c *DummyRestClient) buildServiciosURL(filter *model.ServicioFilter, pagination *model.Pagination) string {
	u, _ := url.Parse(c.BaseURL)
	// assume Django REST endpoint at /api/servicios/
	// url.JoinPath returns (string, error) in Go 1.20+. Use simple join to remain compatible.
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api_rest/api/v1/servicio"
	} else {
		u.Path = u.Path + "/api_rest/api/v1/servicio"
	}
	q := u.Query()
	if filter != nil {
		if filter.CategoriaID != nil {
			q.Set("categoriaId", *filter.CategoriaID)
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", *filter.ProveedorID)
		}
		if filter.Ciudad != nil {
			q.Set("ciudad", *filter.Ciudad)
		}
		if filter.MinRating != nil {
			q.Set("minRating", fmt.Sprintf("%f", *filter.MinRating))
		}
		if filter.PrecioMin != nil {
			q.Set("precioMin", *filter.PrecioMin)
		}
		if filter.PrecioMax != nil {
			q.Set("precioMax", *filter.PrecioMax)
		}
		if filter.Q != nil {
			q.Set("q", *filter.Q)
		}
	}
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func (c *DummyRestClient) GetServicio(ctx context.Context, id string) (*model.Servicio, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api_rest/api/v1/servicio/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (c *DummyRestClient) CreateServicio(ctx context.Context, input model.ServicioInput) (*model.Servicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api_rest/api/v1/servicio/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (c *DummyRestClient) UpdateServicio(ctx context.Context, id string, input model.ServicioInput) (*model.Servicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api_rest/api/v1/servicio/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (c *DummyRestClient) DeleteServicio(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api_rest/api/v1/servicio/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

func (c *DummyRestClient) CreateFotoServicio(ctx context.Context, input model.FotoServicioInput) (*model.FotoServicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/fotos-servicio/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var foto model.FotoServicio
	if err := json.NewDecoder(resp.Body).Decode(&foto); err != nil {
		return nil, err
	}
	return &foto, nil
}

func (c *DummyRestClient) UpdateFotoServicio(ctx context.Context, id string, input model.FotoServicioInput) (*model.FotoServicio, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/fotos-servicio/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var foto model.FotoServicio
	if err := json.NewDecoder(resp.Body).Decode(&foto); err != nil {
		return nil, err
	}
	return &foto, nil
}

func (c *DummyRestClient) DeleteFotoServicio(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/fotos-servicio/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

func (c *DummyRestClient) ListServicios(ctx context.Context, filter *model.ServicioFilter, pagination *model.Pagination) ([]*model.Servicio, error) {
	url := c.buildServiciosURL(filter, pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var list []*model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetProveedor(ctx context.Context, id string) (*model.Proveedor, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/proveedores/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var p model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (c *DummyRestClient) ListProveedores(ctx context.Context, pagination *model.Pagination) ([]*model.Proveedor, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api_rest/api/v1/proveedor"
	} else {
		u.Path = u.Path + "/api_rest/api/v1/proveedor"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ListReservas(ctx context.Context, filter *model.ReservaFilter, pagination *model.Pagination) ([]*model.Reserva, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/reservas"
	} else {
		u.Path = u.Path + "/api/reservas"
	}
	q := u.Query()
	if filter != nil {
		if filter.ClienteID != nil {
			q.Set("clienteId", *filter.ClienteID)
		}
		if filter.Estado != nil {
			q.Set("estado", *filter.Estado)
		}
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetReserva(ctx context.Context, id string) (*model.Reserva, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/reservas/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var r model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return nil, err
	}
	return &r, nil
}

func (c *DummyRestClient) ListClientes(ctx context.Context, pagination *model.Pagination) ([]*model.Cliente, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/clientes"
	} else {
		u.Path = u.Path + "/api/clientes"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetCliente(ctx context.Context, id string) (*model.Cliente, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/clientes/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cobj model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&cobj); err != nil {
		return nil, err
	}
	return &cobj, nil
}

func (c *DummyRestClient) ListUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Ubicacion, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/ubicaciones"
	} else {
		u.Path = u.Path + "/api/ubicaciones"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetUbicacion(ctx context.Context, id string) (*model.Ubicacion, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/ubicaciones/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var ub model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&ub); err != nil {
		return nil, err
	}
	return &ub, nil
}

func (c *DummyRestClient) ListCategorias(ctx context.Context, pagination *model.Pagination) ([]*model.Categoria, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/categorias"
	} else {
		u.Path = u.Path + "/api/categorias"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetCategoria(ctx context.Context, id string) (*model.Categoria, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/categorias/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cat model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&cat); err != nil {
		return nil, err
	}
	return &cat, nil
}

func (c *DummyRestClient) ListCalificaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Calificacion, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/calificaciones"
	} else {
		u.Path = u.Path + "/api/calificaciones"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ListComentarios(ctx context.Context, pagination *model.Pagination) ([]*model.Comentario, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/comentarios"
	} else {
		u.Path = u.Path + "/api/comentarios"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ListPagos(ctx context.Context, pagination *model.Pagination) ([]*model.Pago, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/pagos"
	} else {
		u.Path = u.Path + "/api/pagos"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) GetPago(ctx context.Context, id string) (*model.Pago, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/pagos/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var pago model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&pago); err != nil {
		return nil, err
	}
	return &pago, nil
}

// CRUD Ubicacion
func (c *DummyRestClient) CreateUbicacion(ctx context.Context, input model.UbicacionInput) (*model.Ubicacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/ubicaciones/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var u model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (c *DummyRestClient) UpdateUbicacion(ctx context.Context, id string, input model.UbicacionInput) (*model.Ubicacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/ubicaciones/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var u model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (c *DummyRestClient) DeleteUbicacion(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/ubicaciones/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	return true, nil
}

// CRUD Categoria
func (c *DummyRestClient) CreateCategoria(ctx context.Context, input model.CategoriaInput) (*model.Categoria, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/categorias/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cat model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&cat); err != nil {
		return nil, err
	}
	return &cat, nil
}

func (c *DummyRestClient) UpdateCategoria(ctx context.Context, id string, input model.CategoriaInput) (*model.Categoria, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/categorias/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cat model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&cat); err != nil {
		return nil, err
	}
	return &cat, nil
}

func (c *DummyRestClient) DeleteCategoria(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/categorias/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	return true, nil
}

// CRUD Calificacion
func (c *DummyRestClient) CreateCalificacion(ctx context.Context, input model.CalificacionInput) (*model.Calificacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/calificaciones/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cal model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&cal); err != nil {
		return nil, err
	}
	return &cal, nil
}

func (c *DummyRestClient) UpdateCalificacion(ctx context.Context, id string, input model.CalificacionInput) (*model.Calificacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/calificaciones/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var cal model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&cal); err != nil {
		return nil, err
	}
	return &cal, nil
}

func (c *DummyRestClient) DeleteCalificacion(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/calificaciones/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	return true, nil
}

// CRUD Comentario
func (c *DummyRestClient) CreateComentario(ctx context.Context, input model.ComentarioInput) (*model.Comentario, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/comentarios/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var com model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&com); err != nil {
		return nil, err
	}
	return &com, nil
}

func (c *DummyRestClient) UpdateComentario(ctx context.Context, id string, input model.ComentarioInput) (*model.Comentario, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api/comentarios/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var com model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&com); err != nil {
		return nil, err
	}
	return &com, nil
}

func (c *DummyRestClient) DeleteComentario(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api/comentarios/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	return true, nil
}

// Reports / metrics / advanced endpoints (best-effort using conventional endpoints)
func (c *DummyRestClient) ReporteVentas(ctx context.Context, filter *model.ReporteFilter) (*model.ReporteVentas, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/reportes/ventas"
	} else {
		u.Path = u.Path + "/api/reportes/ventas"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
		if filter.CategoriaID != nil {
			q.Set("categoriaId", *filter.CategoriaID)
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", *filter.ProveedorID)
		}
		if filter.Ciudad != nil {
			q.Set("ciudad", *filter.Ciudad)
		}
		if filter.EstadoReserva != nil {
			q.Set("estadoReserva", *filter.EstadoReserva)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var rv model.ReporteVentas
	if err := json.NewDecoder(resp.Body).Decode(&rv); err != nil {
		return nil, err
	}
	return &rv, nil
}

func (c *DummyRestClient) ReporteSatisfaccion(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteSatisfaccion, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/reportes/satisfaccion"
	} else {
		u.Path = u.Path + "/api/reportes/satisfaccion"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ReporteSatisfaccion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ReporteProveedores(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteProveedor, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/reportes/proveedores"
	} else {
		u.Path = u.Path + "/api/reportes/proveedores"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ReporteProveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ReporteClientes(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteCliente, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/reportes/clientes"
	} else {
		u.Path = u.Path + "/api/reportes/clientes"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ReporteCliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) MetricasGenerales(ctx context.Context, filter *model.MetricasFilter) (*model.MetricasGenerales, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/metricas/generales"
	} else {
		u.Path = u.Path + "/api/metricas/generales"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var m model.MetricasGenerales
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		return nil, err
	}
	return &m, nil
}

func (c *DummyRestClient) ServiciosMasPopulares(ctx context.Context, limit *int32) ([]*model.ServicioVendido, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/servicios/mas-populares"
	} else {
		u.Path = u.Path + "/api/servicios/mas-populares"
	}
	q := u.Query()
	if limit != nil {
		q.Set("limit", strconv.Itoa(int(*limit)))
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ServicioVendido
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ProveedoresMejorCalificados(ctx context.Context, limit *int32) ([]*model.ReporteProveedor, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/proveedores/mejor-calificados"
	} else {
		u.Path = u.Path + "/api/proveedores/mejor-calificados"
	}
	q := u.Query()
	if limit != nil {
		q.Set("limit", strconv.Itoa(int(*limit)))
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ReporteProveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) ClientesMasActivos(ctx context.Context, limit *int32) ([]*model.ReporteCliente, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/clientes/mas-activos"
	} else {
		u.Path = u.Path + "/api/clientes/mas-activos"
	}
	q := u.Query()
	if limit != nil {
		q.Set("limit", strconv.Itoa(int(*limit)))
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.ReporteCliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) TendenciasVentas(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/tendencias/ventas"
	} else {
		u.Path = u.Path + "/api/tendencias/ventas"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.PuntoTendencia
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

// ServicioUbicacion
func (c *DummyRestClient) CreateServicioUbicacion(ctx context.Context, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api_rest/api/v1/servicioUbicacion/", c.BaseURL), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var servicioUb model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&servicioUb); err != nil {
		return nil, err
	}
	return &servicioUb, nil
}

func (c *DummyRestClient) UpdateServicioUbicacion(ctx context.Context, id string, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/api_rest/api/v1/servicioUbicacion/%s/", c.BaseURL, id), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var servicioUb model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&servicioUb); err != nil {
		return nil, err
	}
	return &servicioUb, nil
}

func (c *DummyRestClient) DeleteServicioUbicacion(ctx context.Context, id string) (bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, fmt.Sprintf("%s/api_rest/api/v1/servicioUbicacion/%s/", c.BaseURL, id), nil)
	if err != nil {
		return false, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return false, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return true, nil
}

func (c *DummyRestClient) GetServicioUbicacion(ctx context.Context, id string) (*model.ServicioUbicacion, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api_rest/api/v1/servicioUbicacion/%s/", c.BaseURL, id), nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var servicioUb model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&servicioUb); err != nil {
		return nil, err
	}
	return &servicioUb, nil
}

func (c *DummyRestClient) ListServicioUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.ServicioUbicacion, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api_rest/api/v1/servicioUbicacion"
	} else {
		u.Path = u.Path + "/api_rest/api/v1/servicioUbicacion"
	}
	q := u.Query()
	if pagination != nil {
		if pagination.Limit != nil {
			q.Set("limit", strconv.Itoa(int(*pagination.Limit)))
		}
		if pagination.Offset != nil {
			q.Set("offset", strconv.Itoa(int(*pagination.Offset)))
		}
	}
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var list []*model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *DummyRestClient) TendenciasSatisfaccion(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error) {
	u, _ := url.Parse(c.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/api/tendencias/satisfaccion"
	} else {
		u.Path = u.Path + "/api/tendencias/satisfaccion"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	var list []*model.PuntoTendencia
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}
