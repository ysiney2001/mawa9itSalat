interface NextPrayerCardProps {
  nextPrayer: { key: string; name: string; time: string } | null;
  loading: boolean;
}

export default function NextPrayerCard({ nextPrayer, loading }: NextPrayerCardProps) {
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto aspect-[2/1] rounded-[3rem] bg-white/5 animate-pulse flex flex-col justify-center items-center shadow-2xl border border-white/5">
        <div className="h-10 w-40 bg-white/10 rounded-full mb-6" />
        <div className="h-20 w-64 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (!nextPrayer) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#0d3b1ea0] to-[#072611a0] backdrop-blur-2xl p-10 md:p-14 text-center text-white shadow-2xl border border-white/10 group">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-islamic-gold/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#164e29]/30 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 transition-transform duration-1000 group-hover:scale-110" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
          <span className="text-xl md:text-2xl opacity-90 font-medium text-islamic-beige">الصلاة القادمة</span>
        </div>
        <h2 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-islamic-gold-light via-islamic-gold to-white drop-shadow-lg mb-4 tracking-tight">
          {nextPrayer.name}
        </h2>
        <div className="text-8xl md:text-[10rem] font-bold tabular-nums drop-shadow-2xl text-white/95">
          {nextPrayer.time}
        </div>
      </div>
    </div>
  );
}
