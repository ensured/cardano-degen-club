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
      <div>
        <SelectTrigger
          className={
            parseInt(selectedOption, 10) > 9 ? "w-[110px]" : "w-[95px]"
          }
        >
          <SelectValue placeholder={`Page: ${selectedOption}`} />
        </SelectTrigger>
      </div>

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
