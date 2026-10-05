import apiHelper from "../../../helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";

const postApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/posts`;

  function _url(path) {
    return BASE_URL + path;
  }

  function _throwIfFailed(result, fallbackMessage) {
    if (result.status !== "success" && !result.success) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || fallbackMessage;
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }
  }

  /**
   * Mengambil seluruh postingan publik, atau hanya milik pengguna aktif (is_me=1).
   */
  async function getPosts(is_me) {
    const targetUrl =
      is_me !== "" && is_me !== null && is_me !== undefined
        ? `/?is_me=${is_me}`
        : "/";

    const response = await apiHelper.fetchData(_url(targetUrl), {
      method: "GET",
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengambil data postingan");

    return result.data?.posts || [];
  }

  /**
   * Mengambil rincian satu postingan beserta interaksi like dan komentarnya.
   */
  async function getPostById(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "GET",
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengambil detail postingan");

    return result.data?.post;
  }

  /**
   * Mempublikasikan postingan baru (deskripsi saja, cover diunggah terpisah).
   */
  async function postPost(description) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
      }),
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal menambahkan postingan");

    return result.data;
  }

  /**
   * Memperbarui isi deskripsi postingan.
   */
  async function putPost(postId, description) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
      }),
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengubah postingan");

    return result.message;
  }

  /**
   * Mengunggah atau mengganti gambar cover postingan.
   */
  async function postPostCover(postId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");

    const response = await apiHelper.fetchData(_url(`/${postId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengubah cover postingan");

    return result.message;
  }

  /**
   * Menghapus satu postingan tertentu.
   */
  async function deletePost(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "DELETE",
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal menghapus postingan");

    return result.message;
  }

  /**
   * Memberikan (like = 1) atau membatalkan (like = 0) suka pada postingan.
   */
  async function postPostLike(postId, like) {
    const response = await apiHelper.fetchData(_url(`/${postId}/likes`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        like: like ? 1 : 0,
      }),
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengubah status suka pada postingan");

    return result.message;
  }

  /**
   * Menambahkan komentar baru pada postingan.
   */
  async function postPostComment(postId, comment) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment,
      }),
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal mengirim komentar");

    return result.message;
  }

  /**
   * Menghapus komentar milik pengguna aktif pada postingan tertentu.
   */
  async function deletePostComment(postId) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "DELETE",
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal menghapus komentar");

    return result.message;
  }

  /**
   * Menghapus seluruh postingan milik pengguna aktif beserta cover, like, dan komentarnya.
   */
  async function deleteAllPosts() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "DELETE",
    });

    const result = await response.json();
    _throwIfFailed(result, "Gagal menghapus semua postingan");

    return result.message;
  }

  return {
    getPosts,
    getPostById,
    postPost,
    putPost,
    postPostCover,
    deletePost,
    postPostLike,
    postPostComment,
    deletePostComment,
    deleteAllPosts,
  };
})();

export default postApi;
