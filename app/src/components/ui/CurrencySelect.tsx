import { CURRENCY_CODES, getCurrencySymbol } from "@/types/domain";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelect({
  value,
  onChange,
  disabled,
  className,
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_CODES.map((code) => (
          <SelectItem key={code} value={code}>
            {getCurrencySymbol(code)} {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
