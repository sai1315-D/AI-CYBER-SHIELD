import { motion } from "framer-motion";
import { FiImage, FiCpu, FiShield, FiDatabase } from "react-icons/fi";
import DashboardCard from "../../components/DashboardCard";

const cards = [
  {
    title: "Upload Image",
    value: "Secure upload",
    description: "Scan and analyze suspicious image payloads with AI-assisted malware detection.",
    icon: FiImage,
    cta: "Upload image",
  },
  {
    title: "Upload APK",
    value: "APK analysis",
    description: "Inspect APK files for hidden threats, permissions risks, and obfuscated payloads.",
    icon: FiCpu,
    cta: "Upload APK",
  },
  {
    title: "Threat Score",
    value: "92% Safe",
    description: "Threat confidence level derived from multi-vector behavioral and static scans.",
    icon: FiShield,
    cta: "View report",
  },
  {
    title: "Scan History",
    value: "18 reports",
    description: "Review your recent inspections and threat decisions across all uploads.",
    icon: FiDatabase,
    cta: "Open history",
  },
];

const particles = [
  { top: "10%", left: "12%", size: 3, delay: 0 },
  { top: "22%", left: "78%", size: 2, delay: 1 },
  { top: "45%", left: "18%", size: 2.5, delay: 0.6 },
  { top: "68%", left: "82%", size: 3.5, delay: 1.3 },
  { top: "74%", left: "40%", size: 2, delay: 0.9 },
  { top: "30%", left: "52%", size: 3, delay: 0.3 },
  { top: "55%", left: "65%", size: 2.5, delay: 1.1 },
  { top: "82%", left: "22%", size: 2, delay: 0.4 },
  { top: "14%", left: "62%", size: 3, delay: 0.8 },
  { top: "60%", left: "8%", size: 2.8, delay: 1.5 },
];

const Dashboard = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.14),_transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.96))]" />
      <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-24 top-32 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

      {particles.map((particle, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 0, scale: 0.7 }}
          animate={{ opacity: [0.16, 0.8, 0.16], y: [0, -18, 0], scale: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 8 + index * 0.4, delay: particle.delay, ease: "easeInOut" }}
          className="absolute rounded-full bg-cyan-300/40 blur-sm"
          style={{ top: particle.top, left: particle.left, width: `${particle.size}px`, height: `${particle.size}px` }}
        />
      ))}

      <motion.div
        initial={{ y: 0, rotate: -10 }}
        animate={{ y: [0, -16, 0], rotate: [-10, 8, -10] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute right-10 top-28 z-10"
      >
        <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] border border-cyan-300/10 bg-slate-950/80 shadow-[0_0_60px_rgba(56,189,248,0.18)] backdrop-blur-xl">
          <FiShield className="h-16 w-16 text-cyan-300" />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-end"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-6 h-1 overflow-hidden opacity-60">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
                className="absolute left-0 top-0 h-full w-28 rounded-full bg-cyan-300/40 blur-xl"
              />
            </div>
            <p className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.26em] text-cyan-200/90">
              Cyber Shield
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Modern Cybersecurity Dashboard with intelligent threat insights.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Designed for security operators who need fast visibility, secure uploads, and adaptive analysis in one polished interface.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_40px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-400/10 to-transparent" />
            <p className="relative text-sm uppercase tracking-[0.3em] text-slate-400">Live threat pulse</p>
            <div className="relative mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold text-white">7.2</p>
                <p className="mt-2 text-sm text-slate-400">Average risk index</p>
              </div>
              <div className="rounded-3xl bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                Active mode
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between gap-4">
              <div className="relative h-36 w-36 rounded-full bg-slate-950/90 p-4 ring-1 ring-white/10">
                <div className="absolute inset-4 rounded-full border border-cyan-400/20" />
                <motion.div
                  initial={{ rotate: -130 }}
                  animate={{ rotate: 30 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 h-28 w-1 -translate-x-1/2 -translate-y-full rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.9)]"
                />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <p className="text-3xl font-semibold text-white">92%</p>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Threat gauge</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scan status</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Active scan", value: "Scanning" },
                    { label: "Hidden data", value: "No anomalies" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm text-slate-300">
                      <span>{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-10 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-[0_40px_80px_rgba(15,23,42,0.28)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Threat intelligence summary</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Real-time scan analytics and security posture insights with an immersive glassmorphism layout built for modern incident response.
              </p>
            </div>
            <button className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Explore analytics
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Blocked threats", value: "128", accent: "from-cyan-400 via-sky-400 to-blue-500" },
              { label: "Suspicious files", value: "42", accent: "from-violet-500 via-fuchsia-500 to-pink-500" },
              { label: "Policies enforced", value: "9", accent: "from-emerald-400 via-lime-400 to-yellow-300" },
              { label: "Alerts today", value: "17", accent: "from-rose-500 via-orange-500 to-amber-400" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                <div className={`mt-5 h-2 rounded-full bg-gradient-to-r ${item.accent}`} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
