# 🔒 Secure IPFS Upload Implementation

## Overview

This implementation provides a **production-safe** way to upload files to IPFS using Pinata, ensuring your API credentials are never exposed to the frontend.

---

## 🏗️ Architecture

```
Frontend (Customer/POS/Supplier Apps)
    │
    │  (1) User uploads file
    ▼
React Component (useIPFSUpload hook)
    │
    │  (2) HTTP POST request
    ▼
Secure API Route (/api/ipfs/upload)
    │
    │  (3) Uses PINATA_JWT (server-side only)
    ▼
Pinata IPFS
    │
    │  (4) Returns IPFS hash (CID)
    ▼
Frontend receives CID + Gateway URL
```

**Key Security Principles:**

- ✅ Frontend **NEVER** has access to Pinata credentials
- ✅ All uploads go through server-side API route
- ✅ `PINATA_JWT` is **NEVER** prefixed with `NEXT_PUBLIC_`
- ✅ Only the read-only gateway URL is public

---

## 📁 Files Created

### 1. API Routes (Server-Side)

These handle the actual upload to Pinata using secure credentials:

- `web/customer/src/app/api/ipfs/upload/route.ts`
- `web/pos/src/app/api/ipfs/upload/route.ts`
- `web/supplier/src/app/api/ipfs/upload/route.ts`

**Endpoints:**

- `POST /api/ipfs/upload` - Upload a file
- `GET /api/ipfs/upload` - Health check

### 2. Frontend Utilities

These provide easy-to-use functions for uploading from the frontend:

- `web/shared/lib/ipfs.ts` - Core upload functions
- `web/shared/hooks/useIPFSUpload.ts` - React hook
- `web/shared/examples/ipfs-upload-examples.tsx` - Usage examples

---

## 🔧 Setup Instructions

### Step 1: Configure Environment Variables

In your `.env` file (root of project):

```bash
# ✅ FRONTEND - Safe to expose (read-only gateway)
NEXT_PUBLIC_IPFS_GATEWAY=https://green-gentle-warbler-878.mypinata.cloud/ipfs/

# 🔒 BACKEND ONLY - Server-side uploads (NEVER expose to frontend)
PINATA_JWT=your_actual_jwt_token_here
```

### Step 2: Get Your Pinata JWT

1. Go to <https://pinata.cloud/>
2. Navigate to **API Keys**
3. Click **New Key**
4. Give it a name (e.g., "NileLink Production")
5. Enable permissions: **Pin to IPFS**
6. Copy the JWT token
7. Paste it in your `.env` file as `PINATA_JWT`

### Step 3: Test the Configuration

```bash
# In any of your Next.js apps (customer/pos/supplier)
cd web/customer  # or pos, or supplier

# Start the dev server
npm run dev

# Test the health check
curl http://localhost:3000/api/ipfs/upload
```

Expected response:

```json
{
  "status": "ready",
  "message": "IPFS upload service is ready"
}
```

---

## 💻 Usage Examples

### Example 1: Upload a File (React Hook)

```tsx
import { useIPFSUpload } from '@/hooks/useIPFSUpload';

function MyComponent() {
  const { upload, isUploading, progress, error, result } = useIPFSUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({
        file,
        name: 'my-file.jpg',
        metadata: { type: 'image', restaurantId: '123' }
      });

      console.log('Uploaded to:', result.url);
      console.log('IPFS Hash:', result.ipfsHash);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      {isUploading && <p>Uploading: {progress}%</p>}
      {error && <p>Error: {error}</p>}
      {result && <img src={result.url} alt="Uploaded" />}
    </div>
  );
}
```

### Example 2: Upload JSON Data

```tsx
import { uploadJSONToIPFS } from '@/lib/ipfs';

async function saveMenuToIPFS(menuData: any) {
  const result = await uploadJSONToIPFS(
    menuData,
    'restaurant-menu.json',
    { restaurantId: '123', type: 'menu' }
  );

  console.log('Menu saved to IPFS:', result.ipfsHash);
  return result.ipfsHash; // Save this to blockchain or database
}
```

### Example 3: Drag & Drop Upload

```tsx
import { useIPFSUpload } from '@/hooks/useIPFSUpload';

function DragDropUpload() {
  const { upload, isUploading, progress, result } = useIPFSUpload();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await upload({ file });
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {isUploading ? `Uploading: ${progress}%` : 'Drag file here'}
      {result && <img src={result.url} alt="Uploaded" />}
    </div>
  );
}
```

---

## 📡 API Reference

### POST /api/ipfs/upload

Upload a file to IPFS.

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): The file to upload
  - `name` (optional): Custom name for the file
  - `keyvalues` (optional): JSON string of metadata

**Response (Success):**

```json
{
  "success": true,
  "ipfsHash": "QmXxxx...",
  "pinSize": 12345,
  "timestamp": "2026-01-23T11:54:22Z",
  "url": "https://green-gentle-warbler-878.mypinata.cloud/ipfs/QmXxxx..."
}
```

**Response (Error):**

```json
{
  "error": "Error message",
  "details": {...}
}
```

### GET /api/ipfs/upload

Check if the IPFS service is configured.

**Response:**

```json
{
  "status": "ready",
  "message": "IPFS upload service is ready"
}
```

---

## 🛡️ Security Features

### ✅ What's Secure

1. **Server-Side Credentials**: `PINATA_JWT` never leaves the server
2. **No Client Exposure**: Frontend only sends files, never credentials
3. **Read-Only Gateway**: Public gateway URL can only read, not write
4. **Metadata Control**: Server validates and controls metadata

### ❌ What NOT to Do

```bash
# ❌ NEVER DO THIS
NEXT_PUBLIC_PINATA_JWT=...        # Exposed to browser!
NEXT_PUBLIC_PINATA_API_KEY=...    # Exposed to browser!
NEXT_PUBLIC_PINATA_SECRET_KEY=... # Exposed to browser!
```

```bash
# ✅ CORRECT
PINATA_JWT=...                           # Server-side only
NEXT_PUBLIC_IPFS_GATEWAY=...             # Read-only, safe
```

---

## 🧪 Testing

### Test 1: Health Check

```bash
curl http://localhost:3000/api/ipfs/upload
```

### Test 2: Upload a File

```bash
curl -X POST http://localhost:3000/api/ipfs/upload \
  -F "file=@/path/to/test.jpg" \
  -F "name=test-image.jpg" \
  -F 'keyvalues={"type":"test"}'
```

### Test 3: Upload from Frontend

1. Create a simple upload component
2. Select a file
3. Check browser Network tab - should see POST to `/api/ipfs/upload`
4. Check response - should include `ipfsHash` and `url`

---

## 🔍 Troubleshooting

### Error: "IPFS service not configured"

**Cause:** `PINATA_JWT` is missing or set to placeholder value

**Solution:**

1. Check `.env` file has `PINATA_JWT=your_actual_token`
2. Restart your dev server
3. Verify with health check: `curl http://localhost:3000/api/ipfs/upload`

### Error: "Failed to upload to IPFS"

**Cause:** Invalid Pinata JWT or network issue

**Solution:**

1. Verify your JWT is correct
2. Check Pinata dashboard for API key status
3. Regenerate JWT if expired
4. Check server logs for detailed error

### Error: "No file provided"

**Cause:** File not properly attached to FormData

**Solution:**

```tsx
// ✅ Correct
const formData = new FormData();
formData.append('file', file);

// ❌ Wrong
formData.append('data', file);
```

---

## 🚀 Production Deployment

### Environment Variables

Make sure these are set in your production environment:

```bash
# Production .env
PINATA_JWT=your_production_jwt_token
NEXT_PUBLIC_IPFS_GATEWAY=https://green-gentle-warbler-878.mypinata.cloud/ipfs/
```

### Deployment Checklist

- [ ] `PINATA_JWT` configured in production environment
- [ ] No `NEXT_PUBLIC_PINATA_*` variables present
- [ ] Gateway URL is correct
- [ ] Test upload in production
- [ ] Monitor Pinata usage/quota

---

## 📊 Usage in NileLink Apps

### Customer App

- Profile pictures
- Review images
- Chat attachments

### POS App

- Menu item images
- Restaurant logos
- Receipt storage

### Supplier App

- Product images
- Supplier documents
- Invoices

### All Apps

- Order receipts (JSON)
- Menu data (JSON)
- Restaurant metadata (JSON)

---

## 🎯 Best Practices

1. **Always use the React hook** for component-based uploads
2. **Add meaningful metadata** to help organize files
3. **Handle errors gracefully** with user-friendly messages
4. **Show upload progress** for better UX
5. **Save IPFS hashes** to your database for reference
6. **Use descriptive file names** for easier debugging

---

## 📚 Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🆘 Support

If you encounter issues:

1. Check this documentation
2. Review the examples in `web/shared/examples/ipfs-upload-examples.tsx`
3. Test with the health check endpoint
4. Check server logs for detailed errors

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-23  
**Status:** ✅ Production Ready
