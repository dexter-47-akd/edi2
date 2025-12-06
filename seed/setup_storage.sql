-- Supabase Storage Setup SQL
-- Run this in the Supabase SQL editor after creating the storage buckets

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC BUCKETS (products, avatars, reviews)
-- ============================================

-- Allow public read access for public buckets
CREATE POLICY "Public read access for products, avatars, reviews"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('products', 'avatars', 'reviews')
);

-- Allow authenticated users to upload to public buckets
CREATE POLICY "Authenticated users can upload to public buckets"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id IN ('products', 'avatars', 'reviews')
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update public bucket uploads"
ON storage.objects FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  bucket_id IN ('products', 'avatars', 'reviews')
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete public bucket uploads"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  bucket_id IN ('products', 'avatars', 'reviews')
);

-- ============================================
-- PRIVATE BUCKETS (order-documents)
-- ============================================

-- Allow users to read their own order documents
-- Files are stored in folders named by user_id: {user_id}/{order_id}/file.pdf
CREATE POLICY "Users can read own order documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload their own order documents
CREATE POLICY "Users can upload own order documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own order documents
CREATE POLICY "Users can update own order documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'order-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own order documents
CREATE POLICY "Users can delete own order documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'order-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ADMIN POLICIES (Optional - for admin users)
-- ============================================

-- If you have an admin role, you can add policies like this:
-- CREATE POLICY "Admins can manage all files"
-- ON storage.objects FOR ALL
-- USING (
--   auth.jwt() ->> 'role' = 'admin'
-- );

