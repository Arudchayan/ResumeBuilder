import { toast } from "sonner";

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
