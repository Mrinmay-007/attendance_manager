
const authProvider = {
  login: () => Promise.resolve(), // We handle login outside React Admin
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/"; // redirect to login
    return Promise.resolve();
  },
  checkError: () => Promise.resolve(),
  checkAuth: () =>
    localStorage.getItem("token") ? Promise.resolve() : Promise.reject(),
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
