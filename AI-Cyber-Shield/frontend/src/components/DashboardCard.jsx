import { motion } from "framer-motion";

const DashboardCard = ({ icon: Icon, title, value, description, cta }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-70" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/90">
            {title}
          </p>
          <h3 className="mt-4 text-3xl font-semibold text-white">{value}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
          <Icon size={28} />
        </div>
      </div>
      {cta ? (
        <button className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300">
          {cta}
        </button>
      ) : null}
    </motion.div>
  );
};

export default DashboardCard;
