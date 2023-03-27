export abstract class PaginationRequestDTO {
  key?: string;
  offset?: number;
  limit?: number;
  countTotal?: boolean;
  reverse?: boolean;
}

export abstract class PaginationResponseDTO {
  pagination: {
    next_key: string;
    total: string;
  };
}
