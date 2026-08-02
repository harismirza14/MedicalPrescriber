import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Loader2 } from 'lucide-react';
import Avatar from '../../atoms/Avatar/Avatar';
import toast from 'react-hot-toast';
import { uploadProfilePicture } from '../../../api/profileApi';
import { updateUser } from '../../../store/authSlice';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ProfilePicture({
  currentPicture,
  name,
  onUploadSuccess,
  size = 'xl',
  targetUserId = null,
  targetRoleSpecificId = null,
  
}) {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.user_id);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPicture || null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, or WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = await uploadProfilePicture(file, targetUserId);
      const pictureUrl = res.profilePicture;

      setPreview(pictureUrl);
      onUploadSuccess?.(pictureUrl);

      const isSelfUpload = !targetUserId || Number(targetUserId) === Number(currentUserId);

      if (isSelfUpload) {
        dispatch(updateUser({ profile_picture: pictureUrl }));
      }

      if (targetUserId && !isSelfUpload) {
        window.dispatchEvent(new CustomEvent('profile-picture-updated', {
          detail: { userId: targetUserId,
             roleSpecificId: targetRoleSpecificId,
          }
          
        }));
      }

      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload.');
      setPreview(currentPicture || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block">
        <Avatar name={name} src={preview} size={size} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload profile picture"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Choose profile picture"
        />
      </div>
      {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
    </div>
  );
}