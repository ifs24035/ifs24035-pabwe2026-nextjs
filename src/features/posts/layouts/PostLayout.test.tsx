import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import PostLayout from "./PostLayout";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import * as userAction from "../../users/states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe("PostLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(userAction, "asyncSetProfile").mockReturnValue(() => Promise.resolve());
  });

  it("should redirect to login when access token is missing", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: null } }
    );

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
    expect(screen.getByText("Memuat sesi pengguna...")).toBeInTheDocument();
  });

  it("should load profile when access token exists and not redirect", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(
      <PostLayout>
        <div>Konten Dashboard</div>
      </PostLayout>,
      { preloadedState: { profile: null } }
    );

    expect(mockPush).not.toHaveBeenCalledWith("/auth/login");
  });

  it("should render navbar, sidebar and children when profile exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(
      <PostLayout>
        <div>Konten Dashboard</div>
      </PostLayout>,
      {
        preloadedState: {
          profile: { id: 1, name: "Test User", email: "test@delcom.org" },
        },
      }
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Konten Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Semua Postingan")).toBeInTheDocument();
  });

  it("should toggle and close the mobile sidebar from navbar", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: { id: 1, name: "Test User" } } }
    );

    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should logout through the navbar dropdown", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: { id: 1, name: "Test User" } } }
    );

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-logout-button"));

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should keep the session when isProfile finished with an existing profile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: { id: 1, name: "Logged User" }, isProfile: true } }
    );

    expect(screen.getByText("Logged User")).toBeInTheDocument();
  });

  it("should clear token and redirect when isProfile finished without profile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: null, isProfile: true } }
    );

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(
      <PostLayout>
        <div>Konten</div>
      </PostLayout>,
      { preloadedState: { profile: { id: 1, name: "Logged User" }, isAuthLogout: true } }
    );

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
