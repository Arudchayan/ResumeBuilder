import { describe, it, expect } from 'vitest';
import { validateImageFile, validateImageDimensions } from '../validation';

describe('validation', () => {
  describe('validateImageFile', () => {
    it('should accept valid image files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(validateImageFile(file)).toBe(true);
    });

    it('should reject non-image files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(validateImageFile(file)).toBe(false);
    });

    it('should reject files over 5MB', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      expect(validateImageFile(file)).toBe(false);
    });
  });

  describe('validateImageDimensions', () => {
    it('should accept valid dimensions', () => {
      const img = { width: 200, height: 200 };
      expect(validateImageDimensions(img)).toBe(true);
    });

    it('should reject images too small', () => {
      const img = { width: 50, height: 50 };
      expect(validateImageDimensions(img)).toBe(false);
    });

    it('should reject images too large', () => {
      const img = { width: 5000, height: 5000 };
      expect(validateImageDimensions(img)).toBe(false);
    });

    it('should check both width and height', () => {
      expect(validateImageDimensions({ width: 50, height: 200 })).toBe(false);
      expect(validateImageDimensions({ width: 200, height: 50 })).toBe(false);
    });
  });
});
