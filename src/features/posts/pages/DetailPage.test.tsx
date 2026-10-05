import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/posts/1",
  useParams: () => ({ postId: "1" }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockPost = {
    id: 1,
    user_id: 1,
    description: "Deskripsi detail postingan",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-10-05T03:07:11.000000Z",
    author: { name: "Abdullah", photo: "https://example.com/avatar.jpg" },
    likes: [1, 2],
    comments: [{ id: 10, comment: "Komentar pengguna lain", created_at: "2024-10-05T03:49:59.000000Z" }],
    my_comment: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => Promise.resolve());
  });

  it("should render loading spinner when profile or post is missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: null, post: null },
    });

    expect(screen.queryByText("Deskripsi detail postingan")).not.toBeInTheDocument();
  });

  it("should render post detail for the owner", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    expect(screen.getByTestId("detail-post-description")).toHaveTextContent(
      "Deskripsi detail postingan"
    );
    expect(screen.getByText("Postingan Anda")).toBeInTheDocument();
    expect(screen.getByTestId("like-count")).toHaveTextContent("2 suka");
    expect(screen.getByText("Komentar (1)")).toBeInTheDocument();
    expect(screen.getByText("Komentar pengguna lain")).toBeInTheDocument();

    // Owner only actions
    expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument();
    expect(screen.getByTestId("edit-detail-post-btn")).toBeInTheDocument();
    expect(screen.getByTestId("delete-detail-post-btn")).toBeInTheDocument();
  });

  it("should hide owner actions for posts of other users", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: { ...mockPost, user_id: 99 },
      },
    });

    expect(screen.getByText("Kontributor")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-cover-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-detail-post-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-detail-post-btn")).not.toBeInTheDocument();
  });

  it("should render fallbacks when cover, author and description are missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: {
          id: 2,
          user_id: 1,
          description: null,
          cover: null,
          author: null,
          likes: [],
          comments: [],
          my_comment: null,
        },
      },
    });

    expect(
      screen.getByText("Tidak ada deskripsi pada postingan ini.")
    ).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByTestId("like-count")).toHaveTextContent("0 suka");
    expect(
      screen.getByText("Belum ada komentar pada postingan ini. Jadilah yang pertama!")
    ).toBeInTheDocument();
  });

  it("should render author initial when author has no photo", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: { ...mockPost, author: { name: "Budi", photo: null } },
      },
    });

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should fall back to likes empty array when likes are missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: { ...mockPost, likes: undefined, comments: undefined },
      },
    });

    expect(screen.getByTestId("like-count")).toHaveTextContent("0 suka");
    expect(screen.getByText("Komentar (0)")).toBeInTheDocument();
  });

  it("should ignore non object comment entries", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: { ...mockPost, comments: [10, null, { id: 11, comment: "Valid" }] },
      },
    });

    expect(screen.getByText("Komentar (1)")).toBeInTheDocument();
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByTestId("comment-item-11")).toBeInTheDocument();
  });

  it("should give a like when the post is not liked yet", () => {
    const likeSpy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: { ...mockPost, likes: [] } },
    });

    expect(screen.getByText("Suka")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("like-post-btn"));

    expect(likeSpy).toHaveBeenCalledWith(1, 1);
  });

  it("should remove a like when the post is already liked", () => {
    const likeSpy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    expect(screen.getByText("Disukai")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("like-post-btn"));

    expect(likeSpy).toHaveBeenCalledWith(1, 0);
  });

  it("should refresh the post after a like completes", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostLike: true,
        isPostLiked: true,
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith("1");
    // sekali saat mount, sekali lagi setelah like berhasil
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should not refresh the post when a like fails", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostLike: true,
        isPostLiked: false,
      },
    });

    // hanya pemanggilan saat mount, tanpa pemuatan ulang
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should show validation error when submitting an empty comment", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    fireEvent.submit(screen.getByTestId("comment-input").closest("form"));

    expect(errorSpy).toHaveBeenCalledWith("Komentar tidak boleh kosong");
  });

  it("should dispatch add comment with trimmed value and show sending state", () => {
    const commentSpy = vi
      .spyOn(postAction, "asyncSetIsPostAddComment")
      .mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    fireEvent.change(screen.getByTestId("comment-input"), {
      target: { value: "  Komentar baru saya  " },
    });
    fireEvent.submit(screen.getByTestId("comment-input").closest("form"));

    expect(commentSpy).toHaveBeenCalledWith(1, "Komentar baru saya");
    expect(screen.getByText("Mengirim...")).toBeInTheDocument();
  });

  it("should refresh the post after a comment is added successfully", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostAddComment: true,
        isPostAddedComment: true,
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith("1");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("comment-input")).toHaveValue("");
  });

  it("should not refresh the post when adding a comment fails", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostAddComment: true,
        isPostAddedComment: false,
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should mark own comment and delete it when confirmed", async () => {
    const deleteCommentSpy = vi
      .spyOn(postAction, "asyncSetIsPostDeleteComment")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: {
          ...mockPost,
          comments: [{ id: 10, comment: "Komentar saya", created_at: "2024-10-05T03:49:59.000000Z" }],
          my_comment: { id: 10, comment: "Komentar saya" },
        },
      },
    });

    expect(screen.getByText("Anda")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("delete-comment-10"));

    await waitFor(() => {
      expect(deleteCommentSpy).toHaveBeenCalledWith(1);
    });
  });

  it("should not delete a comment when the confirmation is cancelled", async () => {
    const deleteCommentSpy = vi
      .spyOn(postAction, "asyncSetIsPostDeleteComment")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: {
          ...mockPost,
          comments: [{ id: 10, comment: "Komentar saya" }],
          my_comment: { id: 10, comment: "Komentar saya" },
        },
      },
    });

    fireEvent.click(screen.getByTestId("delete-comment-10"));

    await waitFor(() => {
      expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    });
    expect(deleteCommentSpy).not.toHaveBeenCalled();
  });

  it("should refresh the post after a comment is deleted successfully", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostDeleteComment: true,
        isPostDeletedComment: true,
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith("1");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should not refresh the post when deleting a comment fails", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostDeleteComment: true,
        isPostDeletedComment: false,
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should dispatch delete post when confirmed", async () => {
    const deleteSpy = vi
      .spyOn(postAction, "asyncSetIsPostDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it("should not dispatch delete post when cancelled", async () => {
    const deleteSpy = vi
      .spyOn(postAction, "asyncSetIsPostDelete")
      .mockReturnValue(() => {});
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));

    await waitFor(() => {
      expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    });
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should redirect home when isPost is true but the post is missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: null, isPost: true },
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should stay on page when isPost is true and the post exists", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost, isPost: true },
    });

    expect(screen.getByTestId("detail-post-description")).toBeInTheDocument();
  });

  it("should redirect home when the post is deleted", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost, isPostDeleted: true },
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should open and close the cover and change modals", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, post: mockPost },
    });

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-post-btn"));
    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should render generated alt text when description and author name are missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: {
          ...mockPost,
          description: null,
          author: { photo: "https://example.com/avatar.jpg" },
          comments: [],
        },
      },
    });

    expect(screen.getByAltText("Postingan 1")).toBeInTheDocument();
    expect(screen.getByAltText("Penulis")).toBeInTheDocument();
  });

  it("should fall back to U avatar for own comment without profile name", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: { id: 1, name: null },
        post: {
          ...mockPost,
          comments: [{ id: 10, comment: "Komentar saya" }],
          my_comment: { id: 10, comment: "Komentar saya" },
        },
      },
    });

    expect(screen.getByText("Anda")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should refresh the post when the change modal reports success", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        post: mockPost,
        isPostChange: true,
        isPostChanged: true,
      },
    });

    // sekali saat mount, sekali lagi dari callback onChanged milik modal
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
