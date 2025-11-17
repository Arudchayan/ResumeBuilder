import { toast } from "sonner";
import { logger } from "./logger";

export function cleanupOldDrafts() {
  const keysToClean = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('resume_backup_') || key === 'resume_old')) {
      keysToClean.push(key);
    }
  }
  keysToClean.forEach(key => localStorage.removeItem(key));
}

export function clearOldResumeData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('resume_') && key !== 'resume_draft' && key !== 'resume_manager') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (keysToRemove.length === 0) {
    logger.warn('No old resume data to clean. localStorage might be full from other apps.');
  }
}

export function saveToLocalStorage(key, data) {
  try {
    const dataStr = JSON.stringify(data);
    
    // Check size (localStorage typically has ~5-10MB limit)
    const sizeMB = new Blob([dataStr]).size / (1024 * 1024);
    if (sizeMB > 4) {
      toast.error('Data too large to save (>4MB). Consider reducing content.');
      return false;
    }
    
    try {
      localStorage.setItem(key, dataStr);
      return true;
    } catch (quotaError) {
      logger.warn('LocalStorage quota exceeded, cleaning up...');
      clearOldResumeData();
      try {
        localStorage.setItem(key, dataStr);
        toast.warning('Storage cleaned to save your data');
        return true;
      } catch (retryError) {
        toast.error('Failed to save: storage full. Export as JSON to backup.');
        return false;
      }
    }
  } catch (e) {
    logger.error('Failed to save to localStorage:', e);
    return false;
  }
}

export function loadFromLocalStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    logger.error('Failed to load from localStorage:', e);
  }
  return null;
}
