import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string | null | undefined;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  type?: "text" | "tel" | "date" | "number";
  prefix?: React.ReactNode;
  emptyText?: string;
  disabled?: boolean;
}

export function EditableField({
  value,
  onSave,
  placeholder = "Sin valor",
  className,
  inputClassName,
  type = "text",
  prefix,
  emptyText = "—",
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setTempValue(value || "");
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onSave(tempValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setTempValue(value || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(e as unknown as React.MouseEvent);
    } else if (e.key === "Escape") {
      handleCancel(e as unknown as React.MouseEvent);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("h-7 text-sm", inputClassName)}
          autoFocus
          disabled={isSaving}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors",
        disabled && "cursor-default hover:bg-transparent",
        className
      )}
      onClick={startEdit}
    >
      {prefix}
      <span className={cn(!value && "text-muted-foreground")}>
        {value || emptyText}
      </span>
      {!disabled && (
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
      )}
    </div>
  );
}
