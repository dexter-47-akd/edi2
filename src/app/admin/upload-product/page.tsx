"use client";

import { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { 
  uploadProductImage, 
  validateFileType, 
  validateFileSize,
  getPublicUrl,
  STORAGE_BUCKETS 
} from "@/lib/supabase-storage";

const supabaseUrl = 'https://njejfdmqtnplfnomjyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function UploadProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);
  const [productId, setProductId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const typeValidation = validateFileType(selectedFile, [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]);

    if (!typeValidation.valid) {
      setUploadStatus({
        success: false,
        message: typeValidation.error || 'Invalid file type',
      });
      return;
    }

    // Validate file size (5MB max)
    const sizeValidation = validateFileSize(selectedFile, 5);
    if (!sizeValidation.valid) {
      setUploadStatus({
        success: false,
        message: sizeValidation.error || 'File too large',
      });
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !productId.trim()) {
      setUploadStatus({
        success: false,
        message: 'Please select a file and enter a product ID',
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const result = await uploadProductImage(file, productId);

      if (result.error) {
        setUploadStatus({
          success: false,
          message: `Upload failed: ${result.error.message}`,
        });
      } else {
        setUploadStatus({
          success: true,
          message: 'Image uploaded successfully!',
          url: result.url,
        });

        // Optionally update the product in the database
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: result.url })
          .eq('id', productId);

        if (updateError) {
          console.error('Failed to update product:', updateError);
        }

        // Reset form
        setFile(null);
        setPreview(null);
        setProductId("");
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Product Image
          </h1>
          <p className="text-gray-600 mb-6">
            Upload product images to Supabase Storage
          </p>

          {/* Product ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product ID
            </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-input"
                      name="file-input"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !productId.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Image'
            )}
          </button>

          {/* Status Message */}
          {uploadStatus && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                uploadStatus.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-medium">{uploadStatus.message}</p>
              {uploadStatus.url && (
                <div className="mt-2">
                  <p className="text-sm font-mono break-all">{uploadStatus.url}</p>
                  <a
                    href={uploadStatus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View Image →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Usage Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Enter the product ID from your database</li>
              <li>Select an image file (PNG, JPG, WEBP, max 5MB)</li>
              <li>Click "Upload Image" to upload to Supabase Storage</li>
              <li>The product's image_url will be automatically updated</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

