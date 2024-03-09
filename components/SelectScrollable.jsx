import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectScrollable({
  options,
  selectedOption,
  onSelect,
}) {
  return (
    <Select
      onValueChange={(value) => {
        onSelect(value)
      }}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder={`Page: ${selectedOption}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              Page {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
