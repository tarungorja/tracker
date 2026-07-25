export const APP_NAME = "Hair Health Tracker";
export const APP_DESCRIPTION =
  "Track your hair-care medications, log daily completion, and monitor daily wellness.";

export const WELLNESS_LOG_KEY = "__wellness__";

export interface SeedMedication {
  name: string;
  description: string;
  instructions: string;
  scheduleTimes: string[];
  intervalDays?: number;
}

export const SEED_MEDICATIONS: SeedMedication[] = [
  {
    name: "Biotin Hair Gummies",
    description: "Daily biotin gummy to support hair strength.",
    instructions:
      "Have 1 gummy daily, preferably at the same time each day.\nChew it well.",
    scheduleTimes: ["2:00 PM"],
  },
  {
    name: "Hair Health Booster",
    description: "Twice-daily tablet taken after meals.",
    instructions:
      "Have one tablet after meals twice daily with water or ghee.\nCan also be chewed directly.",
    scheduleTimes: ["10:00 AM", "9:00 PM"],
  },
  {
    name: "Hair Growth Tablets",
    description: "Morning tablet — monitor blood pressure while using.",
    instructions:
      "Take one tablet every morning after food.\n\nMonitor blood pressure regularly.\n\nStop immediately if you notice:\n• breathlessness\n• fast heartbeat\n• swelling\n• rash\n\nConsult your doctor if any symptoms occur.",
    scheduleTimes: ["10:00 AM"],
  },
  {
    name: "Minoxidil Spray",
    description: "Topical scalp spray applied morning and night.",
    instructions:
      "MORNING\nUse after bath.\nApply 1 ml.\nMassage scalp for 2 minutes.\n\nNIGHT\nApply one hour before sleeping.\nMassage scalp for 2 minutes.\nLeave overnight.\n\nGENERAL WARNINGS\nPatch test before first use.\nDo not use if you notice redness, itching or rash.\nCan cause dryness.",
    scheduleTimes: ["8:00 AM", "9:00 PM"],
  },
  {
    name: "Headbath",
    description: "Wash your hair once every two days.",
    instructions:
      "Wash your hair thoroughly with lukewarm water and a mild shampoo.\nAvoid very hot water.\nGently pat dry — don't rub harshly.",
    scheduleTimes: ["8:00 AM"],
    intervalDays: 2,
  },
];

export const TIMELINE_SLOTS = ["8:00 AM", "10:00 AM", "2:00 PM", "9:00 PM"] as const;

export const HEATMAP_DAYS = 133;
