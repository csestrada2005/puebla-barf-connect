import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface WeightPickerProps {
  onSubmit: (weight: number) => void;
  disabled?: boolean;
  initialValue?: number;
}

export function WeightPicker({ onSubmit, disabled, initialValue = 10 }: WeightPickerProps) {
  const [weight, setWeight] = useState<number>(initialValue);
  const MAX_WEIGHT = 35;

  const handleSliderChange = (value: number[]) => {
    setWeight(Math.min(value[0], MAX_WEIGHT));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= MAX_WEIGHT) {
      setWeight(Math.round(value * 10) / 10);
    } else if (!isNaN(value) && value > MAX_WEIGHT) {
      setWeight(MAX_WEIGHT);
    }
  };

  const handleSubmit = () => {
    if (weight > 0) {
      onSubmit(weight);
    }
  };

  // Get weight category label
  const getWeightCategory = (w: number): string => {
    if (w <= 5) return "Toy / Mini 🐕";
    if (w <= 15) return "Pequeño 🦮";
    if (w <= 30) return "Mediano 🐕‍🦺";
    return "Grande 🐺";
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-sm text-muted-foreground text-center">
        Ajusta el peso de tu perrito ⚖️
      </p>
      
      {/* Weight display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary">{weight} kg</div>
        <div className="text-sm text-muted-foreground mt-1">{getWeightCategory(weight)}</div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[weight]}
          onValueChange={handleSliderChange}
          min={1}
          max={MAX_WEIGHT}
          step={0.5}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 kg</span>
          <span>{MAX_WEIGHT}+ kg</span>
        </div>
      </div>

      {/* Fine-tune input */}
      <div className="flex items-center gap-2 justify-center">
        <span className="text-sm text-muted-foreground">Ajuste fino:</span>
        <Input
          type="number"
          value={weight}
          onChange={handleInputChange}
          min={1}
          max={MAX_WEIGHT}
          step={0.5}
          disabled={disabled}
          className="w-20 text-center"
        />
        <span className="text-sm text-muted-foreground">kg</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={weight <= 0 || disabled}
        className="w-full gap-2"
        size="lg"
      >
        <Send className="h-4 w-4" />
        Confirmar
      </Button>
    </div>
  );
}
