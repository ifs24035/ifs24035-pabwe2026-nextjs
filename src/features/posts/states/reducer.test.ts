import { describe, it, expect } from "vitest";
import {
  postsReducer,
  postReducer,
  isPostReducer,
  isPostAddReducer,
  isPostAddedReducer,
  isPostChangeReducer,
  isPostChangedReducer,
  isPostChangeCoverReducer,
  isPostChangedCoverReducer,
  isPostDeleteReducer,
  isPostDeletedReducer,
  isPostLikeReducer,
  isPostLikedReducer,
  isPostAddCommentReducer,
  isPostAddedCommentReducer,
  isPostDeleteCommentReducer,
  isPostDeletedCommentReducer,
  isPostDeleteAllReducer,
  isPostDeletedAllReducer,
} from "./reducer";
import { ActionType } from "./action";

const UNKNOWN_ACTION = { type: "UNKNOWN_ACTION" };

describe("posts reducer", () => {
  it("postsReducer should handle initial state and SET_POSTS", () => {
    expect(postsReducer(undefined, UNKNOWN_ACTION)).toEqual([]);
    expect(postsReducer([{ id: 9 }], UNKNOWN_ACTION)).toEqual([{ id: 9 }]);
    expect(
      postsReducer([], { type: ActionType.SET_POSTS, payload: [{ id: 1 }] })
    ).toEqual([{ id: 1 }]);
  });

  it("postReducer should handle initial state and SET_POST", () => {
    expect(postReducer(undefined, UNKNOWN_ACTION)).toBeNull();
    expect(postReducer({ id: 9 }, UNKNOWN_ACTION)).toEqual({ id: 9 });
    expect(postReducer(null, { type: ActionType.SET_POST, payload: { id: 1 } })).toEqual({
      id: 1,
    });
  });

  it("isPostReducer should handle initial state and SET_IS_POST", () => {
    expect(isPostReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(isPostReducer(false, { type: ActionType.SET_IS_POST, payload: true })).toBe(
      true
    );
  });

  it("isPostAddReducer should handle initial state and SET_IS_POST_ADD", () => {
    expect(isPostAddReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostAddReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostAddReducer(false, { type: ActionType.SET_IS_POST_ADD, payload: true })
    ).toBe(true);
  });

  it("isPostAddedReducer should handle initial state and SET_IS_POST_ADDED", () => {
    expect(isPostAddedReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostAddedReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostAddedReducer(false, { type: ActionType.SET_IS_POST_ADDED, payload: true })
    ).toBe(true);
  });

  it("isPostChangeReducer should handle initial state and SET_IS_POST_CHANGE", () => {
    expect(isPostChangeReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostChangeReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostChangeReducer(false, { type: ActionType.SET_IS_POST_CHANGE, payload: true })
    ).toBe(true);
  });

  it("isPostChangedReducer should handle initial state and SET_IS_POST_CHANGED", () => {
    expect(isPostChangedReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostChangedReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostChangedReducer(false, { type: ActionType.SET_IS_POST_CHANGED, payload: true })
    ).toBe(true);
  });

  it("isPostChangeCoverReducer should handle initial state and SET_IS_POST_CHANGE_COVER", () => {
    expect(isPostChangeCoverReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostChangeCoverReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostChangeCoverReducer(false, {
        type: ActionType.SET_IS_POST_CHANGE_COVER,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostChangedCoverReducer should handle initial state and SET_IS_POST_CHANGED_COVER", () => {
    expect(isPostChangedCoverReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostChangedCoverReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostChangedCoverReducer(false, {
        type: ActionType.SET_IS_POST_CHANGED_COVER,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostDeleteReducer should handle initial state and SET_IS_POST_DELETE", () => {
    expect(isPostDeleteReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeleteReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeleteReducer(false, { type: ActionType.SET_IS_POST_DELETE, payload: true })
    ).toBe(true);
  });

  it("isPostDeletedReducer should handle initial state and SET_IS_POST_DELETED", () => {
    expect(isPostDeletedReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeletedReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeletedReducer(false, { type: ActionType.SET_IS_POST_DELETED, payload: true })
    ).toBe(true);
  });

  it("isPostLikeReducer should handle initial state and SET_IS_POST_LIKE", () => {
    expect(isPostLikeReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostLikeReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostLikeReducer(false, { type: ActionType.SET_IS_POST_LIKE, payload: true })
    ).toBe(true);
  });

  it("isPostLikedReducer should handle initial state and SET_IS_POST_LIKED", () => {
    expect(isPostLikedReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostLikedReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostLikedReducer(false, { type: ActionType.SET_IS_POST_LIKED, payload: true })
    ).toBe(true);
  });

  it("isPostAddCommentReducer should handle initial state and SET_IS_POST_ADD_COMMENT", () => {
    expect(isPostAddCommentReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostAddCommentReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostAddCommentReducer(false, {
        type: ActionType.SET_IS_POST_ADD_COMMENT,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostAddedCommentReducer should handle initial state and SET_IS_POST_ADDED_COMMENT", () => {
    expect(isPostAddedCommentReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostAddedCommentReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostAddedCommentReducer(false, {
        type: ActionType.SET_IS_POST_ADDED_COMMENT,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostDeleteCommentReducer should handle initial state and SET_IS_POST_DELETE_COMMENT", () => {
    expect(isPostDeleteCommentReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeleteCommentReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeleteCommentReducer(false, {
        type: ActionType.SET_IS_POST_DELETE_COMMENT,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostDeletedCommentReducer should handle initial state and SET_IS_POST_DELETED_COMMENT", () => {
    expect(isPostDeletedCommentReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeletedCommentReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeletedCommentReducer(false, {
        type: ActionType.SET_IS_POST_DELETED_COMMENT,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostDeleteAllReducer should handle initial state and SET_IS_POST_DELETE_ALL", () => {
    expect(isPostDeleteAllReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeleteAllReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeleteAllReducer(false, {
        type: ActionType.SET_IS_POST_DELETE_ALL,
        payload: true,
      })
    ).toBe(true);
  });

  it("isPostDeletedAllReducer should handle initial state and SET_IS_POST_DELETED_ALL", () => {
    expect(isPostDeletedAllReducer(undefined, UNKNOWN_ACTION)).toBe(false);
    expect(isPostDeletedAllReducer(true, UNKNOWN_ACTION)).toBe(true);
    expect(
      isPostDeletedAllReducer(false, {
        type: ActionType.SET_IS_POST_DELETED_ALL,
        payload: true,
      })
    ).toBe(true);
  });
});
