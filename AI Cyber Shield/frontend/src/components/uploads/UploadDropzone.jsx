import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFile,
  FiImage,
  FiShield,
  FiUploadCloud,
  FiX
} from "react-icons/fi";
import { downloadReportPdf, uploadApk, uploadImage } from "../../services/api.js";

const limits = {
  image: {
    label: "Image",
    accept: "image/png,image/jpeg,image/webp",
    maxSize: 10 * 1024 * 1024,
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    icon: FiImage,
    helper: "PNG, JPG, JPEG, or WEBP up to 10 MB"
  },
  apk: {
    label: "APK",
    accept: ".apk,application/vnd.android.package-archive",
    maxSize: 150 * 1024 * 1024,
    extensions: [".apk"],
    icon: FiFile,
    helper: "Android APK file up to 150 MB"
  }
};

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function validateFile(file, config) {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = config.extensions.some((extension) => name.endsWith(extension));
  const hasAllowedType =
    config.label === "Image" ? file.type.startsWith("image/") : file.type.includes("android");

  if (!hasAllowedExtension && !hasAllowedType) {
    return `Select a valid ${config.label.toLowerCase()} file.`;
  }

  if (file.size > config.maxSize) {
    return `${config.label} file must be under ${formatBytes(config.maxSize)}.`;
  }

  return "";
}

function ThreatScoreGauge({ score }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const stroke =
    score >= 70 ? "#fb7185" : score >= 35 ? "#fbbf24" : "#5eead4";

  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.18)"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="absolute text-center"
      >
        <p className="text-3xl font-semibold text-white">{score}%</p>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Threat</p>
      </motion.div>
    </div>
  );
}

export default function UploadDropzone({ type = "image" }) {
  const config = limits[type] ?? limits.image;
  const Icon = config.icon;
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const uploadFile = async (nextFile) => {
    setFile(nextFile);
    setResult(null);
    setProgress(0);
    setUploading(true);
    setMessage({ type: "info", text: `Uploading ${nextFile.name}...` });

    try {
      const uploadHandler = type === "image" ? uploadImage : uploadApk;
      const data = await uploadHandler(nextFile, (event) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded * 100) / event.total));
      });

      setProgress(100);
      setResult(data.file);
      setMessage({
        type: "success",
        text:
          type === "image"
            ? "Image uploaded and scanned successfully."
            : "APK uploaded successfully."
      });
    } catch (error) {
      const detail = error.response?.data?.detail;
      const fallback = `Unable to upload ${config.label.toLowerCase()}. Check the backend server and try again.`;
      setProgress(0);
      setResult(null);
      setMessage({
        type: "error",
        text: Array.isArray(detail) ? detail[0]?.msg || fallback : detail || fallback
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (nextFile) => {
    if (!nextFile) return;

    const error = validateFile(nextFile, config);
    if (error) {
      setFile(null);
      setProgress(0);
      setResult(null);
      setMessage({ type: "error", text: error });
      return;
    }

    uploadFile(nextFile);
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setMessage(null);
    setResult(null);
    setUploading(false);
    setDownloading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDownloadPdf = async () => {
    if (!result?.id) return;

    setDownloading(true);
    try {
      const safeName = result.original_filename?.replace(/\.[^/.]+$/, "") || "scan-report";
      await downloadReportPdf(result.id, `${safeName}-ai-cyber-shield-report.pdf`);
    } catch (error) {
      const detail = error.response?.data?.detail;
      setMessage({
        type: "error",
        text: detail || "Unable to download PDF report. Please try again."
      });
    } finally {
      setDownloading(false);
    }
  };

  const scan = result?.scan;
  const threatScore = scan?.threat_score ?? 0;
  const scoreBarClass =
    threatScore >= 70
      ? "bg-gradient-to-r from-rose-400 to-red-300"
      : threatScore >= 35
        ? "bg-gradient-to-r from-amber-300 to-orange-300"
        : "bg-gradient-to-r from-emerald-300 to-teal-300";
  const scoreBorderClass =
    threatScore >= 70
      ? "bg-gradient-to-r from-rose-400 to-red-300"
      : threatScore >= 35
        ? "bg-gradient-to-r from-amber-300 to-orange-300"
        : "bg-gradient-to-r from-emerald-300 to-teal-300";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.07] p-5 shadow-card backdrop-blur-xl"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
        animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            animate={{ y: type === "image" ? [0, -4, 0] : [0, 3, 0] }}
            transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/10 text-xl text-teal-100"
          >
            <Icon />
          </motion.div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white">Upload {config.label}</h3>
            <p className="truncate text-sm text-slate-400">{config.helper}</p>
          </div>
        </div>

        {file && (
          <button
            aria-label={`Remove ${config.label}`}
            onClick={reset}
            disabled={uploading}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-slate-950/45 text-slate-300 transition hover:border-rose-300/40 hover:text-rose-100"
          >
            <FiX />
          </button>
        )}
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (uploading) return;
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`relative mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-5 text-center transition ${
          dragging
            ? "border-teal-200 bg-teal-300/15 shadow-glow"
            : "border-white/15 bg-slate-950/35 hover:border-teal-300/45 hover:bg-teal-300/10"
        }`}
      >
        {(uploading || dragging) && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-cyan-200/15 to-transparent"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 1.25, repeat: Infinity, ease: "linear" }}
          />
        )}
        <motion.div
          className="pointer-events-none absolute inset-4 rounded-lg border border-cyan-200/10"
          animate={{ opacity: [0.2, 0.65, 0.2], scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          disabled={uploading}
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <motion.div
          animate={{
            y: dragging ? -4 : 0,
            scale: dragging ? 1.06 : uploading ? [1, 1.08, 1] : 1,
            rotate: uploading ? [0, -3, 3, 0] : 0
          }}
          transition={{ duration: uploading ? 1.2 : 0.25, repeat: uploading ? Infinity : 0 }}
          className="relative grid h-14 w-14 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-100"
        >
          {uploading && (
            <motion.span
              className="absolute inset-[-7px] rounded-lg border border-cyan-200/25"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <FiUploadCloud />
        </motion.div>
        <p className="mt-4 text-sm font-semibold text-white">
          {uploading ? "Uploading to AI Cyber Shield..." : "Drag and drop or click to browse"}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
          {file ? `${file.name} - ${formatBytes(file.size)}` : config.helper}
        </p>
      </label>

      {file && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Upload Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-950/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300"
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {type === "image" && scan && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="mt-5 overflow-hidden rounded-lg border border-white/12 bg-slate-950/45 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Scan Result
                </p>
                <h4 className="mt-2 text-xl font-semibold text-white">{scan.status}</h4>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className={`rounded-lg ${scoreBorderClass} p-px`}>
                  <div className="rounded-lg bg-slate-950 px-4 py-2 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Threat
                    </p>
                    <p className="text-2xl font-semibold text-white">{threatScore}%</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="flex h-9 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiDownload />
                  {downloading ? "Generating" : "PDF"}
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <ThreatScoreGauge score={threatScore} />
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${threatScore}%` }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className={`h-full rounded-full ${scoreBarClass}`}
                  />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Histogram
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {scan.histogram_anomaly_score ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      LSB Uniformity
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {scan.lsb_uniformity_score ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entropy</p>
                <p className="mt-1 font-semibold text-white">{scan.entropy ?? "N/A"}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  LSB Entropy
                </p>
                <p className="mt-1 font-semibold text-white">{scan.lsb_entropy ?? "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FiShield className="text-teal-200" />
                Findings
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                {(scan.findings || []).map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.text}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`mt-4 flex items-start gap-3 rounded-lg border p-3 text-sm ${
              message.type === "error"
                ? "border-rose-300/25 bg-rose-400/10 text-rose-100"
                : message.type === "success"
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                  : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
            }`}
          >
            {message.type === "error" ? (
              <FiAlertCircle className="mt-0.5 shrink-0" />
            ) : (
              <FiCheckCircle className="mt-0.5 shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
