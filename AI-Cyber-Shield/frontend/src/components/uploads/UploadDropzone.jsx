import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiFileText, FiImage } from "react-icons/fi";
import { uploadImage, uploadApk, downloadPdfReport } from "../../services/api";

const ACCEPTED_TYPES = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
  apk: ["application/vnd.android.package-archive", "application/octet-stream"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const validateFile = (file, type) => {
  if (!file) return "No file selected.";
  if (file.size > MAX_FILE_SIZE) return "File exceeds the 50MB size limit.";
  if (!ACCEPTED_TYPES[type].includes(file.type)) {
    return type === "image"
      ? "Please upload a valid image file (PNG, JPG, WEBP, GIF)."
      : "Please upload a valid APK file.";
  }
  return "";
};

const UploadDropzone = ({ defaultType = "image", onUpload }) => {
  const [uploadType, setUploadType] = useState(defaultType);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [resultCard, setResultCard] = useState(null);
  const inputRef = useRef(null);

  const acceptedFormats = useMemo(
    () => ACCEPTED_TYPES[uploadType].join(", "),
    [uploadType]
  );

  const handleUpload = async (selectedFile) => {
    const validationError = validateFile(selectedFile, uploadType);
    setErrorMessage(validationError);
    setSuccessMessage("");
    setResultCard(null);
    if (validationError) return;

    setFile(selectedFile);
    setProgress(0);

    try {
      const onUploadProgress = (event) => {
        if (!event.lengthComputable) return;
        setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      };

      const method = uploadType === "image" ? uploadImage : uploadApk;
      const response = await method(selectedFile, onUploadProgress);

      const data = response.data || {};
      const score = data.threat_score ?? data.risk_score ?? null;
      const status = data.analysis_result ?? data.result ?? (score !== null ? "Analyzed" : "Uploaded");

      const reportPayload = {
        filename: selectedFile.name,
        fileType: uploadType,
        threatScore: score ?? 0,
        status,
        analysisResult: status,
        details: data.details || {},
        riskLevel: data.risk_level ?? data.riskLevel ?? null,
        scanDate: new Date().toISOString(),
      };

      setSuccessMessage(`${selectedFile.name} uploaded successfully.`);
      setErrorMessage("");
      setResultCard(reportPayload);

      if (typeof onUpload === "function") {
        onUpload(reportPayload);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || error.message || "Upload failed."
      );
      setSuccessMessage("");
      setProgress(0);
    }
  };

  const handleFileSelection = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) handleUpload(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) handleUpload(droppedFile);
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl text-white">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-cyan-300/80">Secure upload</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Image & APK upload</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Drag files here or choose them manually. We validate file type, call the API, and show a result card after upload.
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-slate-900/70 text-sm shadow-inner shadow-slate-950/20">
          <button
            type="button"
            className={`px-4 py-2 transition ${uploadType === "image" ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
            onClick={() => setUploadType("image")}
          >
            Image
          </button>
          <button
            type="button"
            className={`px-4 py-2 transition ${uploadType === "apk" ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
            onClick={() => setUploadType("apk")}
          >
            APK
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`group relative min-h-[260px] rounded-[2rem] border-2 bg-slate-900/70 p-8 transition-all duration-300 ${
          dragActive ? "border-cyan-400/70 bg-cyan-400/10" : "border-white/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          className="hidden"
          onChange={handleFileSelection}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
            {uploadType === "image" ? <FiImage size={28} /> : <FiFileText size={28} />}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">Drag and drop your file here</p>
            <p className="mt-2 text-sm text-slate-400">
              Accepts {uploadType === "image" ? "images" : "APK files"}. Max size 50MB.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <FiUploadCloud size={18} /> Choose file
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/10 via-transparent to-violet-500/5 opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      <AnimatePresence mode="wait">
        {errorMessage ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-5 flex items-center gap-3 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          >
            <FiXCircle size={20} className="text-rose-300" />
            <span>{errorMessage}</span>
          </motion.div>
        ) : null}

        {successMessage ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-5 flex items-center gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
          >
            <FiCheckCircle size={20} className="text-emerald-300" />
            <span>{successMessage}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {resultCard ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Result card</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{resultCard.fileType === "image" ? "Image Analysis" : "APK Upload"}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {resultCard.fileType === "image" ? "Threat score and upload status from the backend." : "APK upload response from the backend."}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-5 py-3 text-right text-sm text-slate-300">
              <p className="font-semibold text-white">Status</p>
              <p className="mt-2 text-base text-cyan-300">{resultCard.status}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">File</p>
              <p className="mt-3 text-base font-semibold text-white">{resultCard.filename}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Type</p>
              <p className="mt-3 text-base font-semibold text-white">{resultCard.fileType}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Threat score</p>
              <p className="mt-3 text-base font-semibold text-white">
                {resultCard.threatScore ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Generate a PDF summary of this scan result.</p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await downloadPdfReport({
                    fileName: resultCard.filename,
                    scanDate: new Date().toISOString(),
                    threatScore: resultCard.threatScore ?? 0,
                    aiPrediction: resultCard.analysisResult || resultCard.status,
                  });

                  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `report_${resultCard.filename.replace(/\s+/g, "_")}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (downloadError) {
                  setErrorMessage(
                    downloadError.response?.data?.detail || downloadError.message || "Unable to generate PDF report."
                  );
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Download PDF report
            </button>
          </div>
        </motion.div>
      ) : null}

      <div className="mt-6 rounded-3xl bg-slate-900/80 p-4">
        <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
          <span>Upload progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;
