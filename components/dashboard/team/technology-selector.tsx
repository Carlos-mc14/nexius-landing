"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { availableTechnologies } from "@/lib/technologies"

interface TechnologySelectorProps {
  value: { name: string; icon: string }[]
  onChange: (value: { name: string; icon: string }[]) => void
  disabled?: boolean
}

export function TechnologySelector({ value, onChange, disabled }: TechnologySelectorProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (tech: { name: string; icon: string }) => {
    // Check if technology is already selected
    const isSelected = value.some((item) => item.name === tech.name)

    if (isSelected) {
      // Remove technology if already selected
      onChange(value.filter((item) => item.name !== tech.name))
    } else {
      // Add technology if not selected
      onChange([...value, tech])
    }
  }

  const handleRemove = (techName: string) => {
    onChange(value.filter((item) => item.name !== techName))
  }

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            Seleccionar tecnologías
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar tecnología..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {availableTechnologies.map((tech) => {
                  const isSelected = value.some((item) => item.name === tech.name)
                  return (
                    <CommandItem
                      key={tech.name}
                      value={tech.name}
                      onSelect={() => handleSelect(tech)}
                      className="flex items-center"
                    >
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{tech.name}</span>
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tech) => (
            <Badge key={tech.name} variant="secondary" className="flex items-center gap-1">
              {tech.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemove(tech.name)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar {tech.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
