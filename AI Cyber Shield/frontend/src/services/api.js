import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 120000
});

export async function uploadImage(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
}

export async function uploadApk(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-apk", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
}

export async function downloadReportPdf(reportId, filename = "ai-cyber-shield-report.pdf") {
  const response = await api.get(`/reports/${reportId}/pdf`, {
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
