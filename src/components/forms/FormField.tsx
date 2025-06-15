
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "number" | "password" | "textarea";
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  rows?: number;
}

export const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className,
  maxLength,
  min,
  max,
  rows = 3
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
        {label}
      </Label>
      
      <div className="relative">
        {type === "textarea" ? (
          <Textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            className={cn(error && "border-red-500 focus:border-red-500")}
          />
        ) : (
          <Input
            id={name}
            name={name}
            type={inputType}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            min={min}
            max={max}
            className={cn(error && "border-red-500 focus:border-red-500")}
          />
        )}
        
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {maxLength && type !== "number" && (
        <div className="text-xs text-muted-foreground text-right">
          {String(value).length}/{maxLength}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
