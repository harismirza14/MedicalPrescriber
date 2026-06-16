import client from "./client";

/**
 * Authenticate a user.
 * POST /login
 */
export const login = async (userId, password) => {
  const res = await client.post("/login", { userId, password });
  return res.data;
};
