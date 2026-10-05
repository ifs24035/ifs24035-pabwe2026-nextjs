import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import NavbarComponent from "./NavbarComponent";
import { renderWithProviders } from "../../../test-utils";

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

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render user photo when profile has photo", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah", email: "abdul@del.org", photo: "https://x/p.jpg" }}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    expect(screen.getByAltText("Abdullah")).toBeInTheDocument();
    expect(screen.getByText("Delcom Post")).toBeInTheDocument();
  });

  it("should fall back to initial letter when profile has no photo", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Budi", email: "budi@del.org", photo: null }}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should render default identity when profile is missing", () => {
    renderWithProviders(
      <NavbarComponent
        profile={null}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should toggle dropdown and close it when clicking outside", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah", email: "abdul@del.org" }}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });

  it("should navigate to profile page from dropdown", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah", email: "abdul@del.org" }}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-profile-link"));

    expect(mockPush).toHaveBeenCalledWith("/profile");
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });

  it("should call handleLogout from dropdown", () => {
    const handleLogout = vi.fn();
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah", email: "abdul@del.org" }}
        handleLogout={handleLogout}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-logout-button"));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("should call onToggleSidebar and render the right toggle icon", () => {
    const onToggleSidebar = vi.fn();
    const { rerender } = renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah" }}
        handleLogout={vi.fn()}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={false}
      />
    );

    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);

    rerender(
      <NavbarComponent
        profile={{ name: "Abdullah" }}
        handleLogout={vi.fn()}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={true}
      />
    );

    expect(screen.getByTestId("toggle-sidebar-btn")).toBeInTheDocument();
  });

  it("should keep the dropdown open when clicking inside the menu", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "Abdullah", email: "abdul@del.org" }}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.mouseDown(screen.getByTestId("profile-dropdown-menu"));

    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();
  });
});
