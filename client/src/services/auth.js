import api from "./api";

export const authService = {
  async register(formData) {
    const response = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async verifyOTP(data) {
    const response = await api.post("/auth/verify-otp", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete("/auth/account");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
