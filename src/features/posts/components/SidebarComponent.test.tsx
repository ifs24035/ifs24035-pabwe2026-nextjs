import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

const nav = vi.hoisted(() => ({
  pathname: "/",
  isMe: false,
  searchParamsMissing: false,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () =>
    nav.searchParamsMissing
      ? undefined
      : new URLSearchParams(nav.isMe ? "is_me=1" : ""),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
}));

describe("SidebarComponent", () => {
  beforeEach(() => {
    nav.pathname = "/";
    nav.isMe = false;
    nav.searchParamsMissing = false;
  });

  it("should render all main navigation links", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByText("Semua Postingan")).toBeInTheDocument();
    expect(screen.getByText("Postingan Saya")).toBeInTheDocument();
    expect(screen.getByText("Daftar Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.getByText("Praktikum PABWE 2026")).toBeInTheDocument();
  });

  it("should mark Semua Postingan as active on root path", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByTestId("sidebar-link-semua-postingan")).toHaveClass(
      "bg-indigo-600"
    );
    expect(screen.getByTestId("sidebar-link-postingan-saya")).not.toHaveClass(
      "bg-indigo-600"
    );
  });

  it("should mark Postingan Saya as active when is_me query is present", () => {
    nav.isMe = true;

    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByTestId("sidebar-link-postingan-saya")).toHaveClass(
      "bg-indigo-600"
    );
    expect(screen.getByTestId("sidebar-link-semua-postingan")).not.toHaveClass(
      "bg-indigo-600"
    );
  });

  it("should mark Daftar Pengguna as active on nested users routes", () => {
    nav.pathname = "/users/5";

    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByTestId("sidebar-link-daftar-pengguna")).toHaveClass(
      "bg-indigo-600"
    );
  });

  it("should mark Profil Saya as active on profile route", () => {
    nav.pathname = "/profile";

    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByTestId("sidebar-link-profil-saya")).toHaveClass("bg-indigo-600");
  });

  it("should handle missing search params gracefully", () => {
    nav.searchParamsMissing = true;

    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByTestId("sidebar-link-semua-postingan")).toHaveClass(
      "bg-indigo-600"
    );
  });

  it("should render backdrop and close mobile drawer when clicked", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    const backdrop = screen.getByTestId("sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop);
    expect(onCloseMobile).toHaveBeenCalledTimes(1);
  });

  it("should not render backdrop when drawer is closed", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should call onCloseMobile when a navigation link is clicked", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    fireEvent.click(screen.getByText("Daftar Pengguna"));
    expect(onCloseMobile).toHaveBeenCalledTimes(1);
  });
});
