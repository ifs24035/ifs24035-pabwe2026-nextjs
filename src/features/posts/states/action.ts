import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import postApi from "../api/postApi";

export const ActionType = {
  SET_POSTS: "SET_POSTS",
  SET_POST: "SET_POST",
  SET_IS_POST: "SET_IS_POST",

  SET_IS_POST_ADD: "SET_IS_POST_ADD",
  SET_IS_POST_ADDED: "SET_IS_POST_ADDED",

  SET_IS_POST_CHANGE: "SET_IS_POST_CHANGE",
  SET_IS_POST_CHANGED: "SET_IS_POST_CHANGED",

  SET_IS_POST_CHANGE_COVER: "SET_IS_POST_CHANGE_COVER",
  SET_IS_POST_CHANGED_COVER: "SET_IS_POST_CHANGED_COVER",

  SET_IS_POST_DELETE: "SET_IS_POST_DELETE",
  SET_IS_POST_DELETED: "SET_IS_POST_DELETED",

  SET_IS_POST_LIKE: "SET_IS_POST_LIKE",
  SET_IS_POST_LIKED: "SET_IS_POST_LIKED",

  SET_IS_POST_ADD_COMMENT: "SET_IS_POST_ADD_COMMENT",
  SET_IS_POST_ADDED_COMMENT: "SET_IS_POST_ADDED_COMMENT",

  SET_IS_POST_DELETE_COMMENT: "SET_IS_POST_DELETE_COMMENT",
  SET_IS_POST_DELETED_COMMENT: "SET_IS_POST_DELETED_COMMENT",

  SET_IS_POST_DELETE_ALL: "SET_IS_POST_DELETE_ALL",
  SET_IS_POST_DELETED_ALL: "SET_IS_POST_DELETED_ALL",
};

/* ------------------------------------------------------------------ */
/* Koleksi postingan                                                   */
/* ------------------------------------------------------------------ */

export function setPostsActionCreator(posts) {
  return {
    type: ActionType.SET_POSTS,
    payload: posts,
  };
}

export function asyncSetPosts(is_me = "") {
  return async (dispatch) => {
    try {
      const posts = await postApi.getPosts(is_me);
      dispatch(setPostsActionCreator(posts));
    } catch {
      dispatch(setPostsActionCreator([]));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Rincian postingan                                                   */
/* ------------------------------------------------------------------ */

export function setPostActionCreator(post) {
  return {
    type: ActionType.SET_POST,
    payload: post,
  };
}

export function setIsPostActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST,
    payload: status,
  };
}

export function asyncSetPost(postId) {
  return async (dispatch) => {
    try {
      const post = await postApi.getPostById(postId);
      dispatch(setPostActionCreator(post));
    } catch {
      dispatch(setPostActionCreator(null));
    } finally {
      dispatch(setIsPostActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Tambah postingan                                                    */
/* ------------------------------------------------------------------ */

export function setIsPostAddActionCreator(isPostAdd) {
  return {
    type: ActionType.SET_IS_POST_ADD,
    payload: isPostAdd,
  };
}

export function setIsPostAddedActionCreator(isPostAdded) {
  return {
    type: ActionType.SET_IS_POST_ADDED,
    payload: isPostAdded,
  };
}

export function asyncSetIsPostAdd(description) {
  return async (dispatch) => {
    try {
      await postApi.postPost(description);
      showSuccessDialog("Postingan berhasil dipublikasikan!");
      dispatch(setIsPostAddedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostAddedActionCreator(false));
    } finally {
      dispatch(setIsPostAddActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Ubah postingan                                                      */
/* ------------------------------------------------------------------ */

export function setIsPostChangeActionCreator(isPostChange) {
  return {
    type: ActionType.SET_IS_POST_CHANGE,
    payload: isPostChange,
  };
}

export function setIsPostChangedActionCreator(isPostChanged) {
  return {
    type: ActionType.SET_IS_POST_CHANGED,
    payload: isPostChanged,
  };
}

export function asyncSetIsPostChange(postId, description) {
  return async (dispatch) => {
    try {
      const message = await postApi.putPost(postId, description);
      showSuccessDialog(message || "Postingan berhasil diperbarui!");
      dispatch(setIsPostChangedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostChangedActionCreator(false));
    } finally {
      dispatch(setIsPostChangeActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Ganti cover postingan                                               */
/* ------------------------------------------------------------------ */

export function setIsPostChangeCoverActionCreator(isPostChangeCover) {
  return {
    type: ActionType.SET_IS_POST_CHANGE_COVER,
    payload: isPostChangeCover,
  };
}

export function setIsPostChangedCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_POST_CHANGED_COVER,
    payload: status,
  };
}

export function asyncSetIsPostChangeCover(postId, cover) {
  return async (dispatch) => {
    try {
      const message = await postApi.postPostCover(postId, cover);
      showSuccessDialog(message || "Cover postingan berhasil diperbarui!");
      dispatch(setIsPostChangedCoverActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostChangedCoverActionCreator(false));
    } finally {
      dispatch(setIsPostChangeCoverActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Hapus postingan                                                     */
/* ------------------------------------------------------------------ */

export function setIsPostDeleteActionCreator(isPostDelete) {
  return {
    type: ActionType.SET_IS_POST_DELETE,
    payload: isPostDelete,
  };
}

export function setIsPostDeletedActionCreator(isPostDeleted) {
  return {
    type: ActionType.SET_IS_POST_DELETED,
    payload: isPostDeleted,
  };
}

export function asyncSetIsPostDelete(postId) {
  return async (dispatch) => {
    try {
      const message = await postApi.deletePost(postId);
      showSuccessDialog(message || "Postingan berhasil dihapus!");
      dispatch(setIsPostDeletedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Suka / batal suka                                                   */
/* ------------------------------------------------------------------ */

export function setIsPostLikeActionCreator(isPostLike) {
  return {
    type: ActionType.SET_IS_POST_LIKE,
    payload: isPostLike,
  };
}

export function setIsPostLikedActionCreator(isPostLiked) {
  return {
    type: ActionType.SET_IS_POST_LIKED,
    payload: isPostLiked,
  };
}

export function asyncSetIsPostLike(postId, like) {
  return async (dispatch) => {
    try {
      await postApi.postPostLike(postId, like);
      dispatch(setIsPostLikedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostLikedActionCreator(false));
    } finally {
      dispatch(setIsPostLikeActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Tambah komentar                                                     */
/* ------------------------------------------------------------------ */

export function setIsPostAddCommentActionCreator(isPostAddComment) {
  return {
    type: ActionType.SET_IS_POST_ADD_COMMENT,
    payload: isPostAddComment,
  };
}

export function setIsPostAddedCommentActionCreator(isPostAddedComment) {
  return {
    type: ActionType.SET_IS_POST_ADDED_COMMENT,
    payload: isPostAddedComment,
  };
}

export function asyncSetIsPostAddComment(postId, comment) {
  return async (dispatch) => {
    try {
      const message = await postApi.postPostComment(postId, comment);
      showSuccessDialog(message || "Komentar berhasil dikirim!");
      dispatch(setIsPostAddedCommentActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostAddedCommentActionCreator(false));
    } finally {
      dispatch(setIsPostAddCommentActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Hapus komentar                                                      */
/* ------------------------------------------------------------------ */

export function setIsPostDeleteCommentActionCreator(isPostDeleteComment) {
  return {
    type: ActionType.SET_IS_POST_DELETE_COMMENT,
    payload: isPostDeleteComment,
  };
}

export function setIsPostDeletedCommentActionCreator(isPostDeletedComment) {
  return {
    type: ActionType.SET_IS_POST_DELETED_COMMENT,
    payload: isPostDeletedComment,
  };
}

export function asyncSetIsPostDeleteComment(postId) {
  return async (dispatch) => {
    try {
      const message = await postApi.deletePostComment(postId);
      showSuccessDialog(message || "Komentar berhasil dihapus!");
      dispatch(setIsPostDeletedCommentActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedCommentActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteCommentActionCreator(true));
    }
  };
}

/* ------------------------------------------------------------------ */
/* Hapus seluruh postingan milik pengguna                              */
/* ------------------------------------------------------------------ */

export function setIsPostDeleteAllActionCreator(isPostDeleteAll) {
  return {
    type: ActionType.SET_IS_POST_DELETE_ALL,
    payload: isPostDeleteAll,
  };
}

export function setIsPostDeletedAllActionCreator(isPostDeletedAll) {
  return {
    type: ActionType.SET_IS_POST_DELETED_ALL,
    payload: isPostDeletedAll,
  };
}

export function asyncSetIsPostDeleteAll() {
  return async (dispatch) => {
    try {
      const message = await postApi.deleteAllPosts();
      showSuccessDialog(message || "Semua postingan berhasil dihapus!");
      dispatch(setIsPostDeletedAllActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsPostDeletedAllActionCreator(false));
    } finally {
      dispatch(setIsPostDeleteAllActionCreator(true));
    }
  };
}
