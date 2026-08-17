import type { Frequency } from "@/types";

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function frequencyLabel(f: Frequency): string {
  switch (f.type) {
    case "daily":
      return "Every day";
    case "weekdays":
      return "Weekdays";
    case "weekends":
      return "Weekends";
    case "custom": {
      if (f.days.length === 7) return "Every day";
      if (f.days.length === 0) return "No days set";
      return f.days.map((d) => DOW_SHORT[d]).join(", ");
    }
    default:
      return "Every day";
  }
}
