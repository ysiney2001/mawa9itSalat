import { useState, useEffect } from "react";
import { parse, isAfter, isBefore, differenceInSeconds, addDays } from "date-fns";

export type DailySchedule = {
  gregorianDay: number;
  fajr: string;
  shuruq?: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const prayerNamesAr: Record<PrayerKey, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

export function usePrayers() {
  const [monthSchedule, setMonthSchedule] = useState<DailySchedule[] | null>(null);
  const [todaysSchedule, setTodaysSchedule] = useState<DailySchedule | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPrayer, setCurrentPrayer] = useState<{ key: PrayerKey; name: string } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ key: PrayerKey; name: string; time: string } | null>(null);

  // Fetch full month
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/prayers`) // City is now hardcoded in the route
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: DailySchedule[]) => {
        if (mounted) {
          setMonthSchedule(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Timer loop & Date Matching
  useEffect(() => {
    if (!monthSchedule || monthSchedule.length === 0) return;

    const calculateTimes = () => {
      const now = new Date();
      const currentDayNumber = now.getDate();

      // Find today's and tomorrow's schedules
      const today = monthSchedule.find((s) => s.gregorianDay === currentDayNumber);
      
      // Handle end of month rollover safely by looking for next day or wrapping to 1
      let tomorrow = monthSchedule.find((s) => s.gregorianDay === (currentDayNumber + 1));
      if (!tomorrow && currentDayNumber > 27) {
         // If tomorrow isn't found and it's end of month, fallback to today to prevent crash
         // (Ideally, we'd fetch the next month's data, but Habous only shows current month)
         tomorrow = monthSchedule[0];
      }

      if (!today) {
        return; // Timetable likely hasn't updated for the new month on Habous yet
      }

      setTodaysSchedule(today);

      const orderedKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      
      let currentP: PrayerKey = "isha"; // Default to previous day's isha
      let nextP: PrayerKey = "fajr";
      let nextPTimeStr = today.fajr;

      const timesAsDates = orderedKeys.map((key) => {
        return parse(today[key], "HH:mm", new Date());
      });

      // Find current and next
      let foundNext = false;
      for (let i = 0; i < orderedKeys.length; i++) {
        if (isBefore(now, timesAsDates[i])) {
          nextP = orderedKeys[i];
          nextPTimeStr = today[nextP];
          currentP = i === 0 ? "isha" : orderedKeys[i - 1]; // if before fajr, current is isha
          foundNext = true;
          break;
        }
      }

      // If we are currently after today's Isha, the next is tomorrow's Fajr
      if (!foundNext) {
        nextP = "fajr";
        currentP = "isha";
        if (tomorrow) {
          nextPTimeStr = tomorrow.fajr;
        } else {
          nextPTimeStr = today.fajr; // Safe fallback
        }
      }

      setCurrentPrayer({ key: currentP, name: prayerNamesAr[currentP] });
      setNextPrayer({ key: nextP, name: prayerNamesAr[nextP], time: nextPTimeStr });
    };

    // Run immediately then every 10 seconds to check for prayer transitions
    calculateTimes();
    const interval = setInterval(calculateTimes, 10000);

    return () => clearInterval(interval);
  }, [monthSchedule]);

  return { todaysSchedule, currentPrayer, nextPrayer, loading, error };
}
