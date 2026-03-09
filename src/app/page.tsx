"use client";

import { usePrayers } from "@/hooks/usePrayers";
import NextPrayerCard from "@/components/NextPrayerCard";
import PrayerSchedule from "@/components/PrayerSchedule";

export default function Home() {
  // City is now hardcoded internally in the route as Rissani
  const { todaysSchedule, currentPrayer, nextPrayer, loading, error } = usePrayers();

  // Convert todaysSchedule down to the PrayerTimes object PrayerSchedule expects
  const prayersObj = todaysSchedule ? {
    fajr: todaysSchedule.fajr,
    dhuhr: todaysSchedule.dhuhr,
    asr: todaysSchedule.asr,
    maghrib: todaysSchedule.maghrib,
    isha: todaysSchedule.isha,
  } : null;

  return (
    <main className="min-h-screen bg-[#ece8dc] dark:bg-[#072611] text-[#0d3b1e] dark:text-[#ece8dc] transition-colors duration-500 py-10 px-4 md:px-8 relative overflow-x-hidden font-sans flex flex-col items-center justify-center">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-[#164e29]/10 to-transparent pointer-events-none" />
      <div className="fixed -top-60 -right-60 w-[500px] h-[500px] bg-islamic-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 -left-60 w-[500px] h-[500px] bg-islamic-green-light/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center gap-12">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-l from-islamic-green-dark to-islamic-green dark:from-islamic-gold-light dark:to-white drop-shadow-sm">
            مواقيت الصلاة
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-80 decoration-islamic-gold underline underline-offset-8">
            مدينة الريصاني
          </p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-medium px-6 py-4 rounded-2xl mb-6 text-center w-full max-w-lg backdrop-blur-md shadow-lg">
            حدث خطأ أثناء جلب مواقيت الصلاة: {error}
          </div>
        )}

        <div className="w-full space-y-12 flex flex-col items-center">
          <NextPrayerCard nextPrayer={nextPrayer} loading={loading} />
          
          <div className="w-full max-w-3xl flex items-center justify-center opacity-60">
            <div className="h-px bg-gradient-to-r from-transparent via-islamic-gold to-transparent flex-1" />
            <div className="mx-6 text-islamic-gold/80 text-xl">⭐</div>
            <div className="h-px bg-gradient-to-r from-transparent via-islamic-gold to-transparent flex-1" />
          </div>
          
          {/* We pass the reconstructed prayersObj to the schedule component */}
          <div className="w-full max-w-2xl">
            <PrayerSchedule prayers={prayersObj} currentPrayer={currentPrayer} loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
