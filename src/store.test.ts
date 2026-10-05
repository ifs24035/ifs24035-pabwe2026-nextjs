import { describe, it, expect } from "vitest";
import store from "./store";
import { setIsAuthLoginActionCreator } from "./features/auth/states/action";
import { setIsPostLikedActionCreator } from "./features/posts/states/action";

describe("Redux store configuration", () => {
  it("should contain all expected reducer keys", () => {
    const state = store.getState();

    // Auth
    expect(state).toHaveProperty("isAuthLogin");
    expect(state).toHaveProperty("isAuthRegister");
    expect(state).toHaveProperty("isAuthLogout");

    // Users
    expect(state).toHaveProperty("users");
    expect(state).toHaveProperty("user");
    expect(state).toHaveProperty("profile");
    expect(state).toHaveProperty("isProfile");
    expect(state).toHaveProperty("isChangeProfile");
    expect(state).toHaveProperty("isChangeProfilePhoto");
    expect(state).toHaveProperty("isChangeProfilePassword");

    // Posts
    expect(state).toHaveProperty("posts");
    expect(state).toHaveProperty("post");
    expect(state).toHaveProperty("isPost");
    expect(state).toHaveProperty("isPostAdd");
    expect(state).toHaveProperty("isPostAdded");
    expect(state).toHaveProperty("isPostChange");
    expect(state).toHaveProperty("isPostChanged");
    expect(state).toHaveProperty("isPostChangeCover");
    expect(state).toHaveProperty("isPostChangedCover");
    expect(state).toHaveProperty("isPostDelete");
    expect(state).toHaveProperty("isPostDeleted");
    expect(state).toHaveProperty("isPostLike");
    expect(state).toHaveProperty("isPostLiked");
    expect(state).toHaveProperty("isPostAddComment");
    expect(state).toHaveProperty("isPostAddedComment");
    expect(state).toHaveProperty("isPostDeleteComment");
    expect(state).toHaveProperty("isPostDeletedComment");
    expect(state).toHaveProperty("isPostDeleteAll");
    expect(state).toHaveProperty("isPostDeletedAll");
  });

  it("should dispatch actions across different feature slices", () => {
    store.dispatch(setIsAuthLoginActionCreator(true));
    expect(store.getState().isAuthLogin).toBe(true);

    store.dispatch(setIsPostLikedActionCreator(true));
    expect(store.getState().isPostLiked).toBe(true);
  });
});
