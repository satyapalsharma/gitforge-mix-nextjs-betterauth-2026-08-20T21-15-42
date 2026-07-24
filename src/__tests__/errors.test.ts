import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "../lib/errors";

describe("AppError", () => {
  it("should create an error with default status code 500", () => {
    const error = new AppError("Something went wrong");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it("should create an error with custom status code", () => {
    const error = new AppError("Custom error", 422);
    expect(error.statusCode).toBe(422);
  });
});

describe("BadRequestError", () => {
  it("should have status code 400", () => {
    const error = new BadRequestError("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input");
  });
});

describe("UnauthorizedError", () => {
  it("should have status code 401", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });
});

describe("ForbiddenError", () => {
  it("should have status code 403", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });
});

describe("NotFoundError", () => {
  it("should have status code 404", () => {
    const error = new NotFoundError("User not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("User not found");
  });
});

describe("ConflictError", () => {
  it("should have status code 409", () => {
    const error = new ConflictError("Email already exists");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Email already exists");
  });
});

describe("InternalServerError", () => {
  it("should have status code 500", () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
  });
});
