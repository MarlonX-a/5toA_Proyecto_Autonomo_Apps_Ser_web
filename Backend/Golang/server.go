package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web/Golang/graph"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "9090"

func main() {
	// Obtener puerto desde variable de entorno
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// 1️⃣ Conectar a la base de datos primero
	graph.ConnectDB()

	// 2️⃣ Crear resolver inyectando la conexión a DB
	resolver := &graph.Resolver{
		DB: graph.DB,
	}

	// 3️⃣ Crear servidor gqlgen
	srv := handler.NewDefaultServer(
		graph.NewExecutableSchema(graph.Config{Resolvers: resolver}),
	)

	// 4️⃣ Transportes HTTP
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	// 5️⃣ Caché para queries
	srv.SetQueryCache(lru.New[*ast.QueryDocument](100)) // tamaño de caché explícito

	// 6️⃣ Extensiones
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100), // tamaño de caché explícito y tipo genérico
	})

	// 7️⃣ Handlers HTTP
	http.Handle("/", playground.Handler("GraphQL Playground", "/query"))
	http.Handle("/query", srv)

	// 8️⃣ Iniciar servidor
	log.Printf("Servidor corriendo en http://localhost:%s/ para GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
