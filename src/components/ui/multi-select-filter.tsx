import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface OptionItem {
  id: string;
  name: string;
}

interface MultiSelectFilterProps {
  title: string;
  options: OptionItem[];
  selectedValues: string[]; // array de IDs
  onChange: (newValues: string[]) => void; // array de IDs
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onChange,
}: MultiSelectFilterProps) {
  const handleSelect = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter((v) => v !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  const clearFilters = () => onChange([]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 border-dashed bg-white"
        >
          {title}
          {selectedValues.length > 0 && (
            <span className="ml-2">{selectedValues.length}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[250px] p-0 z-50 bg-white shadow-xl"
        align="start"
      >
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    onSelect={() => handleSelect(opt.id)}
                  >
                    <div className={isSelected ? 'bg-primary' : 'border'}>
                      {/* check icon */}
                    </div>
                    {opt.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={clearFilters}>
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
