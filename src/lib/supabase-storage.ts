/**
 * Supabase Storage Utility Functions
 * 
 * This file provides helper functions for working with Supabase Storage
 * including uploading files, getting public URLs, and managing file access.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njejfdmqtnplfnomjyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Storage bucket names - define your buckets here
 */
export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  AVATARS: 'avatars',
  ORDER_DOCUMENTS: 'order-documents',
  REVIEWS: 'reviews',
} as const;

/**
 * Upload a file to Supabase Storage
 * 
 * @param bucket - The storage bucket name
 * @param file - The file to upload (File object)
 * @param path - The path where the file should be stored (e.g., 'product-123/image.jpg')
 * @param options - Additional options for the upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  file: File,
  path: string,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  try {
    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error('File size exceeds 5MB limit'),
      };
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Unknown upload error'),
    };
  }
}

/**
 * Get a public URL for a file in storage
 * 
 * @param bucket - The storage bucket name
 * @param path - The path to the file
 * @returns The public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL for a file (temporary access, expires after specified time)
 * 
 * @param bucket - The storage bucket name
 * @param path - The path to the file
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns The signed URL
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { url: null, error };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Delete a file from storage
 * 
 * @param bucket - The storage bucket name
 * @param path - The path to the file to delete
 * @returns Success status
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: null } | { success: false; error: Error }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * List files in a storage bucket
 * 
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path to list files from
 * @returns Array of file objects
 */
export async function listFiles(
  bucket: string,
  folder?: string
): Promise<{ files: any[]; error: null } | { files: []; error: Error }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      return { files: [], error };
    }

    return { files: data || [], error: null };
  } catch (error) {
    return {
      files: [],
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Upload a product image
 * 
 * @param file - The image file
 * @param productId - The product ID
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `${productId}/${fileName}`;

  return uploadFile(STORAGE_BUCKETS.PRODUCTS, file, filePath, {
    contentType: file.type,
    cacheControl: '3600',
  });
}

/**
 * Upload a user avatar
 * 
 * @param file - The image file
 * @param userId - The user ID
 * @returns The public URL of the uploaded avatar
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  return uploadFile(STORAGE_BUCKETS.AVATARS, file, filePath, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: true, // Replace existing avatar
  });
}

/**
 * Upload an order document (receipt, invoice, etc.)
 * 
 * @param file - The document file
 * @param orderId - The order ID
 * @param documentType - Type of document (e.g., 'receipt', 'invoice')
 * @returns The public URL of the uploaded document
 */
export async function uploadOrderDocument(
  file: File,
  orderId: string,
  documentType: string = 'document'
): Promise<{ url: string; error: null } | { url: null; error: Error }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${documentType}-${Date.now()}.${fileExt}`;
  const filePath = `${orderId}/${fileName}`;

  return uploadFile(STORAGE_BUCKETS.ORDER_DOCUMENTS, file, filePath, {
    contentType: file.type,
    cacheControl: '86400', // 24 hours
  });
}

/**
 * Validate file type
 * 
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png'])
 * @returns Validation result
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  return { valid: true };
}

