import { describe, it, expect, vi } from "vitest";
import type { NextRequest } from "next/server";
import { middleware } from "./middleware";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: URL) => ({ type: "redirect", url })),
  next: vi.fn(() => ({ type: "next" })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => mocks.redirect(url),
    next: () => mocks.next(),
  },
}));

function makeRequest(cookieValue?: string) {
  return {
    url: "https://example.com/",
    cookies: {
      get: (name: string) =>
        cookieValue === undefined ? undefined : { name, value: cookieValue },
    },
  } as unknown as NextRequest;
}

describe("middleware", () => {
  it("should redirect to the login page when the session cookie is missing", () => {
    mocks.redirect.mockClear();
    middleware(makeRequest(undefined));

    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect.mock.calls[0][0].pathname).toBe("/auth/login");
  });

  it("should redirect when the session cookie holds another value", () => {
    mocks.redirect.mockClear();
    middleware(makeRequest("0"));

    expect(mocks.redirect).toHaveBeenCalledTimes(1);
  });

  it("should continue to the dashboard when the session cookie is set", () => {
    mocks.redirect.mockClear();
    mocks.next.mockClear();
    middleware(makeRequest("1"));

    expect(mocks.next).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
