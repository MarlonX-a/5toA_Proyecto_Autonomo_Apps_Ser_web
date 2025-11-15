package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"github.com/jmoiron/sqlx"
)

// Resolvers para el backend
type Resolver struct {
	DB         *sqlx.DB
	RESTClient RestClient
}
