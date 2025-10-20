# Guía para Corregir Errores de Linting - Paso a Paso

## Estado Actual
- ✅ Errores de campos de ID en modelos GraphQL: **CORREGIDOS**
- ✅ Errores de tipos de datos (string vs float64): **CORREGIDOS**
- ⚠️ Errores de interfaces de resolver: **PENDIENTES** (43 errores restantes)
- ⚠️ Errores en field resolvers: **PENDIENTES**

## Errores Restantes por Categoría

### 1. Errores en Mutations (14 errores)
**Ubicación**: Líneas 327, 332, 367, 374, 484, 492, 527, 528, 532, 567, 568, 574

**Problema**: Los modelos GraphQL no tienen campos de ID para relaciones.

**Solución**: Usar modelos de base de datos (DB*) para las operaciones de base de datos.

### 2. Errores en Field Resolvers (16 errores)
**Ubicación**: Líneas 1009, 1018, 1023, 1067, 1076, 1081, 1103, 1114, 1182, 1215, 1226, 1237, 1248, 1259, 1270, 1281, 1292

**Problema**: Los objetos GraphQL no tienen campos de ID, sino objetos completos.

**Solución**: Los field resolvers deben usar consultas a la base de datos para obtener los datos relacionados.

### 3. Errores de Interfaces de Resolver (13 errores)
**Ubicación**: Líneas 1346, 1349, 1352, 1355, 1358, 1361, 1364, 1367, 1370, 1373, 1376, 1379

**Problema**: Las interfaces de resolver no están definidas en el código generado.

**Solución**: Estas interfaces se generan automáticamente por gqlgen.

## Plan de Corrección

### Paso 1: Corregir Mutations Restantes
```go
// Patrón para corregir mutations:
func (r *mutationResolver) CreateXxx(ctx context.Context, input model.XxxInput) (*model.Xxx, error) {
    // 1. Usar modelo de base de datos
    dbXxx := DBXxx{
        FieldID: input.FieldID,
        // ... otros campos
    }
    
    // 2. Ejecutar query de inserción
    query := "INSERT INTO table_name (...) VALUES (...) RETURNING id"
    err := r.DB.QueryRow(query, ...).Scan(&dbXxx.ID)
    if err != nil {
        return nil, err
    }
    
    // 3. Convertir a modelo GraphQL
    xxx := &model.Xxx{
        ID: dbXxx.ID,
        // ... campos que existen en el modelo GraphQL
    }
    return xxx, nil
}
```

### Paso 2: Corregir Field Resolvers
```go
// Patrón para corregir field resolvers:
func (r *xxxResolver) FieldName(ctx context.Context, obj *model.Xxx) (*model.Related, error) {
    // Los objetos GraphQL no tienen campos de ID, necesitamos consultar la BD
    var related model.Related
    query := "SELECT * FROM related_table WHERE xxx_id = $1"
    err := r.DB.Get(&related, query, obj.ID)
    if err != nil {
        return nil, err
    }
    return &related, nil
}
```

### Paso 3: Regenerar Código
```bash
# Ejecutar gqlgen para regenerar las interfaces
go run github.com/99designs/gqlgen generate
```

## Mutations que Necesitan Corrección

1. **CreateFotoServicio** (líneas 327, 332)
2. **CreateReserva** (líneas 367, 374)  
3. **CreatePago** (líneas 484, 492)
4. **CreateCalificacion** (líneas 527, 528, 532)
5. **CreateComentario** (líneas 567, 568, 574)

## Field Resolvers que Necesitan Corrección

1. **Cliente.User** (línea 1009)
2. **Cliente.Ubicacion** (líneas 1018, 1023)
3. **Proveedor.User** (línea 1067)
4. **Proveedor.Ubicacion** (líneas 1076, 1081)
5. **Servicio.Proveedor** (línea 1103)
6. **Servicio.Categoria** (línea 1114)
7. **Reserva.Cliente** (línea 1182)
8. **ReservaServicio.Reserva** (línea 1215)
9. **ReservaServicio.Servicio** (línea 1226)
10. **Pago.Reserva** (línea 1237)
11. **Calificacion.Cliente** (línea 1248)
12. **Calificacion.Servicio** (línea 1259)
13. **Comentario.Cliente** (línea 1270)
14. **Comentario.Servicio** (línea 1281)
15. **FotoServicio.Servicio** (línea 1292)

## Comandos Útiles

### Verificar errores específicos
```bash
go build ./graph
```

### Regenerar código GraphQL
```bash
go run github.com/99designs/gqlgen generate
```

### Ejecutar tests
```bash
go test ./graph
```

## Próximos Pasos Recomendados

1. **Corregir mutations restantes** usando el patrón establecido
2. **Corregir field resolvers** para usar consultas a la base de datos
3. **Regenerar código** con gqlgen
4. **Verificar** que no hay errores de compilación
5. **Agregar tests** para los resolvers corregidos

## Notas Importantes

- Los modelos GraphQL generados por gqlgen **NO** tienen campos de ID para relaciones
- Los modelos de base de datos (DB*) **SÍ** tienen campos de ID para relaciones
- Los field resolvers deben hacer consultas a la base de datos para obtener datos relacionados
- Las interfaces de resolver se generan automáticamente por gqlgen



