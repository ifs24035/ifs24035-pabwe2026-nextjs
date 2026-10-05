import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <AddModal show={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should show validation error when description is empty", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form"));

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi postingan tidak boleh kosong");
  });

  it("should dispatch asyncSetIsPostAdd with trimmed description", () => {
    const addSpy = vi
      .spyOn(postAction, "asyncSetIsPostAdd")
      .mockReturnValue(() => {});

    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />, {
      preloadedState: { isPostAdd: false, isPostAdded: false },
    });

    fireEvent.change(screen.getByTestId("add-post-description-input"), {
      target: { value: "  Cerita seru hari ini  " },
    });

    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form"));

    expect(addSpy).toHaveBeenCalledWith("Cerita seru hari ini");
  });

  it("should close modal and notify parent on successful add", () => {
    const onClose = vi.fn();
    const onAdded = vi.fn();

    renderWithProviders(<AddModal show={true} onClose={onClose} onAdded={onAdded} />, {
      preloadedState: { isPostAdd: true, isPostAdded: true },
    });

    expect(onClose).toHaveBeenCalled();
    expect(onAdded).toHaveBeenCalled();
  });

  it("should keep modal open when add finished without success", () => {
    const onClose = vi.fn();

    renderWithProviders(<AddModal show={true} onClose={onClose} />, {
      preloadedState: { isPostAdd: true, isPostAdded: false },
    });

    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should not fail when onAdded callback is omitted", () => {
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />, {
      preloadedState: { isPostAdd: true, isPostAdded: true },
    });

    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
