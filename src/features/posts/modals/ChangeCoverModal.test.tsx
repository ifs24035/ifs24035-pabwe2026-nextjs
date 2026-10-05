import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeCoverModal from "./ChangeCoverModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("ChangeCoverModal", () => {
  const mockPost = { id: 1, cover: null };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal show={false} onClose={vi.fn()} post={mockPost} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should not render when post is missing", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} post={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should validate file presence, type, and size", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<ChangeCoverModal show={true} onClose={vi.fn()} post={mockPost} />);

    const fileInput = screen.getByTestId("cover-file-input");
    const form = fileInput.closest("form");

    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Pilih file cover terlebih dahulu!");

    fireEvent.change(fileInput, { target: { files: [] } });

    const badFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [badFile] } });
    expect(errorSpy).toHaveBeenCalledWith(
      "Hanya file JPEG, JPG, atau PNG yang diperbolehkan!"
    );

    const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file terlalu besar. Maksimal 1MB!");
  });

  it("should preview the selected image and dispatch the upload", () => {
    const uploadSpy = vi
      .spyOn(postAction, "asyncSetIsPostChangeCover")
      .mockReturnValue(() => {});

    renderWithProviders(<ChangeCoverModal show={true} onClose={vi.fn()} post={mockPost} />, {
      preloadedState: { isPostChangeCover: false, isPostChangedCover: false },
    });

    const fileInput = screen.getByTestId("cover-file-input");
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    fireEvent.submit(fileInput.closest("form"));

    expect(uploadSpy).toHaveBeenCalledWith(1, validFile);
  });

  it("should accept png files as well", () => {
    const uploadSpy = vi
      .spyOn(postAction, "asyncSetIsPostChangeCover")
      .mockReturnValue(() => {});

    renderWithProviders(<ChangeCoverModal show={true} onClose={vi.fn()} post={mockPost} />);

    const fileInput = screen.getByTestId("cover-file-input");
    const pngFile = new File(["dummy"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [pngFile] } });
    fireEvent.submit(fileInput.closest("form"));

    expect(uploadSpy).toHaveBeenCalledWith(1, pngFile);
  });

  it("should refresh the post, close modal, and notify parent on success", () => {
    const onClose = vi.fn();
    const onCoverChanged = vi.fn();
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(
      <ChangeCoverModal
        show={true}
        onClose={onClose}
        post={mockPost}
        onCoverChanged={onCoverChanged}
      />,
      { preloadedState: { isPostChangeCover: true, isPostChangedCover: true } }
    );

    expect(fetchSpy).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
    expect(onCoverChanged).toHaveBeenCalled();
  });

  it("should skip post refresh when post id is unavailable", () => {
    const onClose = vi.fn();
    const fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} post={null} />,
      { preloadedState: { isPostChangeCover: true, isPostChangedCover: true } }
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should keep modal open when upload finished without success", () => {
    const onClose = vi.fn();

    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} post={mockPost} />,
      { preloadedState: { isPostChangeCover: true, isPostChangedCover: false } }
    );

    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should not fail when onCoverChanged callback is omitted", () => {
    vi.spyOn(postAction, "asyncSetPost").mockReturnValue(() => {});

    renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} post={mockPost} />,
      { preloadedState: { isPostChangeCover: true, isPostChangedCover: true } }
    );

    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} post={mockPost} />
    );

    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
