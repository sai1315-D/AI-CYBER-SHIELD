import { useState } from "react";
import Dashboard from "./pages/dashboard";
import ImageUpload from "./pages/image-upload";
import ReportSummary from "./components/ReportSummary";

const App = () => {
  const [latestReport, setLatestReport] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">AI Cyber Shield</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Secure image and APK threat analysis in one dashboard.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Upload images to the FastAPI backend and receive a threat score, live progress, and a result summary card.
            </p>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <ImageUpload onUpload={setLatestReport} />
          </div>
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white">How it works</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Upload an image file and receive a backend analysis result with threat scoring, hidden data detection, and detailed metrics.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white">Dashboard preview</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                The dashboard section below shows a modern cybersecurity interface built with Tailwind CSS and animated components.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <Dashboard />
        </section>

        <section className="mt-10">
          <ReportSummary report={latestReport} />
        </section>
      </div>
    </div>
  );
};

export default App;
