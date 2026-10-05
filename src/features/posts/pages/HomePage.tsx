"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncSetPosts,
  asyncSetIsPostDelete,
  asyncSetIsPostDeleteAll,
  setIsPostDeleteActionCreator,
  setIsPostDeletedAllActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconSearch,
  IconHeart,
  IconMessageCircle,
  IconPhoto,
  IconTrash,
  IconPencil,
  IconEye,
  IconLoader2,
  IconLayoutGrid,
  IconUserStar,
  IconMoodEmpty,
  IconAlertTriangle,
} from "@tabler/icons-react";

function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const profile = useAppSelector((state) => state.profile);
  const posts = useAppSelector((state) => state.posts);
  const isPostDeleted = useAppSelector((state) => state.isPostDeleted);
  const isPostDeletedAll = useAppSelector((state) => state.isPostDeletedAll);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const isMeParam = searchParams?.get("is_me");
  const filter = activeTab === "mine" ? "1" : "";

  // Sinkronkan tab aktif dengan query string (?is_me=1) agar dapat dibagikan.
  useEffect(() => {
    setActiveTab(isMeParam === "1" ? "mine" : "all");
  }, [isMeParam]);

  // Muat ulang daftar postingan setiap filter atau token muat ulang berubah.
  useEffect(() => {
    let isMounted = true;
    setLoadingPosts(true);
    Promise.resolve(dispatch(asyncSetPosts(filter))).finally(() => {
      if (isMounted) setLoadingPosts(false);
    });
    return () => {
      isMounted = false;
    };
  }, [filter, reloadToken, dispatch]);

  useEffect(() => {
    if (isPostDeleted) {
      dispatch(setIsPostDeleteActionCreator(false));
      setReloadToken((prev) => prev + 1);
    }
  }, [isPostDeleted, dispatch]);

  useEffect(() => {
    if (isPostDeletedAll) {
      dispatch(setIsPostDeletedAllActionCreator(false));
      setReloadToken((prev) => prev + 1);
    }
  }, [isPostDeletedAll, dispatch]);

  if (!profile) return null;

  const postList = posts || [];

  const filteredPosts = postList.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const description = post.description ? post.description.toLowerCase() : "";
    const authorName = post.author?.name ? post.author.name.toLowerCase() : "";
    return description.includes(q) || authorName.includes(q);
  });

  const totalPosts = postList.length;
  const totalLikes = postList.reduce(
    (acc, post) => acc + (post.likes ? post.likes.length : 0),
    0
  );
  const totalComments = postList.reduce(
    (acc, post) => acc + (post.comments ? post.comments.length : 0),
    0
  );

  function handleTabChange(tab) {
    setActiveTab(tab);
    router.replace(tab === "mine" ? "/?is_me=1" : "/");
  }

  async function handleDeletePost(postId) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus postingan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDelete(postId));
    }
  }

  async function handleDeleteAllPosts() {
    const result = await showConfirmDialog(
      "Seluruh postingan milik Anda akan dihapus permanen. Lanjutkan?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteAll());
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "mine" ? "Postingan Saya" : "Linimasa Postingan"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "mine"
              ? "Kelola seluruh postingan yang pernah Anda publikasikan."
              : "Jelajahi cerita dan momen terbaru dari seluruh pengguna."}
          </p>
        </div>
        <button
          type="button"
          data-testid="add-post-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Buat Postingan</span>
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Postingan
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{totalPosts}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IconLayoutGrid size={26} stroke={2} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Suka
            </p>
            <h3 className="text-3xl font-black text-rose-500 mt-1">{totalLikes}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <IconHeart size={26} stroke={2} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Komentar
            </p>
            <h3 className="text-3xl font-black text-sky-600 mt-1">{totalComments}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <IconMessageCircle size={26} stroke={2} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-600 self-start">
          <button
            type="button"
            data-testid="tab-all-btn"
            onClick={() => handleTabChange("all")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <IconLayoutGrid size={16} />
            Semua Postingan
          </button>
          <button
            type="button"
            data-testid="tab-mine-btn"
            onClick={() => handleTabChange("mine")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "mine"
                ? "bg-white text-indigo-700 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <IconUserStar size={16} />
            Postingan Saya
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <IconSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
            />
            <input
              type="text"
              id="search-post-input"
              name="search"
              autoComplete="off"
              aria-label="Cari postingan"
              data-testid="search-post-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari deskripsi atau nama pembuat..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {activeTab === "mine" && (
            <button
              type="button"
              data-testid="delete-all-posts-btn"
              onClick={handleDeleteAllPosts}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/70 transition-colors"
            >
              <IconAlertTriangle size={16} />
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Daftar Postingan */}
      {loadingPosts && filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-16 flex flex-col items-center gap-3">
          <IconLoader2 size={36} className="text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat postingan...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-16 flex flex-col items-center gap-3 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center">
            <IconMoodEmpty size={30} />
          </div>
          <p className="font-semibold text-slate-700">Belum ada postingan yang cocok</p>
          <p className="text-sm text-slate-500 max-w-md">
            Coba ubah kata kunci pencarian atau publikasikan postingan baru terlebih
            dahulu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const isOwner = profile?.id === post.user_id;
            const likeCount = post.likes ? post.likes.length : 0;
            const commentCount = post.comments ? post.comments.length : 0;

            return (
              <article
                key={`post-${post.id}`}
                data-testid={`post-card-${post.id}`}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all overflow-hidden flex flex-col"
              >
                <Link
                  href={`/posts/${post.id}`}
                  className="relative block h-44 bg-gradient-to-br from-indigo-100 via-slate-100 to-cyan-100 overflow-hidden"
                >
                  {post.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover}
                      loading="lazy"
                      decoding="async"
                      alt={post.description || `Postingan ${post.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-300">
                      <IconPhoto size={44} stroke={1.6} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/85 backdrop-blur-sm text-slate-600 border border-white/60">
                    #{post.id}
                  </span>
                </Link>

                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-center gap-3">
                    {post.author?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.author.photo}
                        loading="lazy"
                        decoding="async"
                        alt={post.author?.name || "Penulis"}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {post.author?.name || "Pengguna"}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                    {post.description || "Tanpa deskripsi."}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <IconHeart size={15} className="text-rose-500" />
                      {likeCount} suka
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IconMessageCircle size={15} className="text-sky-500" />
                      {commentCount} komentar
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/posts/${post.id}`}
                      data-testid={`view-post-${post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <IconEye size={16} />
                      Lihat Detail
                    </Link>

                    {isOwner && (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          data-testid={`edit-post-${post.id}`}
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setShowChangeModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ubah Deskripsi"
                        >
                          <IconPencil size={17} />
                        </button>
                        <button
                          type="button"
                          data-testid={`delete-post-${post.id}`}
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Postingan"
                        >
                          <IconTrash size={17} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={() => setReloadToken((prev) => prev + 1)}
      />
      <ChangeModal
        show={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        postId={selectedPostId}
        onChanged={() => setReloadToken((prev) => prev + 1)}
      />
    </div>
  );
}

export default HomePage;
