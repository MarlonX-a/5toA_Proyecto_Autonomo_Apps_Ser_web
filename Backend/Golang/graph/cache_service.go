package graph

import (
	"context"
	"sync"
	"time"
)

// CacheService proporciona funcionalidad de caché en memoria
type CacheService struct {
	cache map[string]CacheItem
	mutex sync.RWMutex
}

// CacheItem representa un elemento en el caché
type CacheItem struct {
	Value     interface{}
	ExpiresAt time.Time
}

// NewCacheService crea una nueva instancia del servicio de caché
func NewCacheService() *CacheService {
	return &CacheService{
		cache: make(map[string]CacheItem),
	}
}

// Get obtiene un valor del caché
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

// Set almacena un valor en el caché
func (c *CacheService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.cache[key] = CacheItem{
		Value:     value,
		ExpiresAt: time.Now().Add(ttl),
	}
}

// Delete elimina un valor del caché
func (c *CacheService) Delete(ctx context.Context, key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	delete(c.cache, key)
}

// Clear limpia todo el caché
func (c *CacheService) Clear(ctx context.Context) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.cache = make(map[string]CacheItem)
}

// DataLoader para optimizar consultas N+1
type DataLoader struct {
	cache    map[string]interface{}
	mutex    sync.RWMutex
	loadFunc func(context.Context, []string) (map[string]interface{}, error)
	ttl      time.Duration
}

// NewDataLoader crea una nueva instancia de DataLoader
func NewDataLoader(loadFunc func(context.Context, []string) (map[string]interface{}, error), ttl time.Duration) *DataLoader {
	return &DataLoader{
		cache:    make(map[string]interface{}),
		loadFunc: loadFunc,
		ttl:      ttl,
	}
}

// Load carga un valor usando el DataLoader
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

// LoadMany carga múltiples valores usando el DataLoader
func (dl *DataLoader) LoadMany(ctx context.Context, keys []string) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	var keysToLoad []string
	
	dl.mutex.RLock()
	for _, key := range keys {
		if value, exists := dl.cache[key]; exists {
			result[key] = value
		} else {
			keysToLoad = append(keysToLoad, key)
		}
	}
	dl.mutex.RUnlock()
	
	if len(keysToLoad) > 0 {
		dl.mutex.Lock()
		values, err := dl.loadFunc(ctx, keysToLoad)
		if err != nil {
			dl.mutex.Unlock()
			return nil, err
		}
		
		for key, value := range values {
			dl.cache[key] = value
			result[key] = value
		}
		dl.mutex.Unlock()
	}
	
	return result, nil
}

// Middleware de logging para monitoreo
func LoggingMiddleware(next func(context.Context) (interface{}, error)) func(context.Context) (interface{}, error) {
	return func(ctx context.Context) (interface{}, error) {
		start := time.Now()
		
		result, err := next(ctx)
		
		_ = time.Since(start) // Usar la variable duration
		
		// Aquí podrías usar un logger más sofisticado
		if err != nil {
			// log.Printf("Query error: %v, duration: %v", err, duration)
		} else {
			// log.Printf("Query executed successfully in %v", duration)
		}
		
		return result, err
	}
}

// Métricas de rendimiento
type QueryMetrics struct {
	QueryName string
	Duration  time.Duration
	Error     error
	Timestamp time.Time
}

// MetricsCollector recopila métricas de consultas
type MetricsCollector struct {
	metrics []QueryMetrics
	mutex   sync.RWMutex
}

// NewMetricsCollector crea un nuevo colector de métricas
func NewMetricsCollector() *MetricsCollector {
	return &MetricsCollector{
		metrics: make([]QueryMetrics, 0),
	}
}

// Record registra una métrica
func (mc *MetricsCollector) Record(queryName string, duration time.Duration, err error) {
	mc.mutex.Lock()
	defer mc.mutex.Unlock()
	
	mc.metrics = append(mc.metrics, QueryMetrics{
		QueryName: queryName,
		Duration:  duration,
		Error:     err,
		Timestamp: time.Now(),
	})
	
	// Mantener solo las últimas 1000 métricas
	if len(mc.metrics) > 1000 {
		mc.metrics = mc.metrics[len(mc.metrics)-1000:]
	}
}

// GetMetrics obtiene las métricas registradas
func (mc *MetricsCollector) GetMetrics() []QueryMetrics {
	mc.mutex.RLock()
	defer mc.mutex.RUnlock()
	
	// Retornar una copia para evitar condiciones de carrera
	result := make([]QueryMetrics, len(mc.metrics))
	copy(result, mc.metrics)
	
	return result
}

// GetAverageDuration calcula la duración promedio de las consultas
func (mc *MetricsCollector) GetAverageDuration() time.Duration {
	mc.mutex.RLock()
	defer mc.mutex.RUnlock()
	
	if len(mc.metrics) == 0 {
		return 0
	}
	
	var total time.Duration
	for _, metric := range mc.metrics {
		total += metric.Duration
	}
	
	return total / time.Duration(len(mc.metrics))
}

// GetErrorRate calcula la tasa de errores
func (mc *MetricsCollector) GetErrorRate() float64 {
	mc.mutex.RLock()
	defer mc.mutex.RUnlock()
	
	if len(mc.metrics) == 0 {
		return 0
	}
	
	errorCount := 0
	for _, metric := range mc.metrics {
		if metric.Error != nil {
			errorCount++
		}
	}
	
	return float64(errorCount) / float64(len(mc.metrics)) * 100
}
