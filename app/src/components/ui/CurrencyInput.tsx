import { useState, useCallback } from "react";
import { getCurrencySymbol } from "@/types/domain";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currencyCode: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currencyCode,
  disabled,
  className,
  placeholder = "0.00",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value ? value.toFixed(2) : "",
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty, numbers, and single decimal point
      if (inputValue === "" || /^\d*\.?\d{0,2}$/.test(inputValue)) {
        setDisplayValue(inputValue);

        const numericValue = parseFloat(inputValue);
        if (!isNaN(numericValue)) {
          onChange(numericValue);
        } else if (inputValue === "") {
          onChange(0);
        }
      }
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    // Format on blur
    const numericValue = parseFloat(displayValue);
    if (!isNaN(numericValue)) {
      setDisplayValue(numericValue.toFixed(2));
    } else {
      setDisplayValue("");
    }
  }, [displayValue]);

  const symbol = getCurrencySymbol(currencyCode);

  return (
    <InputGroup className={cn(className)} data-disabled={disabled}>
      <InputGroupAddon align="inline-start">
        <InputGroupText>{symbol}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
      />
    </InputGroup>
  );
}
