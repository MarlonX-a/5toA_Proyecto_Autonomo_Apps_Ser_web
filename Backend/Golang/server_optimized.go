//go:build optimized
// +build optimized

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph"
)

func main() {
	// Conectar a la base de datos
	graph.ConnectDB()

	// Crear resolver con servicios adicionales
	resolver := &graph.Resolver{
		DB:      graph.DB,
		Cache:   graph.NewCacheService(),
		Metrics: graph.NewMetricsCollector(),
	}

	// Configurar DataLoaders
	resolver.SetupDataLoaders()

	// Crear servidor GraphQL
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	// Middleware de logging
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	// CORS + inyección de request en contexto + logging
	http.Handle("/query", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), "httpRequest", r)
		LoggingMiddleware(srv).ServeHTTP(w, r.WithContext(ctx))
	})))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor GraphQL ejecutándose en puerto %s", port)
	log.Printf("📊 Playground disponible en: http://localhost:%s/", port)
	log.Printf("🔍 Endpoint GraphQL: http://localhost:%s/query", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// LoggingMiddleware para monitoreo de consultas
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Ejecutar el handler
		next.ServeHTTP(w, r)

		duration := time.Since(start)
		log.Printf("📈 Consulta GraphQL ejecutada en %v", duration)
	})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
