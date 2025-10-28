package graph

import (
	"context"
	"fmt"

	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
)

// getServiciosMasVendidos retorna los servicios más vendidos dentro de un filtro opcional
func (r *queryResolver) getServiciosMasVendidos(ctx context.Context, filter *model.ReporteFilter) ([]*model.ServicioVendido, error) {
	query := `
        SELECT
            s.id,
            s.nombre_servicio,
            COUNT(rs.id) as cantidad_vendida,
            COALESCE(SUM(CAST(rs.subtotal AS DECIMAL)), 0) as ingresos_generados
        FROM api_rest_servicio s
        JOIN api_rest_reserva_servicio rs ON s.id = rs.servicio_id
        JOIN api_rest_reserva r ON rs.reserva_id = r.id
        WHERE r.estado = 'completada'
    `

	args := []interface{}{}
	argIndex := 1

	if filter != nil {
		if filter.FechaDesde != nil {
			query += fmt.Sprintf(" AND r.fecha >= $%d", argIndex)
			args = append(args, *filter.FechaDesde)
			argIndex++
		}
		if filter.FechaHasta != nil {
			query += fmt.Sprintf(" AND r.fecha <= $%d", argIndex)
			args = append(args, *filter.FechaHasta)
			argIndex++
		}
		// Algunos nombres de campo opcionales en ReporteFilter
		if filter.CategoriaID != nil {
			query += fmt.Sprintf(" AND s.categoria_id = $%d", argIndex)
			args = append(args, *filter.CategoriaID)
			argIndex++
		}
		if filter.ProveedorID != nil {
			query += fmt.Sprintf(" AND s.proveedor_id = $%d", argIndex)
			args = append(args, *filter.ProveedorID)
			argIndex++
		}
	}

	query += " GROUP BY s.id, s.nombre_servicio ORDER BY cantidad_vendida DESC LIMIT 10"

	var resultados []struct {
		ServicioID        string `db:"id"`
		NombreServicio    string `db:"nombre_servicio"`
		CantidadVendida   int    `db:"cantidad_vendida"`
		IngresosGenerados string `db:"ingresos_generados"`
	}

	err := r.DB.Select(&resultados, query, args...)
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
			CantidadVendida:   int32(resultado.CantidadVendida),
			IngresosGenerados: resultado.IngresosGenerados,
		}

		serviciosVendidos = append(serviciosVendidos, servicioVendido)
	}

	return serviciosVendidos, nil
}

// getDistribucionCalificaciones calcula la distribución de calificaciones para un servicio
func (r *queryResolver) getDistribucionCalificaciones(ctx context.Context, servicioID string) ([]*model.DistribucionCalificacion, error) {
	query := `
        SELECT
            puntuacion,
            COUNT(*) as cantidad
        FROM api_rest_calificacion
        WHERE servicio_id = $1
        GROUP BY puntuacion
        ORDER BY puntuacion
    `

	var resultados []struct {
		Puntuacion int `db:"puntuacion"`
		Cantidad   int `db:"cantidad"`
	}

	err := r.DB.Select(&resultados, query, servicioID)
	if err != nil {
		return nil, err
	}

	total := 0
	for _, resultado := range resultados {
		total += resultado.Cantidad
	}

	var distribucion []*model.DistribucionCalificacion
	for _, resultado := range resultados {
		var porcentaje float64
		if total > 0 {
			porcentaje = float64(resultado.Cantidad) / float64(total) * 100
		}

		dist := &model.DistribucionCalificacion{
			Puntuacion: int32(resultado.Puntuacion),
			Cantidad:   int32(resultado.Cantidad),
			Porcentaje: porcentaje,
		}

		distribucion = append(distribucion, dist)
	}

	return distribucion, nil
}
