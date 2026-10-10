import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentFileName?: string;
  currentUploadedAt?: string;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  onFileRemove,
  currentFileName,
  currentUploadedAt,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF documents are allowed (TRD.md §3).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds 2 MB limit (max 2,097,152 bytes).");
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onFileRemove) onFileRemove();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Drop Target Area */}
      {!selectedFile && !currentFileName ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-150",
            isDragging
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-300 hover:border-slate-400 bg-white"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Click to upload resume or drag and drop
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PDF format only, maximum 2 MB (Rules.md §4.3)
          </p>
        </div>
      ) : (
        /* File Card when already attached */
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {selectedFile ? selectedFile.name : currentFileName || "Resume.pdf"}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                {selectedFile ? (
                  `${(selectedFile.size / 1024).toFixed(1)} KB`
                ) : (
                  `Uploaded on ${currentUploadedAt ? new Date(currentUploadedAt).toLocaleDateString() : "Active"}`
                )}
                <span className="text-emerald-600 font-sans font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified PDF
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7"
            >
              Replace
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
