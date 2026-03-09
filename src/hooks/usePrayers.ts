import { useState, useEffect } from "react";

export type DailySchedule = {
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
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

      // Get current date in Morocco
      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Casablanca',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const [dayStr, monthStr, yearStr] = dateFormatter.format(now).split('/');
      const currentDayNumber = parseInt(dayStr, 10);
      const currentMonthNumber = parseInt(monthStr, 10);
      const currentYearNumber = parseInt(yearStr, 10);

      // Find today's and tomorrow's schedules
      const today = monthSchedule.find(
        (s) => s.gregorianDay === currentDayNumber && s.gregorianMonth === currentMonthNumber && s.gregorianYear === currentYearNumber
      );
      
      const tomorrowDate = new Date(now);
      tomorrowDate.setDate(now.getDate() + 1);
      const [tDay, tMonth, tYear] = dateFormatter.format(tomorrowDate).split('/');
      const tomorrowDayNumber = parseInt(tDay, 10);
      const tomorrowMonthNumber = parseInt(tMonth, 10);
      const tomorrowYearNumber = parseInt(tYear, 10);

      let tomorrow = monthSchedule.find(
        (s) => s.gregorianDay === tomorrowDayNumber && s.gregorianMonth === tomorrowMonthNumber && s.gregorianYear === tomorrowYearNumber
      );
      
      if (!tomorrow) {
         // If tomorrow isn't found, fallback to today to prevent crash
         // (Ideally, we'd fetch the next month's data, but Habous only shows current month)
         tomorrow = monthSchedule[0];
      }

      if (!today) {
        return; // Timetable likely hasn't updated for the new month on Habous yet
      }

      let activeSchedule = today;

      const orderedKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      
      let currentP: PrayerKey = "isha"; // Default to previous day's isha
      let nextP: PrayerKey = "fajr";
      let nextPTimeStr = today.fajr;

      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Casablanca',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const currentTimeStr = timeFormatter.format(now);

      // Find current and next
      let foundNext = false;
      for (let i = 0; i < orderedKeys.length; i++) {
        const key = orderedKeys[i];
        if (currentTimeStr < today[key]) {
          nextP = key;
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
          activeSchedule = tomorrow;
        } else {
          nextPTimeStr = today.fajr; // Safe fallback
        }
      }

      setTodaysSchedule(activeSchedule);
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

