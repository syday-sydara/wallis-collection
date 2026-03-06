export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function handleError(error: unknown) {
  // Custom API errors
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    );
  }

  // Prisma errors (optional)
  if (typeof error === "object" && error !== null && "code" in error) {
    return Response.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  // Zod errors (optional)
  if (typeof error === "object" && error !== null && "issues" in error) {
    return Response.json(
      { error: "Invalid input" },
      { status: 422 }
    );
  }

  // Unexpected errors
  console.error("Unexpected error:", error);

  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}