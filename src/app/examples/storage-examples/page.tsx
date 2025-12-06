"use client";

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import {
  uploadProductImage,
  uploadAvatar,
  uploadOrderDocument,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  listFiles,
  STORAGE_BUCKETS,
} from "@/lib/supabase-storage";
import ImageUpload from "@/app/components/ImageUpload";

const supabaseUrl = 'https://njejfdmqtnplfnomjyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function StorageExamplesPage() {
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setResults((prev) => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const handleProductImageUpload = async (file: File) => {
    const productId = prompt("Enter product ID:");
    if (!productId) return;

    const result = await uploadProductImage(file, productId);
    if (result.error) {
      addResult(`Upload failed: ${result.error.message}`, 'error');
    } else {
      addResult(`Product image uploaded: ${result.url}`, 'success');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) {
      addResult("Please log in to upload avatar", 'error');
      return;
    }

    const result = await uploadAvatar(file, user.id);
    if (result.error) {
      addResult(`Upload failed: ${result.error.message}`, 'error');
    } else {
      addResult(`Avatar uploaded: ${result.url}`, 'success');
      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: result.url },
      });
    }
  };

  const handleGetPublicUrl = () => {
    const path = prompt("Enter file path (e.g., product-123/image.jpg):");
    if (!path) return;

    const url = getPublicUrl(STORAGE_BUCKETS.PRODUCTS, path);
    addResult(`Public URL: ${url}`, 'success');
  };

  const handleGetSignedUrl = async () => {
    const path = prompt("Enter file path:");
    if (!path) return;

    const result = await getSignedUrl(STORAGE_BUCKETS.ORDER_DOCUMENTS, path, 3600);
    if (result.error) {
      addResult(`Failed: ${result.error.message}`, 'error');
    } else {
      addResult(`Signed URL (expires in 1 hour): ${result.url}`, 'success');
    }
  };

  const handleListFiles = async () => {
    const bucket = prompt("Enter bucket name (products, avatars, etc.):");
    if (!bucket) return;

    const result = await listFiles(bucket);
    if (result.error) {
      addResult(`Failed: ${result.error.message}`, 'error');
    } else {
      addResult(`Found ${result.files.length} files in ${bucket}`, 'success');
      console.log("Files:", result.files);
    }
  };

  const handleDeleteFile = async () => {
    const bucket = prompt("Enter bucket name:");
    const path = prompt("Enter file path:");
    if (!bucket || !path) return;

    const confirmDelete = confirm(`Delete ${path} from ${bucket}?`);
    if (!confirmDelete) return;

    const result = await deleteFile(bucket, path);
    if (result.error) {
      addResult(`Delete failed: ${result.error.message}`, 'error');
    } else {
      addResult(`File deleted successfully`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Supabase Storage Examples
          </h1>
          <p className="text-gray-600">
            Examples of how to use Supabase Storage in your application
          </p>
        </div>

        <div className="grid gap-6">
          {/* Product Image Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upload Product Image
            </h2>
            <ImageUpload
              onUpload={handleProductImageUpload}
              label="Product Image"
              maxSizeMB={5}
            />
          </div>

          {/* Avatar Upload */}
          {user && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Avatar
              </h2>
              <ImageUpload
                onUpload={handleAvatarUpload}
                label="Profile Picture"
                maxSizeMB={2}
                currentImageUrl={user.user_metadata?.avatar_url}
              />
            </div>
          )}

          {/* Utility Functions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Storage Utilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleGetPublicUrl}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
              >
                Get Public URL
              </button>
              <button
                onClick={handleGetSignedUrl}
                className="px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
              >
                Get Signed URL
              </button>
              <button
                onClick={handleListFiles}
                className="px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
              >
                List Files
              </button>
              <button
                onClick={handleDeleteFile}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
              >
                Delete File
              </button>
            </div>
          </div>

          {/* Results Log */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Results
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      result.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : result.type === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    <p>{result.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setResults([])}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Results
              </button>
            </div>
          )}

          {/* Documentation Link */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              📚 Documentation
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              For complete setup instructions, see{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">STORAGE_SETUP.md</code>
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Create storage buckets in Supabase dashboard</li>
              <li>Run the SQL policies from <code>seed/setup_storage.sql</code></li>
              <li>Use the utility functions from <code>lib/supabase-storage.ts</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

