import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";

interface DeliveryPhotoUploadProps {
  orderId: string;
  onPhotoUploaded: (url: string) => void;
  existingPhoto?: string | null;
  disabled?: boolean;
  deliveryToken?: string;
}

export default function DeliveryPhotoUpload({ 
  orderId, 
  onPhotoUploaded, 
  existingPhoto,
  disabled,
  deliveryToken
}: DeliveryPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingPhoto || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }

    if (!deliveryToken) {
      setError("Token de entrega no disponible");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create FormData for the edge function
      const formData = new FormData();
      formData.append("token", deliveryToken);
      formData.append("file", file);

      // Upload via edge function (validates token server-side)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-delivery-photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al subir la foto");
      }

      setPreview(result.url);
      onPhotoUploaded(result.url);
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      setError(err.message || "Error al subir la foto. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    onPhotoUploaded("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Foto de entrega</label>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Foto de entrega"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearPhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 flex flex-col gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Subiendo...</span>
            </>
          ) : (
            <>
              <Camera className="h-6 w-6" />
              <span className="text-xs">Tomar o subir foto</span>
            </>
          )}
        </Button>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
