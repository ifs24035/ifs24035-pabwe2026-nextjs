import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const nav = vi.hoisted(() => ({
  isMe: null as string | null,
  searchParamsMissing: false,
}));
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () =>
    nav.searchParamsMissing
      ? undefined
      : new URLSearchParams(nav.isMe ? `is_me=${nav.isMe}` : ""),
}));

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockPosts = [
    {
      id: 1,
      user_id: 1,
      description: "Postingan pertama saya",
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-10-05T03:07:11.000000Z",
      author: { name: "Abdullah", photo: "https://example.com/avatar.jpg" },
      likes: [1, 2],
      comments: [1, 2, 3],
    },
    {
      id: 2,
      user_id: 2,
      description: "Postingan kedua pengguna lain",
      cover: null,
      created_at: "2024-10-05T03:07:45.000000Z",
      author: { name: "Budi", photo: null },
      likes: [],
      comments: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    nav.isMe = null;
    nav.searchParamsMissing = false;
    // Pengambilan data disimulasikan agar pengujian deterministik (tanpa jaringan).
    vi.spyOn(postAction, "asyncSetPosts").mockReturnValue(() => Promise.resolve());
  });

  it("should render nothing when profile is missing", async () => {
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: null },
    });

    expect(container.firstChild).toBeNull();

    await act(async () => {});
  });

  it("should render loading indicator while fetching", () => {
    vi.spyOn(postAction, "asyncSetPosts").mockImplementation(
      () => () => new Promise(() => {})
    );

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(screen.getByText("Memuat postingan...")).toBeInTheDocument();
  });

  it("should render empty state when there are no posts", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });

    expect(screen.getByText("Linimasa Postingan")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Belum ada postingan yang cocok")).toBeInTheDocument();
    });
  });

  it("should render post cards with stats, covers and ownership actions", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    expect(screen.getByText("Total Postingan")).toBeInTheDocument();
    expect(screen.getByText("Total Suka")).toBeInTheDocument();
    expect(screen.getByText("Total Komentar")).toBeInTheDocument();

    expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();
    expect(screen.getByText("Postingan pertama saya")).toBeInTheDocument();
    expect(screen.getByText("3 komentar")).toBeInTheDocument();

    // Postingan 1 milik pengguna yang sedang masuk
    expect(screen.getByTestId("edit-post-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-post-1")).toBeInTheDocument();

    // Postingan 2 milik pengguna lain
    expect(screen.queryByTestId("edit-post-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-post-2")).not.toBeInTheDocument();

    await act(async () => {});
  });

  it("should handle posts without author, likes, comments and description", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: [{ id: 9, user_id: 5, description: null, cover: null }],
      },
    });

    expect(screen.getByText("Tanpa deskripsi.")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("0 suka")).toBeInTheDocument();
    expect(screen.getByText("0 komentar")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-post-9")).not.toBeInTheDocument();

    await act(async () => {});
  });

  it("should filter posts with live search on description and author", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    await waitFor(() => {
      expect(screen.queryByText("Memuat postingan...")).not.toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("search-post-input");

    fireEvent.change(searchInput, { target: { value: "kedua" } });
    expect(screen.getByText("Postingan kedua pengguna lain")).toBeInTheDocument();
    expect(screen.queryByText("Postingan pertama saya")).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "abdullah" } });
    expect(screen.getByText("Postingan pertama saya")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "tidak-ada-hasil" } });
    expect(screen.getByText("Belum ada postingan yang cocok")).toBeInTheDocument();
  });

  it("should ignore posts without description and author while searching", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: [{ id: 9, user_id: 5, description: null, author: null }],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText("Memuat postingan...")).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("search-post-input"), {
      target: { value: "apapun" },
    });

    expect(screen.getByText("Belum ada postingan yang cocok")).toBeInTheDocument();
  });

  it("should switch tabs and update the query string", async () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("tab-mine-btn"));

    expect(mockReplace).toHaveBeenCalledWith("/?is_me=1");
    expect(
      screen.getByRole("heading", { name: "Postingan Saya" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("1");
    });

    fireEvent.click(screen.getByTestId("tab-all-btn"));

    expect(mockReplace).toHaveBeenCalledWith("/");
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("");
    });
  });

  it("should activate the mine tab from the is_me query string", async () => {
    nav.isMe = "1";
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    await waitFor(() => {
      expect(screen.getByTestId("delete-all-posts-btn")).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith("1");
  });

  it("should handle missing search params gracefully", async () => {
    nav.searchParamsMissing = true;

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    expect(screen.getByText("Linimasa Postingan")).toBeInTheDocument();

    await act(async () => {});
  });

  it("should open and close the add post modal from the quick action button", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("add-post-btn"));
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();

    await act(async () => {});
  });

  it("should open and close the change post modal for owned posts", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("edit-post-1"));
    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();

    await act(async () => {});
  });

  it("should dispatch delete post when confirmed", async () => {
    const deleteSpy = vi
      .spyOn(postAction, "asyncSetIsPostDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("delete-post-1"));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it("should not dispatch delete post when cancelled", async () => {
    const deleteSpy = vi
      .spyOn(postAction, "asyncSetIsPostDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("delete-post-1"));

    await waitFor(() => {
      expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    });
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should dispatch delete all posts when confirmed on mine tab", async () => {
    nav.isMe = "1";
    const deleteAllSpy = vi
      .spyOn(postAction, "asyncSetIsPostDeleteAll")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));

    await waitFor(() => {
      expect(deleteAllSpy).toHaveBeenCalled();
    });
  });

  it("should not dispatch delete all posts when cancelled", async () => {
    nav.isMe = "1";
    const deleteAllSpy = vi
      .spyOn(postAction, "asyncSetIsPostDeleteAll")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: mockPosts },
    });

    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));

    await waitFor(() => {
      expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    });
    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should reload posts when isPostDeleted is true", async () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    await act(async () => {
      renderWithProviders(<HomePage />, {
        preloadedState: {
          profile: mockProfile,
          posts: mockPosts,
          isPostDeleted: true,
        },
      });
    });

    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should reload posts when isPostDeletedAll is true", async () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    await act(async () => {
      renderWithProviders(<HomePage />, {
        preloadedState: {
          profile: mockProfile,
          posts: mockPosts,
          isPostDeletedAll: true,
        },
      });
    });

    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should not update loading state after unmount during initial load", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });
    vi.spyOn(postAction, "asyncSetPosts").mockReturnValue(() => pendingPromise);

    const { unmount } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: [] },
    });
    unmount();
    resolveLoad();
    await pendingPromise;
  });

  it("should render generated alt text when description and author name are missing", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: [
          {
            id: 3,
            user_id: 3,
            description: null,
            cover: "https://example.com/cover3.jpg",
            author: { photo: "https://example.com/avatar3.jpg" },
            likes: [],
            comments: [],
          },
        ],
      },
    });

    expect(screen.getByAltText("Postingan 3")).toBeInTheDocument();
    expect(screen.getByAltText("Penulis")).toBeInTheDocument();

    await act(async () => {});
  });

  it("should fall back to an empty list when posts state is null", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile: mockProfile, posts: null },
    });

    expect(screen.getByText("Total Postingan")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Belum ada postingan yang cocok")).toBeInTheDocument();
    });
  });

  it("should reload the feed when the add modal reports success", async () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: mockPosts,
        isPostAdd: true,
        isPostAdded: true,
      },
    });

    // sekali saat mount, sekali lagi dari callback onAdded milik modal
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("should reload the feed when the change modal reports success", async () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPosts");

    renderWithProviders(<HomePage />, {
      preloadedState: {
        profile: mockProfile,
        posts: mockPosts,
        isPostChange: true,
        isPostChanged: true,
      },
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
