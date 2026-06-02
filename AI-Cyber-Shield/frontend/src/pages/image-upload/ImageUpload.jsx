import UploadDropzone from "../../components/uploads/UploadDropzone";

const ImageUpload = ({ onUpload }) => {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-8 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Image upload</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Upload an image and receive a real threat score from the backend.
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Use the secure drag-and-drop flow below to submit an image, analyze it for hidden data, and review the threat score in a summary card.
        </p>
      </div>

      <UploadDropzone defaultType="image" onUpload={onUpload} />
    </div>
  );
};

export default ImageUpload;
