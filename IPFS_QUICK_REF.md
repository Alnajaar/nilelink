# 🚀 IPFS Upload Quick Reference

## ⚡ Quick Start

```tsx
import { useIPFSUpload } from '@/hooks/useIPFSUpload';

function MyComponent() {
  const { upload, isUploading, progress, result } = useIPFSUpload();

  const handleUpload = async (file: File) => {
    const result = await upload({ file });
    console.log('IPFS URL:', result.url);
  };

  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={isUploading}
    />
  );
}
```

---

## 📋 Common Use Cases

### Upload Image

```tsx
const { upload } = useIPFSUpload();
await upload({ file: imageFile, name: 'product.jpg' });
```

### Upload JSON

```tsx
import { uploadJSONToIPFS } from '@/lib/ipfs';
await uploadJSONToIPFS({ menu: 'data' }, 'menu.json');
```

### With Metadata

```tsx
await upload({
  file,
  metadata: { restaurantId: '123', type: 'logo' }
});
```

---

## 🔑 Environment Variables

```bash
# ✅ Public (read-only)
NEXT_PUBLIC_IPFS_GATEWAY=https://your-gateway.mypinata.cloud/ipfs/

# 🔒 Private (server-side only)
PINATA_JWT=your_jwt_token
```

---

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ipfs/upload` | POST | Upload file |
| `/api/ipfs/upload` | GET | Health check |

---

## 🛠️ Hook API

```tsx
const {
  upload,      // Upload file function
  uploadJSON,  // Upload JSON function
  isUploading, // Upload in progress
  progress,    // 0-100 progress
  error,       // Error message
  result,      // Upload result { ipfsHash, url, ... }
  reset        // Reset state
} = useIPFSUpload();
```

---

## ✅ Response Format

```typescript
{
  success: true,
  ipfsHash: "QmXxxx...",      // CID for blockchain
  pinSize: 12345,              // File size in bytes
  timestamp: "2026-01-23...",  // Upload time
  url: "https://...ipfs/QmXxxx..."  // Full gateway URL
}
```

---

## 🚨 Security Rules

| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| `NEXT_PUBLIC_PINATA_JWT` | `PINATA_JWT` |
| `NEXT_PUBLIC_PINATA_API_KEY` | Server-side only |
| Expose credentials | Use API route |

---

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:3000/api/ipfs/upload

# Upload test
curl -X POST http://localhost:3000/api/ipfs/upload \
  -F "file=@test.jpg"
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `web/shared/lib/ipfs.ts` | Core utilities |
| `web/shared/hooks/useIPFSUpload.ts` | React hook |
| `web/*/src/app/api/ipfs/upload/route.ts` | API routes |
| `IPFS_UPLOAD_GUIDE.md` | Full documentation |

---

## 💡 Tips

- Use the hook for React components
- Add meaningful metadata for organization
- Save `ipfsHash` to database/blockchain
- Show progress for better UX
- Handle errors gracefully

---

**See [`IPFS_UPLOAD_GUIDE.md`](./IPFS_UPLOAD_GUIDE.md) for full documentation**
