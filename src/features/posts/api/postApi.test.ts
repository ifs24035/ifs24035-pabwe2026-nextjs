import { describe, it, expect, vi, beforeEach } from "vitest";
import postApi from "./postApi";
import apiHelper from "../../../helpers/apiHelper";
import { DELCOM_BASEURL } from "../../../lib/config";

const POSTS_URL = `${DELCOM_BASEURL}/posts`;

describe("postApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockResponse(payload) {
    return {
      json: async () => payload,
    } as unknown as Response;
  }

  describe("getPosts", () => {
    it("should fetch all posts without query parameter", async () => {
      const mockPosts = [{ id: 1, description: "Post 1" }];
      const fetchSpy = vi
        .spyOn(apiHelper, "fetchData")
        .mockResolvedValue(mockResponse({ status: "success", data: { posts: mockPosts } }));

      const posts = await postApi.getPosts();

      expect(posts).toEqual(mockPosts);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${POSTS_URL}/`,
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should fetch only own posts when is_me provided", async () => {
      const mockPosts = [{ id: 2, description: "Post 2" }];
      const fetchSpy = vi
        .spyOn(apiHelper, "fetchData")
        .mockResolvedValue(mockResponse({ status: "success", data: { posts: mockPosts } }));

      const posts = await postApi.getPosts("1");

      expect(posts).toEqual(mockPosts);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${POSTS_URL}/?is_me=1`,
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should ignore null and undefined is_me values", async () => {
      const fetchSpy = vi
        .spyOn(apiHelper, "fetchData")
        .mockResolvedValue(mockResponse({ status: "success", data: { posts: [] } }));

      await postApi.getPosts(null);
      expect(fetchSpy).toHaveBeenLastCalledWith(`${POSTS_URL}/`, expect.anything());

      await postApi.getPosts(undefined);
      expect(fetchSpy).toHaveBeenLastCalledWith(`${POSTS_URL}/`, expect.anything());
    });

    it("should return empty array when data.posts is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: {} })
      );

      const posts = await postApi.getPosts();
      expect(posts).toEqual([]);
    });

    it("should throw joined validation details on failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "fail",
          message: "Data tidak valid",
          data: { description: ["Deskripsi wajib diisi"] },
        })
      );

      await expect(postApi.getPosts()).rejects.toThrow(
        "Data tidak valid: Deskripsi wajib diisi"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.getPosts()).rejects.toThrow("Gagal mengambil data postingan");
    });
  });

  describe("getPostById", () => {
    it("should return single post on success", async () => {
      const mockPost = { id: 5, description: "Detail" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { post: mockPost } })
      );

      await expect(postApi.getPostById(5)).resolves.toEqual(mockPost);
    });

    it("should return undefined when data.post is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: {} })
      );

      await expect(postApi.getPostById(5)).resolves.toBeUndefined();
    });

    it("should throw error on detail failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Postingan tidak ditemukan" })
      );

      await expect(postApi.getPostById(999)).rejects.toThrow("Postingan tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.getPostById(999)).rejects.toThrow(
        "Gagal mengambil detail postingan"
      );
    });
  });

  describe("postPost", () => {
    it("should create a new post and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { post_id: 6 } })
      );

      await expect(postApi.postPost("Contoh deskripsi")).resolves.toEqual({ post_id: 6 });
    });

    it("should accept response flagged by success boolean", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", success: true, data: { post_id: 7 } })
      );

      await expect(postApi.postPost("Contoh")).resolves.toEqual({ post_id: 7 });
    });

    it("should throw error when creation fails with non-object details", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Gagal", data: "bukan objek" })
      );

      await expect(postApi.postPost("")).rejects.toThrow(/^Gagal$/);
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.postPost("")).rejects.toThrow("Gagal menambahkan postingan");
    });
  });

  describe("putPost", () => {
    it("should update post description and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah data" })
      );

      await expect(postApi.putPost(1, "Deskripsi baru")).resolves.toBe(
        "Berhasil mengubah data"
      );
    });

    it("should throw error on update failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Gagal update postingan" })
      );

      await expect(postApi.putPost(1, "")).rejects.toThrow("Gagal update postingan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.putPost(1, "")).rejects.toThrow("Gagal mengubah postingan");
    });
  });

  describe("postPostCover", () => {
    it("should upload cover using FormData and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah cover" })
      );

      const cover = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      await expect(postApi.postPostCover(1, cover)).resolves.toBe(
        "Berhasil mengubah cover"
      );

      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${POSTS_URL}/1/cover`);
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);
    });

    it("should fall back to default filename when file has no name", async () => {
      const fetchSpy = vi
        .spyOn(apiHelper, "fetchData")
        .mockResolvedValue(mockResponse({ status: "success", message: "Berhasil" }));

      const blob = new Blob(["dummy"], { type: "image/jpeg" });
      await postApi.postPostCover(1, blob);

      const formData = fetchSpy.mock.calls[0][1].body as FormData;
      expect(formData.get("cover")).toBeInstanceOf(File);
      expect((formData.get("cover") as File).name).toBe("cover.jpg");
    });

    it("should throw error on cover upload failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Format tidak didukung" })
      );

      const cover = new File(["dummy"], "cover.jpg");
      await expect(postApi.postPostCover(1, cover)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      const cover = new File(["dummy"], "cover.jpg");
      await expect(postApi.postPostCover(1, cover)).rejects.toThrow(
        "Gagal mengubah cover postingan"
      );
    });
  });

  describe("deletePost", () => {
    it("should delete post and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil menghapus data" })
      );

      await expect(postApi.deletePost(1)).resolves.toBe("Berhasil menghapus data");
    });

    it("should throw error on delete failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Gagal menghapus" })
      );

      await expect(postApi.deletePost(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.deletePost(1)).rejects.toThrow("Gagal menghapus postingan");
    });
  });

  describe("postPostLike", () => {
    it("should send like = 1 when giving a like", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah status suka" })
      );

      await expect(postApi.postPostLike(3, 1)).resolves.toBe(
        "Berhasil mengubah status suka"
      );
      expect(fetchSpy.mock.calls[0][0]).toBe(`${POSTS_URL}/3/likes`);
      expect(fetchSpy.mock.calls[0][1].body).toBe(JSON.stringify({ like: 1 }));
    });

    it("should send like = 0 when removing a like", async () => {
      const fetchSpy = vi
        .spyOn(apiHelper, "fetchData")
        .mockResolvedValue(mockResponse({ status: "success", message: "Berhasil" }));

      await postApi.postPostLike(3, 0);
      expect(fetchSpy.mock.calls[0][1].body).toBe(JSON.stringify({ like: 0 }));
    });

    it("should throw error on like failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Postingan tidak ditemukan" })
      );

      await expect(postApi.postPostLike(1, 1)).rejects.toThrow(
        "Postingan tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.postPostLike(1, 1)).rejects.toThrow(
        "Gagal mengubah status suka pada postingan"
      );
    });
  });

  describe("postPostComment", () => {
    it("should send comment and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "success",
          message: "Berhasil memberikan komentar pada postingan",
        })
      );

      await expect(postApi.postPostComment(1, "Komentar percobaan")).resolves.toBe(
        "Berhasil memberikan komentar pada postingan"
      );
      expect(fetchSpy.mock.calls[0][1].body).toBe(
        JSON.stringify({ comment: "Komentar percobaan" })
      );
    });

    it("should throw error on comment failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Komentar tidak valid" })
      );

      await expect(postApi.postPostComment(1, "")).rejects.toThrow(
        "Komentar tidak valid"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.postPostComment(1, "")).rejects.toThrow(
        "Gagal mengirim komentar"
      );
    });
  });

  describe("deletePostComment", () => {
    it("should delete comment and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "success",
          message: "Berhasil menghapus komentar pada postingan",
        })
      );

      await expect(postApi.deletePostComment(2)).resolves.toBe(
        "Berhasil menghapus komentar pada postingan"
      );
      expect(fetchSpy.mock.calls[0][0]).toBe(`${POSTS_URL}/2/comments`);
      expect(fetchSpy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("should throw error on delete comment failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Komentar tidak ditemukan" })
      );

      await expect(postApi.deletePostComment(2)).rejects.toThrow(
        "Komentar tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.deletePostComment(2)).rejects.toThrow(
        "Gagal menghapus komentar"
      );
    });
  });

  describe("deleteAllPosts", () => {
    it("should delete all posts and return message", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "success",
          message: "Berhasil menghapus semua data postingan",
        })
      );

      await expect(postApi.deleteAllPosts()).resolves.toBe(
        "Berhasil menghapus semua data postingan"
      );
      expect(fetchSpy.mock.calls[0][0]).toBe(`${POSTS_URL}/`);
      expect(fetchSpy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("should throw error on delete all failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Unauthenticated." })
      );

      await expect(postApi.deleteAllPosts()).rejects.toThrow("Unauthenticated.");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(mockResponse({ status: "fail" }));

      await expect(postApi.deleteAllPosts()).rejects.toThrow(
        "Gagal menghapus semua postingan"
      );
    });
  });
});
