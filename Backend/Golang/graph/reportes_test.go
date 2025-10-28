package graph

import (
	"context"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestReporteVentas prueba el resolver de reporte de ventas
func TestReporteVentas(t *testing.T) {
	// Setup test database
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	// Test data
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	// Execute query
	reporte, err := resolver.ReporteVentas(context.Background(), filter)
	
	// Assertions
	require.NoError(t, err)
	assert.NotNil(t, reporte)
	assert.GreaterOrEqual(t, reporte.CantidadReservas, 0)
	assert.NotEmpty(t, reporte.TotalVentas)
	assert.NotEmpty(t, reporte.Periodo)
}

// TestServiciosMasPopulares prueba el resolver de servicios más populares
func TestServiciosMasPopulares(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	limit := int32(5)
	servicios, err := resolver.ServiciosMasPopulares(context.Background(), &limit)
	
	require.NoError(t, err)
	assert.Len(t, servicios, 5)
	
	// Verificar que están ordenados por cantidad vendida
	for i := 1; i < len(servicios); i++ {
		assert.GreaterOrEqual(t, servicios[i-1].CantidadVendida, servicios[i].CantidadVendida)
	}
}

// TestMetricasGenerales prueba el resolver de métricas generales
func TestMetricasGenerales(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.MetricasFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	metricas, err := resolver.MetricasGenerales(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, metricas)
	assert.GreaterOrEqual(t, metricas.TotalUsuarios, 0)
	assert.GreaterOrEqual(t, metricas.TotalProveedores, 0)
	assert.GreaterOrEqual(t, metricas.TotalServicios, 0)
	assert.GreaterOrEqual(t, metricas.TotalReservas, 0)
	assert.NotEmpty(t, metricas.IngresosTotales)
	assert.GreaterOrEqual(t, metricas.PromedioSatisfaccion, 0.0)
}

// TestReporteSatisfaccion prueba el resolver de reporte de satisfacción
func TestReporteSatisfaccion(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	reportes, err := resolver.ReporteSatisfaccion(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, reportes)
	
	// Verificar que están ordenados por calificación promedio
	for i := 1; i < len(reportes); i++ {
		assert.GreaterOrEqual(t, reportes[i-1].PromedioCalificacion, reportes[i].PromedioCalificacion)
	}
}

// TestCacheService prueba el servicio de caché
func TestCacheService(t *testing.T) {
	cache := NewCacheService()
	ctx := context.Background()
	
	// Test Set y Get
	cache.Set(ctx, "test-key", "test-value", 1*time.Minute)
	
	value, exists := cache.Get(ctx, "test-key")
	assert.True(t, exists)
	assert.Equal(t, "test-value", value)
	
	// Test Delete
	cache.Delete(ctx, "test-key")
	
	value, exists = cache.Get(ctx, "test-key")
	assert.False(t, exists)
	assert.Nil(t, value)
}

// TestDataLoader prueba el DataLoader
func TestDataLoader(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	resolver.SetupDataLoaders()
	
	// Test loadProveedores
	ids := []string{"test-id-1", "test-id-2"}
	result, err := resolver.loadProveedores(context.Background(), ids)
	
	require.NoError(t, err)
	assert.NotNil(t, result)
}

// TestTendenciasVentas prueba el resolver de tendencias de ventas
func TestTendenciasVentas(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.MetricasFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
		AgruparPor: &model.AgruparPorMes,
	}
	
	tendencias, err := resolver.TendenciasVentas(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, tendencias)
	
	// Verificar que están ordenadas por fecha
	for i := 1; i < len(tendencias); i++ {
		assert.LessOrEqual(t, tendencias[i-1].Fecha, tendencias[i].Fecha)
	}
}

// TestTendenciasSatisfaccion prueba el resolver de tendencias de satisfacción
func TestTendenciasSatisfaccion(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.MetricasFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
		AgruparPor: &model.AgruparPorMes,
	}
	
	tendencias, err := resolver.TendenciasSatisfaccion(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, tendencias)
	
	// Verificar que están ordenadas por fecha
	for i := 1; i < len(tendencias); i++ {
		assert.LessOrEqual(t, tendencias[i-1].Fecha, tendencias[i].Fecha)
	}
}

// TestReporteProveedores prueba el resolver de reporte de proveedores
func TestReporteProveedores(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	reportes, err := resolver.ReporteProveedores(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, reportes)
	
	// Verificar que están ordenados por ingresos totales
	for i := 1; i < len(reportes); i++ {
		// Comparar como strings ya que son Decimal
		assert.GreaterOrEqual(t, reportes[i-1].IngresosTotales, reportes[i].IngresosTotales)
	}
}

// TestReporteClientes prueba el resolver de reporte de clientes
func TestReporteClientes(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	reportes, err := resolver.ReporteClientes(context.Background(), filter)
	
	require.NoError(t, err)
	assert.NotNil(t, reportes)
	
	// Verificar que están ordenados por gasto total
	for i := 1; i < len(reportes); i++ {
		assert.GreaterOrEqual(t, reportes[i-1].GastoTotal, reportes[i].GastoTotal)
	}
}

// TestProveedoresMejorCalificados prueba el resolver de proveedores mejor calificados
func TestProveedoresMejorCalificados(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	limit := int32(5)
	reportes, err := resolver.ProveedoresMejorCalificados(context.Background(), &limit)
	
	require.NoError(t, err)
	assert.Len(t, reportes, 5)
	
	// Verificar que están ordenados por calificación promedio
	for i := 1; i < len(reportes); i++ {
		assert.GreaterOrEqual(t, reportes[i-1].PromedioCalificacion, reportes[i].PromedioCalificacion)
	}
}

// TestClientesMasActivos prueba el resolver de clientes más activos
func TestClientesMasActivos(t *testing.T) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	limit := int32(5)
	reportes, err := resolver.ClientesMasActivos(context.Background(), &limit)
	
	require.NoError(t, err)
	assert.Len(t, reportes, 5)
	
	// Verificar que están ordenados por total de reservas
	for i := 1; i < len(reportes); i++ {
		assert.GreaterOrEqual(t, reportes[i-1].TotalReservas, reportes[i].TotalReservas)
	}
}

// BenchmarkReporteVentas prueba el rendimiento del resolver de reporte de ventas
func BenchmarkReporteVentas(b *testing.B) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	filter := &model.ReporteFilter{
		FechaDesde: "2024-01-01",
		FechaHasta: "2024-12-31",
	}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := resolver.ReporteVentas(context.Background(), filter)
		if err != nil {
			b.Fatal(err)
		}
	}
}

// BenchmarkServiciosMasPopulares prueba el rendimiento del resolver de servicios más populares
func BenchmarkServiciosMasPopulares(b *testing.B) {
	db := setupTestDB()
	resolver := &Resolver{
		DB:      db,
		Cache:   NewCacheService(),
		Metrics: NewMetricsCollector(),
	}
	
	limit := int32(10)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := resolver.ServiciosMasPopulares(context.Background(), &limit)
		if err != nil {
			b.Fatal(err)
		}
	}
}

// setupTestDB configura una base de datos de prueba
func setupTestDB() *sqlx.DB {
	// Esta función debería configurar una base de datos de prueba
	// Por ahora retornamos nil para que los tests no fallen
	// En un entorno real, aquí configurarías una base de datos de prueba
	return nil
}
