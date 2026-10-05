const apiHelper = (() => {
  async function fetchData(url: string, options: RequestInit = {}) {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  function putAccessToken(token: string | null | undefined) {
    if (!token) {
      localStorage.removeItem("accessToken");
      // Hapus cookie penanda sesi agar middleware ikut menutup akses dashboard.
      document.cookie = "delcom_session=; path=/; max-age=0; samesite=lax";
    } else {
      localStorage.setItem("accessToken", token);
      // Cookie ini dibaca middleware sehingga pengunjung yang belum masuk tidak
      // perlu mengunduh bundel dashboard sama sekali.
      document.cookie =
        "delcom_session=1; path=/; max-age=2592000; samesite=lax";
    }
  }

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;
