const decodeBase64Url = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  return atob(padded);
};

export const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = decodeBase64Url(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
};

export const isTokenExpired = (token, skewMs = 30000) => {
  const expMs = getTokenExpiryMs(token);
  if (!expMs) return true;
  return Date.now() + skewMs >= expMs;
};

export const getAccessToken = () => localStorage.getItem("access");
export const getRefreshToken = () => localStorage.getItem("refresh");
export const getUser = () => localStorage.getItem("user");

export const clearAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const scheduleAutoLogout = (onLogout) => {
  const token = getAccessToken();
  if (!token) return null;
  const expMs = getTokenExpiryMs(token);
  if (!expMs) return null;
  const delay = expMs - Date.now();
  if (delay <= 0) {
    onLogout();
    return null;
  }
  return setTimeout(onLogout, delay);
};
