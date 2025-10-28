package graph

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"log"
)

var DB *sqlx.DB

func ConnectDB() {
	dsn := "host=localhost port=5432 user=postgres password=123456 dbname=findyourwork sslmode=disable"
	var err error
	DB, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalf("Error conectando a la base de datos: %v", err)
	}
	log.Println("Conexión a PostgreSQL exitosa")
}
