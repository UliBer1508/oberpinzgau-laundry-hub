import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { de } from "date-fns/locale";

interface ManagementHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dateRange: "today" | "week" | "all";
  onDateRangeChange: (range: "today" | "week" | "all") => void;
}

export function ManagementHeader({
  selectedDate,
  onDateChange,
  dateRange,
  onDateRangeChange,
}: ManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-card">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onDateChange(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2 sm:px-3">
                <CalendarDays className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">
                  {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
                </span>
                <span className="font-medium sm:hidden">
                  {format(selectedDate, "dd.MM.yyyy", { locale: de })}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                locale={de}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onDateChange(addDays(selectedDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center rounded-lg border bg-card p-1">
          <Button
            variant={dateRange === "today" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 sm:px-3"
            onClick={() => onDateRangeChange("today")}
          >
            Heute
          </Button>
          <Button
            variant={dateRange === "week" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 sm:px-3"
            onClick={() => onDateRangeChange("week")}
          >
            7 Tage
          </Button>
          <Button
            variant={dateRange === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 sm:px-3"
            onClick={() => onDateRangeChange("all")}
          >
            Alle
          </Button>
        </div>
      </div>

    </div>
  );
}