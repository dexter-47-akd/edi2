"use client";

import { useState, useRef } from "react";
import { validateFileType, validateFileSize } from "@/lib/supabase-storage";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentImageUrl?: string;
  label?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  bucket?: string;
}

export default function ImageUpload({
  onUpload,
  currentImageUrl,
  label = "Upload Image",
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  bucket,
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    // Validate file type
    const typeValidation = validateFileType(selectedFile, acceptedTypes);
    if (!typeValidation.valid) {
      setError(typeValidation.error || "Invalid file type");
      return;
    }

    // Validate file size
    const sizeValidation = validateFileSize(selectedFile, maxSizeMB);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error || "File too large");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
      // Reset after successful upload
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(currentImageUrl || null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Current Image or Preview */}
      {preview && (
        <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {file && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* File Input */}
      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer">
          <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors text-center">
            <svg
              className="mx-auto h-8 w-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-gray-600">
              {file ? file.name : "Choose file or drag and drop"}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.join(", ").replace(/image\//g, "").toUpperCase()} up to {maxSizeMB}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={handleFileChange}
          />
        </label>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

