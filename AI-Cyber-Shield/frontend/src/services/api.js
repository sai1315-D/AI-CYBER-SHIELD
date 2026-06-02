import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Accept": "application/json",
  },
});

export const uploadImage = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

export const uploadApk = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/upload-apk", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

export const downloadPdfReport = ({ fileName, scanDate, threatScore, aiPrediction, details }) => {
  return client.post(
    "/reports/pdf",
    {
      file_name: fileName,
      scan_date: scanDate,
      threat_score: threatScore,
      ai_prediction: aiPrediction,
      details,
    },
    {
      responseType: "blob",
    }
  );
};
