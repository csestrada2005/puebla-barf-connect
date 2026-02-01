import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { calculateAge } from "@/hooks/usePlanCalculator";

interface DogCardProps {
  dog: {
    id: string;
    name: string;
    weight_kg: number;
    age_stage: string;
    birthday: string | null;
    daily_grams: number;
    recommended_protein: string;
    activity_level: string;
    image_url?: string | null;
  };
  onImageUpdate: (imageUrl: string | null) => void;
}

export function DogCard({ dog, onImageUpdate }: DogCardProps) {
  const [preview, setPreview] = useState<string | null>(dog.image_url || null);
  const [isHovering, setIsHovering] = useState(false);
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
      onImageUpdate(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageUpdate(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Dog Avatar with Upload */}
          <div
            className="w-24 bg-secondary/30 flex items-center justify-center relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
                {isHovering && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                )}
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 p-2">
                <div className="text-3xl">🐕</div>
                {isHovering && (
                  <Camera className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Dog Info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{dog.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {dog.weight_kg}kg •{" "}
                  {dog.age_stage === "puppy"
                    ? "Cachorro"
                    : dog.age_stage === "senior"
                    ? "Senior"
                    : "Adulto"}
                  {dog.birthday && ` • ${calculateAge(dog.birthday)}`}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai">Actualizar</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-primary/10 text-primary border-0">
                {dog.daily_grams}g/día
              </Badge>
              <Badge variant="outline">
                {dog.recommended_protein === "chicken"
                  ? "Pollo"
                  : dog.recommended_protein === "beef"
                  ? "Res"
                  : "Mix"}
              </Badge>
              <Badge variant="outline">
                {dog.activity_level === "high"
                  ? "Alta actividad"
                  : dog.activity_level === "low"
                  ? "Baja actividad"
                  : "Actividad normal"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
