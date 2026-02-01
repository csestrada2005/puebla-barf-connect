import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowRight } from "lucide-react";

interface ImageUploadStepProps {
  onSubmit: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function ImageUploadStep({ onSubmit, disabled }: ImageUploadStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onSubmit(preview);
  };

  const handleSkip = () => {
    onSubmit(null);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {preview ? (
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary/30">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={disabled}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Guardar con foto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Cambiar foto
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-1 gap-2"
          >
            <Camera className="h-4 w-4" />
            Subir Foto
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={disabled}
            className="gap-2"
          >
            Saltar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
