import { ALL_DOSES, type MedicationColor } from "@/lib/constants";

export interface DoseInfo {
  key: string;
  label: string;
  slot: string;
  time: string;
  instructions: string[];
  warnings: string[];
  medicationSlug: string;
  medicationName: string;
  emoji: string;
  color: MedicationColor;
  summary: string;
  order: number;
}

/** Fast lookup of static dose info (instructions, warnings, theming) by key. */
export const DOSE_INFO: Map<string, DoseInfo> = new Map(
  ALL_DOSES.map((dose) => [
    dose.key,
    {
      key: dose.key,
      label: dose.label,
      slot: dose.slot,
      time: dose.time,
      instructions: dose.instructions,
      warnings: dose.warnings ?? [],
      medicationSlug: dose.medication.slug,
      medicationName: dose.medication.name,
      emoji: dose.medication.emoji,
      color: dose.medication.color,
      summary: dose.medication.summary,
      order: dose.medication.order,
    },
  ]),
);
