// src/utils/auth.js
export const getCurrentUserId = () => {
  try {
    const authData = JSON.parse(localStorage.getItem("auth") || "{}");
    return (
      authData?.user?.user_id ||
      authData?.user?.id ||
      authData?.user_id ||
      authData?.id ||
      null
    );
  } catch {
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const authData = JSON.parse(localStorage.getItem("auth") || "{}");
    return authData?.user || authData || null;
  } catch {
    return null;
  }
};
