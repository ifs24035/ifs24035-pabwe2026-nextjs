"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  asyncSetPost,
  asyncSetIsPostDelete,
  asyncSetIsPostLike,
  asyncSetIsPostAddComment,
  asyncSetIsPostDeleteComment,
  setIsPostActionCreator,
  setIsPostDeleteActionCreator,
  setIsPostLikeActionCreator,
  setIsPostLikedActionCreator,
  setIsPostAddCommentActionCreator,
  setIsPostAddedCommentActionCreator,
  setIsPostDeleteCommentActionCreator,
  setIsPostDeletedCommentActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconHeart,
  IconMessageCircle,
  IconSend,
  IconLoader2,
  IconPhoto,
} from "@tabler/icons-react";

function DetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const profile = useAppSelector((state) => state.profile);
  const post = useAppSelector((state) => state.post);
  const isPost = useAppSelector((state) => state.isPost);
  const isPostDeleted = useAppSelector((state) => state.isPostDeleted);
  const isPostLike = useAppSelector((state) => state.isPostLike);
  const isPostLiked = useAppSelector((state) => state.isPostLiked);
  const isPostAddComment = useAppSelector((state) => state.isPostAddComment);
  const isPostAddedComment = useAppSelector((state) => state.isPostAddedComment);
  const isPostDeleteComment = useAppSelector((state) => state.isPostDeleteComment);
  const isPostDeletedComment = useAppSelector((state) => state.isPostDeletedComment);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [newComment, onNewCommentChange, setNewComment] = useInput("");

  useEffect(() => {
    dispatch(asyncSetPost(postId));
  }, [postId, dispatch]);

  useEffect(() => {
    if (isPost) {
      dispatch(setIsPostActionCreator(false));
      if (!post) {
        router.push("/");
      }
    }
  }, [isPost, post, router, dispatch]);

  useEffect(() => {
    if (isPostDeleted) {
      dispatch(setIsPostDeleteActionCreator(false));
      router.push("/");
    }
  }, [isPostDeleted, router, dispatch]);

  useEffect(() => {
    if (isPostLike) {
      dispatch(setIsPostLikeActionCreator(false));
      if (isPostLiked) {
        dispatch(setIsPostLikedActionCreator(false));
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostLike, isPostLiked, postId, dispatch]);

  useEffect(() => {
    if (isPostAddComment) {
      setSendingComment(false);
      dispatch(setIsPostAddCommentActionCreator(false));
      if (isPostAddedComment) {
        dispatch(setIsPostAddedCommentActionCreator(false));
        setNewComment("");
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostAddComment, isPostAddedComment, postId, dispatch, setNewComment]);

  useEffect(() => {
    if (isPostDeleteComment) {
      dispatch(setIsPostDeleteCommentActionCreator(false));
      if (isPostDeletedComment) {
        dispatch(setIsPostDeletedCommentActionCreator(false));
        dispatch(asyncSetPost(postId));
      }
    }
  }, [isPostDeleteComment, isPostDeletedComment, postId, dispatch]);

  if (!profile || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = profile.id === post.user_id;
  const likes = post.likes || [];
  const isLiked = likes.includes(profile.id);
  const rawComments = post.comments || [];
  const comments = rawComments.filter(
    (comment) => typeof comment === "object" && comment !== null
  );
  const myComment = post.my_comment;

  async function handleDelete() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus postingan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDelete(post.id));
    }
  }

  function handleLike() {
    dispatch(asyncSetIsPostLike(post.id, isLiked ? 0 : 1));
  }

  function handleSubmitComment(event) {
    event.preventDefault();
    if (!newComment.trim()) {
      showErrorDialog("Komentar tidak boleh kosong");
      return;
    }

    setSendingComment(true);
    dispatch(asyncSetIsPostAddComment(post.id, newComment.trim()));
  }

  async function handleDeleteComment() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus komentar Anda pada postingan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteComment(post.id));
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigasi & aksi pemilik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          data-testid="back-to-posts-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft size={18} />
          Kembali ke Linimasa
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="edit-cover-btn"
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
            >
              <IconPhotoUp size={16} />
              Ubah Cover
            </button>
            <button
              type="button"
              data-testid="edit-detail-post-btn"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
            >
              <IconEdit size={16} />
              Ubah Postingan
            </button>
            <button
              type="button"
              data-testid="delete-detail-post-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
            >
              <IconTrash size={16} />
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Kartu Utama */}
      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {post.cover ? (
          <div className="relative w-full h-64 sm:h-96 bg-slate-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt={post.description || `Postingan ${post.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/85 backdrop-blur-sm text-slate-700 border border-white/60">
              #{post.id}
            </span>
          </div>
        ) : (
          <div className="relative w-full h-40 bg-gradient-to-br from-indigo-100 via-slate-100 to-cyan-100 flex items-center justify-center text-indigo-300">
            <IconPhoto size={48} stroke={1.6} />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Profil pembuat */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {post.author?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.photo}
                  alt={post.author?.name || "Penulis"}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                  {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {post.author?.name || "Pengguna"}
                </p>
                <p className="text-[11px] font-medium text-indigo-600">
                  {isOwner ? "Postingan Anda" : "Kontributor"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <IconCalendar size={14} className="shrink-0" />
              <span>
                Dipublikasikan{" "}
                <strong className="text-slate-500">{formatDate(post.created_at)}</strong>
              </span>
            </div>
          </div>

          {/* Deskripsi */}
          <div
            data-testid="detail-post-description"
            className="text-slate-700 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed"
          >
            {post.description || "Tidak ada deskripsi pada postingan ini."}
          </div>

          {/* Interaksi */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              data-testid="like-post-btn"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isLiked
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25 hover:bg-rose-600"
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70"
              }`}
            >
              <IconHeart size={18} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? "Disukai" : "Suka"}
            </button>

            <span
              data-testid="like-count"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600"
            >
              <IconHeart size={15} className="text-rose-500" />
              {likes.length} suka
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600">
              <IconMessageCircle size={15} className="text-sky-500" />
              {comments.length} komentar
            </span>
          </div>
        </div>
      </article>

      {/* Komentar */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <IconMessageCircle size={20} className="text-sky-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Komentar ({comments.length})
          </h2>
        </div>

        {/* Formulir komentar */}
        <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="comment-input"
            name="comment"
            autoComplete="off"
            aria-label="Tulis komentar"
            data-testid="comment-input"
            value={newComment}
            onChange={onNewCommentChange}
            placeholder="Tuliskan komentar Anda..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
          />
          <button
            type="submit"
            data-testid="submit-comment-btn"
            disabled={sendingComment}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {sendingComment ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <IconSend size={18} stroke={2.5} />
                <span>Kirim</span>
              </>
            )}
          </button>
        </form>

        {/* Daftar komentar */}
        {comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600">
            Belum ada komentar pada postingan ini. Jadilah yang pertama!
          </div>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const isMine = myComment?.id === comment.id;

              return (
                <li
                  key={`comment-${comment.id}`}
                  data-testid={`comment-item-${comment.id}`}
                  className={`flex gap-3 p-4 rounded-2xl border ${
                    isMine
                      ? "bg-indigo-50/60 border-indigo-100"
                      : "bg-slate-50/70 border-slate-100"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {isMine
                      ? profile.name?.charAt(0)?.toUpperCase() || "U"
                      : "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-700">
                        {isMine ? profile.name : "Pengguna Lain"}
                      </p>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 break-words">
                      {comment.comment}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1.5">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {isMine && (
                    <button
                      type="button"
                      data-testid={`delete-comment-${comment.id}`}
                      onClick={handleDeleteComment}
                      className="self-start p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Komentar"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modals */}
      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        post={post}
      />

      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        postId={post.id}
        onChanged={() => dispatch(asyncSetPost(post.id))}
      />
    </div>
  );
}

export default DetailPage;
