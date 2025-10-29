package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
)

// restClientImpl implementa la interfaz RestClient
type restClientImpl struct {
	BaseURL string
}

// Constructor
func NewRestClient(baseURL string) RestClient {
	return &restClientImpl{
		BaseURL: baseURL,
	}
}

// helper: http client with timeout
func (r *restClientImpl) httpClient() *http.Client {
	return &http.Client{Timeout: 10 * time.Second}
}

// authHeaderFromCtx devuelve el header Authorization si el request HTTP original está en el contexto
func authHeaderFromCtx(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if req, ok := ctx.Value("httpRequest").(*http.Request); ok && req != nil {
		return req.Header.Get("Authorization")
	}
	return ""
}

// doWithAuth añade Authorization del contexto si existe y ejecuta la request
func (r *restClientImpl) doWithAuth(ctx context.Context, req *http.Request) (*http.Response, error) {
	if req == nil {
		return nil, fmt.Errorf("nil request")
	}

	// Agregar cabecera Authorization si está en el contexto
	if auth := authHeaderFromCtx(ctx); auth != "" {
		req.Header.Set("Authorization", auth)
	}

	// Crear cliente HTTP y ejecutar la solicitud
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error al ejecutar request: %w", err)
	}

	return resp, nil
}

// helper: build list URL with optional pagination params
func (r *restClientImpl) buildListURL(path string, pagination *model.Pagination) string {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = path
	} else {
		u.Path = u.Path + path
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
	return u.String()
}

// ------------------ Users ------------------
func (r *restClientImpl) GetUser(ctx context.Context, id string) (*model.User, error) {
	url := fmt.Sprintf("%suser/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var u model.User
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *restClientImpl) ListUsers(ctx context.Context, pagination *model.Pagination) ([]*model.User, error) {
	u := r.buildListURL("user/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.User
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) CreateUser(ctx context.Context, input model.UserInput) (*model.User, error) {
	url := fmt.Sprintf("%suser/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var u model.User
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *restClientImpl) UpdateUser(ctx context.Context, id string, input model.UserInput) (*model.User, error) {
	url := fmt.Sprintf("%suser/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var u model.User
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *restClientImpl) DeleteUser(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%suser/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

// ------------------ ServicioUbicacion ------------------
func (r *restClientImpl) CreateServicioUbicacion(ctx context.Context, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error) {
	url := fmt.Sprintf("%sservicioUbicacion/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var su model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&su); err != nil {
		return nil, err
	}
	return &su, nil
}

func (r *restClientImpl) UpdateServicioUbicacion(ctx context.Context, id string, input model.ServicioUbicacionInput) (*model.ServicioUbicacion, error) {
	url := fmt.Sprintf("%sservicioUbicacion/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var su model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&su); err != nil {
		return nil, err
	}
	return &su, nil
}

func (r *restClientImpl) DeleteServicioUbicacion(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sservicioUbicacion/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) GetServicioUbicacion(ctx context.Context, id string) (*model.ServicioUbicacion, error) {
	url := fmt.Sprintf("%sservicioUbicacion/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var su model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&su); err != nil {
		return nil, err
	}
	return &su, nil
}

func (r *restClientImpl) ListServicioUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.ServicioUbicacion, error) {
	u := r.buildListURL("servicioUbicacion/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.ServicioUbicacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

// ------------------ Cliente ------------------
func (r *restClientImpl) CreateCliente(ctx context.Context, input model.ClienteInput) (*model.Cliente, error) {
	url := fmt.Sprintf("%scliente/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var c model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *restClientImpl) UpdateCliente(ctx context.Context, id string, input model.ClienteInput) (*model.Cliente, error) {
	url := fmt.Sprintf("%scliente/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var c model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *restClientImpl) DeleteCliente(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%scliente/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListClientes(ctx context.Context, pagination *model.Pagination) ([]*model.Cliente, error) {
	u := r.buildListURL("cliente/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) GetCliente(ctx context.Context, id string) (*model.Cliente, error) {
	url := fmt.Sprintf("%scliente/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var c model.Cliente
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

// ------------------ Proveedor ------------------
func (r *restClientImpl) CreateProveedor(ctx context.Context, input model.ProveedorInput) (*model.Proveedor, error) {
	url := fmt.Sprintf("%sproveedor/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var p model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *restClientImpl) UpdateProveedor(ctx context.Context, id string, input model.ProveedorInput) (*model.Proveedor, error) {
	url := fmt.Sprintf("%sproveedor/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var p model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *restClientImpl) DeleteProveedor(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sproveedor/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListProveedores(ctx context.Context, pagination *model.Pagination) ([]*model.Proveedor, error) {
	u := r.buildListURL("proveedor/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) GetProveedor(ctx context.Context, id string) (*model.Proveedor, error) {
	url := fmt.Sprintf("%sproveedor/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var p model.Proveedor
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

// ------------------ Servicio ------------------
func (r *restClientImpl) CreateServicio(ctx context.Context, input model.ServicioInput) (*model.Servicio, error) {
	url := fmt.Sprintf("%sservicio/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *restClientImpl) UpdateServicio(ctx context.Context, id string, input model.ServicioInput) (*model.Servicio, error) {
	url := fmt.Sprintf("%sservicio/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *restClientImpl) DeleteServicio(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sservicio/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) GetServicio(ctx context.Context, id string) (*model.Servicio, error) {
	url := fmt.Sprintf("%sservicio/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var s model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

// ListServicios with simple filter mapping (categoriaId, proveedorId, ciudad, q, minRating, precioMin, precioMax)
func (r *restClientImpl) ListServicios(ctx context.Context, filter *model.ServicioFilter, pagination *model.Pagination) ([]*model.Servicio, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "servicio/"
	} else {
		u.Path = u.Path + "servicio/"
	}
	q := u.Query()
	if filter != nil {
		if filter.CategoriaID != nil {
			q.Set("categoriaId", strconv.Itoa(int(*filter.CategoriaID)))
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", strconv.Itoa(int(*filter.ProveedorID)))
		}
		if filter.Ciudad != nil {
			q.Set("ciudad", *filter.Ciudad)
		}
		if filter.MinRating != nil {
			q.Set("minRating", fmt.Sprintf("%f", *filter.MinRating))
		}
		if filter.PrecioMin != nil {
			q.Set("precioMin", fmt.Sprintf("%f", *filter.PrecioMin))
		}
		if filter.PrecioMax != nil {
			q.Set("precioMax", fmt.Sprintf("%f", *filter.PrecioMax))
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
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.Servicio
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

// ------------------ FotoServicio ------------------
func (r *restClientImpl) CreateFotoServicio(ctx context.Context, input model.FotoServicioInput) (*model.FotoServicio, error) {
	url := fmt.Sprintf("%sfotoServicio/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var f model.FotoServicio
	if err := json.NewDecoder(resp.Body).Decode(&f); err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *restClientImpl) UpdateFotoServicio(ctx context.Context, id string, input model.FotoServicioInput) (*model.FotoServicio, error) {
	url := fmt.Sprintf("%sfotoServicio/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var f model.FotoServicio
	if err := json.NewDecoder(resp.Body).Decode(&f); err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *restClientImpl) DeleteFotoServicio(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sfotoServicio/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

// ------------------ Reserva ------------------
func (r *restClientImpl) CreateReserva(ctx context.Context, input model.ReservaInput) (*model.Reserva, error) {
	url := fmt.Sprintf("%sreserva/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var rs model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (r *restClientImpl) UpdateReserva(ctx context.Context, id string, input model.ReservaInput) (*model.Reserva, error) {
	url := fmt.Sprintf("%sreserva/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var rs model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (r *restClientImpl) DeleteReserva(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sreserva/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListReservas(ctx context.Context, filter *model.ReservaFilter, pagination *model.Pagination) ([]*model.Reserva, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "reserva/"
	} else {
		u.Path = u.Path + "reserva/"
	}
	q := u.Query()
	if filter != nil {
		if filter.ClienteID != nil {
			q.Set("clienteId", strconv.Itoa(int(*filter.ClienteID)))
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) GetReserva(ctx context.Context, id string) (*model.Reserva, error) {
	url := fmt.Sprintf("%sreserva/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var rs model.Reserva
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

// ------------------ ReservaServicio ------------------
func (r *restClientImpl) CreateReservaServicio(ctx context.Context, input model.ReservaServicioInput) (*model.ReservaServicio, error) {
	url := fmt.Sprintf("%sreservaServicio/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var rs model.ReservaServicio
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (r *restClientImpl) UpdateReservaServicio(ctx context.Context, id string, input model.ReservaServicioInput) (*model.ReservaServicio, error) {
	url := fmt.Sprintf("%sreservaServicio/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var rs model.ReservaServicio
	if err := json.NewDecoder(resp.Body).Decode(&rs); err != nil {
		return nil, err
	}
	return &rs, nil
}

func (r *restClientImpl) DeleteReservaServicio(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%sreservaServicio/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

// ------------------ Pagos ------------------
func (r *restClientImpl) CreatePago(ctx context.Context, input model.PagoInput) (*model.Pago, error) {
	url := fmt.Sprintf("%spago/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var p model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *restClientImpl) UpdatePago(ctx context.Context, id string, input model.PagoInput) (*model.Pago, error) {
	url := fmt.Sprintf("%spago/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var p model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *restClientImpl) DeletePago(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%spago/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListPagos(ctx context.Context, pagination *model.Pagination) ([]*model.Pago, error) {
	u := r.buildListURL("pago/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) GetPago(ctx context.Context, id string) (*model.Pago, error) {
	url := fmt.Sprintf("%spago/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var p model.Pago
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

// ------------------ Ubicacion ------------------
// (usé tu implementación funcional como referencia)
func (r *restClientImpl) GetUbicacion(ctx context.Context, id string) (*model.Ubicacion, error) {
	url := fmt.Sprintf("%subicacion/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var ubicacion model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&ubicacion); err != nil {
		return nil, err
	}
	return &ubicacion, nil
}

func (r *restClientImpl) ListUbicaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Ubicacion, error) {
	u := r.buildListURL("/ubicacion/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) CreateUbicacion(ctx context.Context, input model.UbicacionInput) (*model.Ubicacion, error) {
	url := fmt.Sprintf("%subicacion/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var u model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *restClientImpl) UpdateUbicacion(ctx context.Context, id string, input model.UbicacionInput) (*model.Ubicacion, error) {
	url := fmt.Sprintf("%subicacion/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var uModel model.Ubicacion
	if err := json.NewDecoder(resp.Body).Decode(&uModel); err != nil {
		return nil, err
	}
	return &uModel, nil
}

func (r *restClientImpl) DeleteUbicacion(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%subicacion/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

// ------------------ Categoria ------------------
func (r *restClientImpl) CreateCategoria(ctx context.Context, input model.CategoriaInput) (*model.Categoria, error) {
	url := fmt.Sprintf("%scategoria/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var c model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *restClientImpl) UpdateCategoria(ctx context.Context, id string, input model.CategoriaInput) (*model.Categoria, error) {
	url := fmt.Sprintf("%scategoria/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var c model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *restClientImpl) DeleteCategoria(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%scategoria/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListCategorias(ctx context.Context, pagination *model.Pagination) ([]*model.Categoria, error) {
	u := r.buildListURL("categoria/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) GetCategoria(ctx context.Context, id string) (*model.Categoria, error) {
	url := fmt.Sprintf("%scategoria/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", url, resp.StatusCode)
	}
	var c model.Categoria
	if err := json.NewDecoder(resp.Body).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

// ------------------ Comentario ------------------
func (r *restClientImpl) CreateComentario(ctx context.Context, input model.ComentarioInput) (*model.Comentario, error) {
	url := fmt.Sprintf("%scomentario/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var cm model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&cm); err != nil {
		return nil, err
	}
	return &cm, nil
}

func (r *restClientImpl) UpdateComentario(ctx context.Context, id string, input model.ComentarioInput) (*model.Comentario, error) {
	url := fmt.Sprintf("%scomentario/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var cm model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&cm); err != nil {
		return nil, err
	}
	return &cm, nil
}

func (r *restClientImpl) DeleteComentario(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%scomentario/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListComentarios(ctx context.Context, pagination *model.Pagination) ([]*model.Comentario, error) {
	u := r.buildListURL("comentario/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Comentario
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

// ------------------ Calificacion ------------------
func (r *restClientImpl) CreateCalificacion(ctx context.Context, input model.CalificacionInput) (*model.Calificacion, error) {
	url := fmt.Sprintf("%scalificacion/", r.BaseURL)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error POST %s: status %d", url, resp.StatusCode)
	}
	var cal model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&cal); err != nil {
		return nil, err
	}
	return &cal, nil
}

func (r *restClientImpl) UpdateCalificacion(ctx context.Context, id string, input model.CalificacionInput) (*model.Calificacion, error) {
	url := fmt.Sprintf("%scalificacion/%s/", r.BaseURL, id)
	data, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error PUT %s: status %d", url, resp.StatusCode)
	}
	var cal model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&cal); err != nil {
		return nil, err
	}
	return &cal, nil
}

func (r *restClientImpl) DeleteCalificacion(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("%scalificacion/%s/", r.BaseURL, id)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("error DELETE %s: status %d", url, resp.StatusCode)
	}
	return true, nil
}

func (r *restClientImpl) ListCalificaciones(ctx context.Context, pagination *model.Pagination) ([]*model.Calificacion, error) {
	u := r.buildListURL("calificacion/", pagination)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u, resp.StatusCode)
	}
	var list []*model.Calificacion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

// ------------------ Reports / Metrics ------------------
func (r *restClientImpl) ReporteVentas(ctx context.Context, filter *model.ReporteFilter) (*model.ReporteVentas, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "pago/"
	} else {
		u.Path = u.Path + "pago/"
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
			q.Set("categoriaId", strconv.Itoa(int(*filter.CategoriaID)))
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", strconv.Itoa(int(*filter.ProveedorID)))
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var rv model.ReporteVentas
	if err := json.NewDecoder(resp.Body).Decode(&rv); err != nil {
		return nil, err
	}
	return &rv, nil
}

func (r *restClientImpl) ReporteSatisfaccion(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteSatisfaccion, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "calificacion/"
	} else {
		u.Path = u.Path + "calificacion/"
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
			q.Set("categoriaId", strconv.Itoa(int(*filter.CategoriaID)))
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", strconv.Itoa(int(*filter.ProveedorID)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ReporteSatisfaccion
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) ReporteProveedores(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteProveedor, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "proveedor/"
	} else {
		u.Path = u.Path + "proveedor/"
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
			q.Set("categoriaId", strconv.Itoa(int(*filter.CategoriaID)))
		}
		if filter.ProveedorID != nil {
			q.Set("proveedorId", strconv.Itoa(int(*filter.ProveedorID)))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ReporteProveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) ReporteClientes(ctx context.Context, filter *model.ReporteFilter) ([]*model.ReporteCliente, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "cliente/"
	} else {
		u.Path = u.Path + "cliente/"
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ReporteCliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) MetricasGenerales(ctx context.Context, filter *model.MetricasFilter) (*model.MetricasGenerales, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "/metricas/generales"
	} else {
		u.Path = u.Path + "/metricas/generales"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
		if filter.AgruparPor != nil {
			// enum -> pass as string
			q.Set("agruparPor", string(*filter.AgruparPor))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var m model.MetricasGenerales
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *restClientImpl) ServiciosMasPopulares(ctx context.Context, limit *int32) ([]*model.ServicioVendido, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "servicio/"
	} else {
		u.Path = u.Path + "servicio/"
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ServicioVendido
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) ProveedoresMejorCalificados(ctx context.Context, limit *int32) ([]*model.ReporteProveedor, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "proveedor/"
	} else {
		u.Path = u.Path + "proveedor/"
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ReporteProveedor
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) ClientesMasActivos(ctx context.Context, limit *int32) ([]*model.ReporteCliente, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "cliente/"
	} else {
		u.Path = u.Path + "cliente/"
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
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var list []*model.ReporteCliente
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *restClientImpl) TendenciasVentas(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "pago/"
	} else {
		u.Path = u.Path + "pago/"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
		if filter.AgruparPor != nil {
			q.Set("agruparPor", string(*filter.AgruparPor))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var pts []*model.PuntoTendencia
	if err := json.NewDecoder(resp.Body).Decode(&pts); err != nil {
		return nil, err
	}
	return pts, nil
}

func (r *restClientImpl) TendenciasSatisfaccion(ctx context.Context, filter *model.MetricasFilter) ([]*model.PuntoTendencia, error) {
	u, _ := url.Parse(r.BaseURL)
	if u.Path == "/" || u.Path == "" {
		u.Path = "servicio/"
	} else {
		u.Path = u.Path + "servicio/"
	}
	q := u.Query()
	if filter != nil {
		if filter.FechaDesde != nil {
			q.Set("fechaDesde", *filter.FechaDesde)
		}
		if filter.FechaHasta != nil {
			q.Set("fechaHasta", *filter.FechaHasta)
		}
		if filter.AgruparPor != nil {
			q.Set("agruparPor", string(*filter.AgruparPor))
		}
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.doWithAuth(ctx, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error GET %s: status %d", u.String(), resp.StatusCode)
	}
	var pts []*model.PuntoTendencia
	if err := json.NewDecoder(resp.Body).Decode(&pts); err != nil {
		return nil, err
	}
	return pts, nil
}
