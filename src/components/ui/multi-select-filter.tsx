import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectFilterProps {
    title: string
    options: string[]
    selectedValues: Set<string>
    onChange: (newValues: Set<string>) => void
}

export function MultiSelectFilter({
    title,
    options,
    selectedValues,
    onChange,
}: MultiSelectFilterProps) {
    return (
        <Popover>
        <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 border-dashed bg-white">
        <PlusCircle className="mr-2 h-4 w-4" />
        {title}
        {selectedValues?.size > 0 && (
            <>
            <div className="hidden h-4 w-[1px] bg-gray-300 mx-2 lg:block" />
            <span className="hidden lg:flex px-1 bg-secondary text-secondary-foreground rounded-sm text-xs font-normal">
            {selectedValues.size}
            </span>
            </>
        )}
        </Button>
        </PopoverTrigger>
        {/* Added z-50 and bg-white explicitly to fix transparency/overlap issues */}
        <PopoverContent className="w-[250px] p-0 z-50 bg-white shadow-xl" align="start">
        <Command>
        <CommandInput placeholder={title} />
        <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
        {options.map((option) => {
            const isSelected = selectedValues.has(option)
            return (
                <CommandItem
                key={option}
                onSelect={() => {
                    const next = new Set(selectedValues)
                    if (isSelected) {
                        next.delete(option)
                    } else {
                        next.add(option)
                    }
                    onChange(next)
                }}
                >
                <div
                className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                    ? "bg-primary text-primary-foreground"
                    : "opacity-50 [&_svg]:invisible"
                )}
                >
                <Check className={cn("h-4 w-4")} />
                </div>
                <span className="truncate">{option}</span>
                </CommandItem>
            )
        })}
        </CommandGroup>
        {selectedValues.size > 0 && (
            <>
            <CommandSeparator />
            <CommandGroup>
            <CommandItem
            onSelect={() => onChange(new Set())}
            className="justify-center text-center"
            >
            Clear filters
            </CommandItem>
            </CommandGroup>
            </>
        )}
        </CommandList>
        </Command>
        </PopoverContent>
        </Popover>
    )
}
