import client from "./client";
export const login = async (userId, password) => {
  const res = await client.post("/login", { userId, password });
  return res.data;
};
