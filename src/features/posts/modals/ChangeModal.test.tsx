import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("ChangeModal", () => {
  const mockPost = { id: 1, description: "Deskripsi lama" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeModal show={false} onClose={vi.fn()} postId={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should fetch the post when modal opens with postId", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={7} />);

    expect(fetchSpy).toHaveBeenCalledWith(7);
  });

  it("should not fetch the post when there is no postId", () => {
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={null} />);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should prefill textarea from post state and fall back to empty string", () => {
    const { rerender } = renderWithProviders(
      <ChangeModal show={true} onClose={vi.fn()} postId={1} />,
      { preloadedState: { post: mockPost } }
    );

    expect(screen.getByTestId("edit-post-description-input")).toHaveValue(
      "Deskripsi lama"
    );

    rerender(<ChangeModal show={false} onClose={vi.fn()} postId={1} />);
    rerender(<ChangeModal show={true} onClose={vi.fn()} postId={1} />);
    expect(screen.getByTestId("edit-post-description-input")).toHaveValue(
      "Deskripsi lama"
    );
  });

  it("should prefill empty string when post has no description", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={1} />, {
      preloadedState: { post: { id: 1, description: null } },
    });

    expect(screen.getByTestId("edit-post-description-input")).toHaveValue("");
  });

  it("should show validation error when description is empty", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={1} />, {
      preloadedState: { post: { id: 1, description: "" } },
    });

    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form"));

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi postingan tidak boleh kosong");
  });

  it("should dispatch asyncSetIsPostChange with trimmed description", () => {
    const changeSpy = vi
      .spyOn(postAction, "asyncSetIsPostChange")
      .mockReturnValue(() => {});

    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={3} />, {
      preloadedState: { post: { id: 3, description: "Lama" } },
    });

    fireEvent.change(screen.getByTestId("edit-post-description-input"), {
      target: { value: "  Deskripsi baru  " },
    });

    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form"));

    expect(changeSpy).toHaveBeenCalledWith(3, "Deskripsi baru");
  });

  it("should close modal and notify parent after successful update", () => {
    const onClose = vi.fn();
    const onChanged = vi.fn();

    renderWithProviders(
      <ChangeModal show={true} onClose={onClose} postId={1} onChanged={onChanged} />,
      { preloadedState: { isPostChange: true, isPostChanged: true } }
    );

    expect(onClose).toHaveBeenCalled();
    expect(onChanged).toHaveBeenCalled();
  });

  it("should keep modal open when update finished without success", () => {
    const onClose = vi.fn();

    renderWithProviders(<ChangeModal show={true} onClose={onClose} postId={1} />, {
      preloadedState: { isPostChange: true, isPostChanged: false },
    });

    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should not fail when onChanged callback is omitted", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} postId={1} />, {
      preloadedState: { isPostChange: true, isPostChanged: true },
    });

    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={onClose} postId={1} />);

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
