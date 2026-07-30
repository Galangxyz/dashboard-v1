/**
 * Cloudinary Upload Utility
 *
 * Uploads files to Cloudinary using unsigned upload preset.
 * Uses native fetch() + FormData — no SDK dependency required.
 *
 * Required environment variables:
 *   VITE_CLOUDINARY_CLOUD_NAME
 *   VITE_CLOUDINARY_UPLOAD_PRESET
 *
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder path (e.g. "internhub/attendance")
 * @returns {Promise<string>} secure_url of the uploaded file
 */
export async function uploadToCloudinary(file, folder) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url;
}

export const CLOUDINARY_FOLDERS = {
  ATTENDANCE: "internhub/attendance",
  REPORTS: "internhub/reports",
  REPORT_IMAGES: "internhub/report-images",
};