import { toast } from "sonner";
import { validateResumeData } from "./schema";

export function validateImageFile(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file (JPG, PNG, GIF, etc.)');
    return false;
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error('Image must be less than 5MB');
    return false;
  }
  
  return true;
}

export function validateImageDimensions(img, callback) {
  if (img.width < 100 || img.height < 100) {
    toast.error('Image must be at least 100x100 pixels');
    return false;
  }
  
  if (img.width > 4000 || img.height > 4000) {
    toast.error('Image must be less than 4000x4000 pixels');
    return false;
  }
  
  return true;
}

export function validateImportedResume(json) {
  const parsed = validateResumeData(json);
  if (!parsed.success) {
    const first = parsed.error.issues?.[0];
    const where = first?.path?.join('.') || 'root';
    const msg = first?.message || 'Invalid data';
    toast.error(`Import failed at ${where}: ${msg}`);
    return null;
  }
  return parsed.data;
}
