import { createContext, useContext, useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { loginRequest, getSessionRequest } from "../api/userRequest.js";
import { getAccount } from "../api/accountRequest.js";
import { changeRole as changeRoleRequest } from "../api/authRequest.js";
import { clearToken, getToken, pathImg, setToken } from "../api/axios.js";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const loadUserProfile = async () => {
    const session = await getSessionRequest();
    const { data } = await getAccount(session.data.accountId, session.data.rolId);
    setUser({
      firstName: data.user.firstName,
      firstLastName: data.user.firstLastName,
      username: data.username,
      accountId: data.id,
      userId: session.data.userId,
      rolId: session.data.rolId,
      loginRol: session.data.loginRol,
      roles: data.roles || [],
    });
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const signin = async (userData) => {
    try {
      const { data } = await loginRequest(userData);

      if (data.selectRole) {
        return { selectRole: true, roles: data.roles, accountId: data.accountId };
      }

      if (setToken(data?.token)) {
        await loadUserProfile();
        return { success: true };
      }

      setErrors({ message: data.message || "No se pudo iniciar sesión", status: "error" });
      return { error: true };
    } catch (error) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setErrors({
        message: error.response?.data?.message || "Error de conexión",
        status: "error",
      });
      return { error: true };
    }
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  const changeRole = async (newRoleId) => {
    try {
      const { data } = await changeRoleRequest({
        accountId: user.accountId,
        rolId: newRoleId,
      });
      if (!setToken(data?.token)) {
        logout();
        enqueueSnackbar("Token inválido al cambiar de rol", { variant: "error" });
        return;
      }
      await loadUserProfile();
      enqueueSnackbar("Rol actualizado", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Error al cambiar de rol",
        { variant: "error" }
      );
    }
  };

  const toast = async ({
    message,
    variant = "info",
    promise,
    successMessage = "Operación exitosa",
    errorMessage = "Ocurrió un error",
  }) => {
    if (message && !promise) {
      enqueueSnackbar(message, { variant, autoHideDuration: 3000 });
      return;
    }
    if (!promise) return;
    try {
      await promise;
      enqueueSnackbar(successMessage, { variant: "success", autoHideDuration: 3000 });
    } catch (error) {
      const msg = error?.response?.data?.message || errorMessage || error?.message;
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 4000 });
      throw error;
    }
  };

  const checkLogin = async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      await getSessionRequest();
      await loadUserProfile();
    } catch {
      clearToken();
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (!errors.message) return;
    const t = setTimeout(() => setErrors({}), 5000);
    return () => clearTimeout(t);
  }, [errors]);

  return (
    <AuthContext.Provider
      value={{
        signin,
        logout,
        changeRole,
        errors,
        isAuthenticated,
        isLoading,
        user,
        pathImg,
        toast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
