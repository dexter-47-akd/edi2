# Supabase Storage Setup Guide

This guide explains how to set up and use Supabase Storage in your e-commerce project.

## 1. Create Storage Buckets in Supabase

First, you need to create storage buckets in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** and create the following buckets:

### Required Buckets:

- **`products`** - For product images
  - Public: ✅ Yes (so images can be accessed via public URLs)
  - File size limit: 5MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

- **`avatars`** - For user profile pictures
  - Public: ✅ Yes
  - File size limit: 2MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

- **`order-documents`** - For order receipts, invoices, etc.
  - Public: ❌ No (private, requires authentication)
  - File size limit: 10MB
  - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

- **`reviews`** - For review images
  - Public: ✅ Yes
  - File size limit: 5MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## 2. Set Up Storage Policies (RLS)

After creating buckets, you need to set up Row Level Security (RLS) policies:

### For Public Buckets (products, avatars, reviews):

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products' OR bucket_id = 'avatars' OR bucket_id = 'reviews');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (bucket_id = 'products' OR bucket_id = 'avatars' OR bucket_id = 'reviews')
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  (bucket_id = 'products' OR bucket_id = 'avatars' OR bucket_id = 'reviews')
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (bucket_id = 'products' OR bucket_id = 'avatars' OR bucket_id = 'reviews')
);
```

### For Private Buckets (order-documents):

```sql
-- Allow users to read their own order documents
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
```

## 3. Using Storage in Your Code

### Basic Usage Examples

#### Upload a Product Image

```typescript
import { uploadProductImage } from '@/lib/supabase-storage';

const file = event.target.files[0];
const productId = 'your-product-id';

const result = await uploadProductImage(file, productId);

if (result.error) {
  console.error('Upload failed:', result.error);
} else {
  console.log('Image URL:', result.url);
  // Update your product in the database with this URL
}
```

#### Get Public URL

```typescript
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/supabase-storage';

const imageUrl = getPublicUrl(STORAGE_BUCKETS.PRODUCTS, 'product-123/image.jpg');
```

#### Get Signed URL (for private files)

```typescript
import { getSignedUrl, STORAGE_BUCKETS } from '@/lib/supabase-storage';

const result = await getSignedUrl(
  STORAGE_BUCKETS.ORDER_DOCUMENTS,
  'order-123/receipt.pdf',
  3600 // expires in 1 hour
);

if (!result.error) {
  console.log('Signed URL:', result.url);
}
```

#### Delete a File

```typescript
import { deleteFile, STORAGE_BUCKETS } from '@/lib/supabase-storage';

const result = await deleteFile(STORAGE_BUCKETS.PRODUCTS, 'product-123/image.jpg');

if (result.success) {
  console.log('File deleted');
}
```

## 4. Common Use Cases

### Upload User Avatar

```typescript
import { uploadAvatar } from '@/lib/supabase-storage';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

const handleAvatarUpload = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const result = await uploadAvatar(file, user.id);
  
  if (!result.error) {
    // Update user metadata with avatar URL
    await supabase.auth.updateUser({
      data: { avatar_url: result.url }
    });
  }
};
```

### Upload Order Receipt

```typescript
import { uploadOrderDocument } from '@/lib/supabase-storage';

const handleReceiptUpload = async (file: File, orderId: string) => {
  const result = await uploadOrderDocument(file, orderId, 'receipt');
  
  if (!result.error) {
    // Store the URL in your orders table
    await supabase
      .from('orders')
      .update({ receipt_url: result.url })
      .eq('id', orderId);
  }
};
```

### Display Images in Components

```typescript
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/supabase-storage';

// In your component
const imageUrl = product.image_url 
  ? product.image_url 
  : getPublicUrl(STORAGE_BUCKETS.PRODUCTS, `default-product.jpg`);

<img src={imageUrl} alt={product.name} />
```

## 5. File Validation

The utility functions include built-in validation:

```typescript
import { validateFileType, validateFileSize } from '@/lib/supabase-storage';

const file = event.target.files[0];

// Validate type
const typeCheck = validateFileType(file, ['image/jpeg', 'image/png']);
if (!typeCheck.valid) {
  alert(typeCheck.error);
  return;
}

// Validate size (5MB max)
const sizeCheck = validateFileSize(file, 5);
if (!sizeCheck.valid) {
  alert(sizeCheck.error);
  return;
}
```

## 6. Admin Upload Page

An admin page has been created at `/admin/upload-product` for uploading product images. You can access it to:

- Upload product images
- Automatically update product records in the database
- Preview images before uploading
- See upload status and URLs

## 7. Best Practices

1. **File Naming**: Use unique filenames (e.g., `${productId}-${timestamp}.jpg`) to avoid conflicts
2. **File Size**: Always validate file size before uploading
3. **File Types**: Restrict allowed file types for security
4. **Error Handling**: Always handle upload errors gracefully
5. **Cleanup**: Delete old files when updating or deleting records
6. **CDN**: Supabase Storage automatically serves files via CDN for fast delivery
7. **Caching**: Set appropriate cache control headers for different file types

## 8. Troubleshooting

### "Bucket not found" error
- Make sure you've created the bucket in Supabase dashboard
- Check that the bucket name matches exactly (case-sensitive)

### "Access denied" error
- Check your RLS policies are set up correctly
- Verify the user is authenticated (for private buckets)
- Ensure the bucket is set to public (for public access)

### Upload fails silently
- Check browser console for errors
- Verify file size and type restrictions
- Check network tab for failed requests

## 9. Next Steps

- Integrate image uploads into your product creation flow
- Add image upload to user profile pages
- Implement image deletion when products are removed
- Add image optimization before upload (client-side resizing)
- Set up image transformations using Supabase Image Transformations (if needed)

