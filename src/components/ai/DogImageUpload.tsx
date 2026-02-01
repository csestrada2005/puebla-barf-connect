import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DogImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageDataUrl: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DogImageUpload({ 
  currentImage, 
  onImageChange, 
  disabled,
  size = "md" 
}: DogImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={cn(
          "relative rounded-full overflow-hidden bg-secondary/50 flex items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors",
          sizeClasses[size]
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Dog preview" 
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full transform translate-x-1/4 -translate-y-1/4"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground/50" />
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      
      {!preview && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs gap-1"
        >
          <Upload className="h-3 w-3" />
          Subir foto
        </Button>
      )}
    </div>
  );
}
