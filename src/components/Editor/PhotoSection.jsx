import { toast } from "sonner";
import Section from "../UI/Section";
import Label from "../UI/Label";
import Input from "../UI/Input";
import { validateImageFile, validateImageDimensions } from "../../utils/validation";

export default function PhotoSection({ state, updatePhoto }) {
  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!validateImageFile(file)) {
      e.target.value = '';
      return;
    }
    
    // Validate dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      if (!validateImageDimensions(img)) {
        e.target.value = '';
        return;
      }
      
      // If all validations pass, read the file
      const reader = new FileReader();
      reader.onload = () => { 
        updatePhoto('dataUrl', reader.result);
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Failed to load image. Please try another file.');
      e.target.value = '';
    };
    
    img.src = objectUrl;
  };

  return (
    <Section title="Photo (optional)">
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={!!state.photo?.enabled} 
          onChange={e => updatePhoto('enabled', e.target.checked)} 
        />
        <Label className="!mb-0">Show photo</Label>
      </div>
      {state.photo?.enabled ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Upload image</Label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoFile} 
              className="block w-full text-sm" 
            />
          </div>
          <div>
            <Label>OR Image URL</Label>
            <Input 
              value={state.photo?.url || ""} 
              onChange={e => updatePhoto('url', e.target.value)} 
              placeholder="https://example.com/photo.jpg" 
            />
          </div>
        </div>
      ) : null}
    </Section>
  );
}
