import { PrayerKey } from "@/hooks/usePrayers";
import { cn } from "@/lib/utils";

const prayerNamesAr: Record<PrayerKey, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

interface PrayerScheduleProps {
  prayers: Record<PrayerKey, string> | null;
  nextPrayer: { key: PrayerKey; name: string } | null;
  loading: boolean;
}

export default function PrayerSchedule({ prayers, nextPrayer, loading }: PrayerScheduleProps) {
  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (!prayers) return null;

  const prayerItems: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  return (
    <div className="w-full space-y-3">
      {prayerItems.map((key) => {
        const isNext = nextPrayer?.key === key;
        return (
          <div
            key={key}
            className={cn(
              "flex justify-between items-center px-8 py-5 rounded-[2rem] transition-all duration-500",
              isNext
                ? "bg-gradient-to-r from-islamic-gold-light to-islamic-gold text-white shadow-xl scale-[1.03] ring-1 ring-white/20"
                : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20"
            )}
          >
            <span className={cn("text-2xl", isNext ? "font-bold" : "font-medium opacity-90")}>
              {prayerNamesAr[key]}
            </span>
            <span className={cn("text-3xl font-bold tabular-nums", isNext ? "" : "opacity-80")}>
              {prayers[key]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
