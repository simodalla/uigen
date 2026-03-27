// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

// Mock server-only (no-op)
vi.mock("server-only", () => ({}));

// Mock cookie store
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets an httpOnly cookie with a valid JWT", async () => {
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name, token, options] = mockCookieStore.set.mock.calls[0];

  expect(name).toBe("auth-token");
  expect(typeof token).toBe("string");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");

  // Verify the token is a valid JWT with the correct payload
  const { payload } = await jwtVerify(token, JWT_SECRET);
  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("test@example.com");
});

test("createSession sets expiry to 7 days in the future", async () => {
  const { createSession } = await import("@/lib/auth");
  const before = Date.now();

  await createSession("user-123", "test@example.com");

  const after = Date.now();
  const [, , options] = mockCookieStore.set.mock.calls[0];
  const expiresTime = new Date(options.expires).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expiresTime).toBeGreaterThanOrEqual(before + sevenDaysMs);
  expect(expiresTime).toBeLessThanOrEqual(after + sevenDaysMs);
});

test("getSession returns payload when a valid token cookie exists", async () => {
  const { createSession, getSession } = await import("@/lib/auth");

  // Create a session to get a valid token
  await createSession("user-456", "hello@example.com");
  const token = mockCookieStore.set.mock.calls[0][1];

  // Mock get to return that token
  mockCookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();

  expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-456");
  expect(session!.email).toBe("hello@example.com");
});

test("getSession returns null when no cookie exists", async () => {
  const { getSession } = await import("@/lib/auth");

  mockCookieStore.get.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for an invalid token", async () => {
  const { getSession } = await import("@/lib/auth");

  mockCookieStore.get.mockReturnValue({ value: "not-a-valid-jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});
