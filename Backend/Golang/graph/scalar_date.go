package graph

import (
	"github.com/99designs/gqlgen/graphql"
	"time"
)

func MarshalDate(t time.Time) graphql.Marshaler {
	return graphql.MarshalString(t.Format("2006-01-02"))
}

func UnmarshalDate(v interface{}) (time.Time, error) {
	str, _ := v.(string)
	return time.Parse("2006-01-02", str)
}
