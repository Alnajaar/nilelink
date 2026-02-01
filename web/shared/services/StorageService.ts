import { api } from './api';

export interface UploadedFile {
    filename: string;
    originalName: string;
    size: number;
    url: string;
    uploadDate: string;
}

export class StorageService {
    /**
     * Upload a single file to the server
     */
    static async uploadFile(file: File): Promise<UploadedFile> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/uploads/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    }

    /**
     * Upload multiple images
     */
    static async uploadImages(files: File[]): Promise<UploadedFile[]> {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        const response = await api.post('/uploads/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data.files;
    }

    /**
     * Upload multiple documents
     */
    static async uploadDocuments(files: File[]): Promise<UploadedFile[]> {
        const formData = new FormData();
        files.forEach(file => formData.append('documents', file));

        const response = await api.post('/uploads/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data.files;
    }

    /**
     * Delete a file by filename
     */
    static async deleteFile(filename: string): Promise<boolean> {
        const response = await api.delete(`/uploads/${filename}`);
        return response.data.success;
    }

    /**
     * List all files (Admin only)
     */
    static async listFiles(): Promise<UploadedFile[]> {
        const response = await api.get('/uploads/list');
        return response.data.data.files;
    }
}
