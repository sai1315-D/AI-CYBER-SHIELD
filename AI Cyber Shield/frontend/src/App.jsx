import {
  FiActivity,
  FiAlertTriangle,
  FiCpu,
  FiImage,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiUploadCloud
} from "react-icons/fi";
import { motion } from "framer-motion";
import UploadDropzone from "./components/uploads/UploadDropzone.jsx";

const particles = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${(index * 47) % 100}%`,
  size: 2 + (index % 3),
  duration: 7 + (index % 6),
  delay: -(index % 8)
}));

const cards = [
  {
    title: "Upload Image",
    value: "Stego Scan",
    detail: "Analyze images for hidden payloads and suspicious bit patterns.",
    icon: FiImage,
    accent: "from-teal-400 to-cyan-300",
    status: "Ready"
  },
  {
    title: "Upload APK",
    value: "Malware Check",
    detail: "Inspect Android packages for risky permissions and signatures.",
    icon: FiUploadCloud,
    accent: "from-blue-400 to-indigo-300",
    status: "Secure"
  },
  {
    title: "Threat Score",
    value: "28%",
    detail: "Current environment risk based on recent scan signals.",
    icon: FiAlertTriangle,
    accent: "from-amber-300 to-rose-300",
    status: "Moderate"
  },
  {
    title: "Scan History",
    value: "1,248",
    detail: "Completed scans across image and APK inspection modules.",
    icon: FiActivity,
    accent: "from-emerald-300 to-lime-300",
    status: "Live"
  }
];

const recentScans = [
  ["image_ledger.png", "Clean", "2 min ago"],
  ["finance_app.apk", "Review", "11 min ago"],
  ["profile_qr.jpg", "Clean", "26 min ago"],
  ["wallet_update.apk", "Blocked", "1 hr ago"]
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
};

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-cyber-grid bg-[length:34px_34px] opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,184,166,0.16),transparent_30%,rgba(59,130,246,0.12)_58%,transparent_78%)]" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan-200/50 shadow-[0_0_14px_rgba(103,232,249,0.55)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [-18, 18, -18],
            x: [0, particle.id % 2 === 0 ? 12 : -12, 0],
            opacity: [0.16, 0.76, 0.16],
            scale: [1, 1.7, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute inset-x-[-20%] top-1/3 h-24 -rotate-6 animate-drift bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent blur-xl" />
      <div className="absolute inset-y-0 left-1/4 w-px animate-drift bg-gradient-to-b from-transparent via-teal-300/20 to-transparent [animation-delay:-4s]" />
      <div className="absolute inset-y-0 right-1/3 w-px animate-drift bg-gradient-to-b from-transparent via-blue-300/20 to-transparent [animation-delay:-2s]" />
      <div className="absolute left-0 top-24 h-px w-full animate-pulse-line bg-gradient-to-r from-transparent via-teal-300/70 to-transparent" />
    </div>
  );
}

function StatCard({ card }) {
  const Icon = card.icon;

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.07] p-5 shadow-card backdrop-blur-xl"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
      <motion.div
        className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent opacity-0 group-hover:opacity-100"
        animate={{ x: ["-120%", "520%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">{card.title}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
            {card.value}
          </h2>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-slate-950/50 text-xl text-teal-200 shadow-glow">
          <motion.div
            animate={{ rotate: card.title === "Threat Score" ? [0, 6, -6, 0] : 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon />
          </motion.div>
        </div>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">{card.detail}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</span>
        <span className="rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">
          {card.status}
        </span>
      </div>
    </motion.article>
  );
}

function App() {
  return (
    <main className="min-h-screen overflow-hidden font-display text-slate-100">
      <Background />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative grid h-11 w-11 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/10 text-2xl text-teal-200 shadow-glow"
            >
              <motion.span
                className="absolute inset-[-5px] rounded-lg border border-cyan-200/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.75, 0.12, 0.75] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              />
              <FiShield />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
                AI Cyber Shield
              </h1>
              <p className="text-sm text-slate-400">Threat intelligence dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.07] text-slate-200 backdrop-blur-xl transition hover:border-teal-300/40 hover:text-teal-100">
              <FiRefreshCw />
            </button>
            <button className="flex h-10 items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-4 text-sm font-semibold text-teal-100 backdrop-blur-xl transition hover:bg-teal-300/15">
              <FiLock />
              Secure Mode
            </button>
          </div>
        </motion.header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="mb-6 overflow-hidden rounded-lg border border-white/12 bg-white/[0.07] p-5 shadow-card backdrop-blur-xl sm:p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-200">
                    Active Defense
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                    Monitor uploads, malware signals, and live threat posture.
                  </h2>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FiCpu className="text-2xl text-cyan-200" />
                    </motion.div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        AI Engine
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {cards.map((card) => (
                <StatCard card={card} key={card.title} />
              ))}
            </motion.div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <UploadDropzone type="image" />
              <UploadDropzone type="apk" />
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
            className="rounded-lg border border-white/12 bg-white/[0.07] p-5 shadow-card backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Scan History</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Latest Events</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <FiActivity />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentScans.map(([name, status, time]) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  className="rounded-lg border border-white/10 bg-slate-950/40 p-4"
                  key={name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{name}</p>
                      <p className="mt-1 text-xs text-slate-500">{time}</p>
                    </div>
                    <span
                      className={
                        status === "Blocked"
                          ? "rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-semibold text-rose-200"
                          : status === "Review"
                            ? "rounded-full bg-amber-300/15 px-2.5 py-1 text-xs font-semibold text-amber-100"
                            : "rounded-full bg-emerald-300/15 px-2.5 py-1 text-xs font-semibold text-emerald-100"
                      }
                    >
                      {status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}

export default App;
