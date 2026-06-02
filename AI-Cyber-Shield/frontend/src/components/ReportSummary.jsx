import { useState } from "react";
import { FiDownload, FiFileText, FiShield, FiClock } from "react-icons/fi";
import { downloadPdfReport } from "../services/api";

const ReportSummary = ({ report }) => {
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!report) return null;

  const handleDownload = async () => {
    setError("");
    setIsDownloading(true);
    try {
      const response = await downloadPdfReport({
        fileName: report.filename,
        scanDate: report.scanDate,
        threatScore: report.threatScore ?? 0,
        aiPrediction: report.analysisResult || report.status || "Analysis",
        details: report.details,
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${report.filename.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.response?.data?.detail || downloadError.message || "Unable to generate PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Latest report</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Report summary</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Review the most recent scan result, then download a polished PDF report with a structured threat summary and analysis details.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          <FiDownload />
          {isDownloading ? "Generating…" : "Download PDF report"}
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">File</p>
          <p className="mt-3 text-lg font-semibold text-white">{report.filename}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scan date</p>
          <p className="mt-3 text-lg font-semibold text-white">{new Date(report.scanDate).toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Threat score</p>
          <p className="mt-3 text-lg font-semibold text-white">{report.threatScore ?? "N/A"}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI prediction</p>
          <p className="mt-3 text-lg font-semibold text-white">{report.analysisResult || report.status || "Pending"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Risk level</p>
          <p className="mt-3 text-base font-semibold text-white">{report.riskLevel ?? "Not provided"}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Upload type</p>
          <p className="mt-3 text-base font-semibold text-white">{report.fileType}</p>
        </div>
      </div>

      {report.details && Object.keys(report.details).length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 text-sm text-slate-300">
          <div className="grid gap-2 bg-slate-900/80 px-5 py-4 text-slate-400 sm:grid-cols-2">
            <span className="font-semibold uppercase tracking-[0.24em]">Detail</span>
            <span className="font-semibold uppercase tracking-[0.24em]">Value</span>
          </div>
          <div className="divide-y divide-white/5 px-5 py-4">
            {Object.entries(report.details).map(([key, value]) => (
              <div key={key} className="grid gap-2 py-3 sm:grid-cols-2">
                <span className="text-slate-300">{key}</span>
                <span className="font-medium text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-400">
          <div className="inline-flex items-center gap-2 text-cyan-300">
            <FiFileText />
            <span>No analysis details available yet.</span>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-4 text-sm text-rose-300">{error}</p>
      ) : null}
    </section>
  );
};

export default ReportSummary;
