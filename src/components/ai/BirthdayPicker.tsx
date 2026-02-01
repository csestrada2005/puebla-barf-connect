import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";

interface BirthdayPickerProps {
  onSubmit: (date: string) => void;
  disabled?: boolean;
}

export function BirthdayPicker({ onSubmit, disabled }: BirthdayPickerProps) {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);
  
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const getDaysInMonth = (m: string, y: string) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, "0"));

  const handleSubmit = () => {
    if (day && month && year) {
      const dateStr = `${year}-${month}-${day}`;
      onSubmit(dateStr);
    }
  };

  const isComplete = day && month && year;

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-sm text-muted-foreground text-center">
        Selecciona su fecha de nacimiento 🎂
      </p>
      <div className="flex gap-2 w-full">
        <Select value={day} onValueChange={setDay} disabled={disabled}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Día" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {days.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth} disabled={disabled}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear} disabled={disabled}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || disabled}
        className="w-full gap-2"
        size="lg"
      >
        <Send className="h-4 w-4" />
        Confirmar
      </Button>
    </div>
  );
}
