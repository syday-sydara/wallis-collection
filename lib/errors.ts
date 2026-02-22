export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Unexpected error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}