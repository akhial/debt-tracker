import { usePeople } from "@/hooks/usePeople";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PersonSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function PersonSelect({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select person",
}: PersonSelectProps) {
  const { data: people, isLoading } = usePeople();

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {people?.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.name}
          </SelectItem>
        ))}
        {(!people || people.length === 0) && (
          <SelectItem value="" disabled>
            No people added yet
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
