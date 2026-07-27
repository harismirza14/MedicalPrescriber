import client from './client';

export const uploadProfilePicture = async (file, targetUserId = null) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  if (targetUserId) {
    formData.append('targetUserId', targetUserId);
  }
  const res = await client.patch('/profile/picture', formData);
  return res.data;
};