"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { Save, Loader2, Sun, Moon, MonitorSmartphone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@/lib/validation/resolver";
import {
  settingsSchema,
  type SettingsValues,
  TIMEZONES,
  REMINDER_OFFSETS,
} from "@/lib/validation/settings";
import { updateSettings } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
] as const;

export function SettingsForm({
  defaultValues,
}: {
  defaultValues: SettingsValues;
}) {
  const { setTheme } = useTheme();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const values = watch();
  const timezoneOptions = TIMEZONES.includes(defaultValues.timezone)
    ? TIMEZONES
    : [defaultValues.timezone, ...TIMEZONES];

  async function onSubmit(data: SettingsValues) {
    const res = await updateSettings(data);
    if (res.ok) {
      toast.success(res.message ?? "Settings saved");
    } else {
      if (res.fieldErrors) {
        for (const [key, message] of Object.entries(res.fieldErrors)) {
          setError(key as keyof SettingsValues, { message });
        }
      }
      toast.error(res.message ?? "Could not save settings");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Reminder email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                {...register("email")}
              />
            </div>
          </Field>

          <Field label="Timezone" error={errors.timezone?.message}>
            <Select {...register("timezone")}>
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ToggleRow
            label="Enable email reminders"
            description="Send an email at each medication time."
            checked={values.reminderEnabled}
            onChange={(v) => setValue("reminderEnabled", v, { shouldDirty: true })}
          />
          <div className="py-3">
            <Field label="Reminder timing" error={errors.reminderOffset?.message}>
              <Select {...register("reminderOffset")}>
                {REMINDER_OFFSETS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Summaries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Summary emails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ToggleRow
            label="Daily summary"
            description="A recap of the day's doses and wellness count."
            checked={values.dailySummaryEmail}
            onChange={(v) =>
              setValue("dailySummaryEmail", v, { shouldDirty: true })
            }
          />
          <div className="py-3">
            <Field
              label="Daily summary time"
              error={errors.dailySummaryTime?.message}
            >
              <Input
                type="time"
                className="max-w-[160px]"
                {...register("dailySummaryTime")}
              />
            </Field>
          </div>
          <ToggleRow
            label="Weekly summary"
            description="Every Sunday: adherence, streaks and totals."
            checked={values.weeklySummaryEmail}
            onChange={(v) =>
              setValue("weeklySummaryEmail", v, { shouldDirty: true })
            }
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-2 block">Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => {
              const active = values.theme === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue("theme", opt.value, { shouldDirty: true });
                    setTheme(opt.value);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-all",
                    active
                      ? "border-primary bg-primary/8 text-foreground ring-2 ring-primary/30"
                      : "border-[var(--border)] text-muted-foreground hover:bg-[var(--muted)]",
                  )}
                >
                  <Icon className="size-5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-20 flex justify-end lg:bottom-4">
        <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
