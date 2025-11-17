export const QUERY_SERVICIOS = `
  query Servicios($filter: ServicioFilterInput, $pagination: Pagination) {
    servicios(filter: $filter, pagination: $pagination) {
      id
      nombreServicio
      descripcion
      duracion
      ratingPromedio
      precio
      categoria { id nombre }
      proveedor { id user { username } }
    }
  }
`;

export const QUERY_RESERVAS = `
  query Reservas($filter: ReservaFilterInput, $pagination: Pagination) {
    reservas(filter: $filter, pagination: $pagination) {
      id
      fecha
      hora
      estado
      totalEstimado
    }
  }
`;

export const QUERY_CATEGORIAS = `
  query Categorias($pagination: Pagination) {
    categorias(pagination: $pagination) {
      id
      nombre
      descripcion
    }
  }
`;



