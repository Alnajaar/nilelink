'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  ArrowLeft,
  Package
} from 'lucide-react';

interface ProductTemplate {
  name: string;
  description: string;
  category: string;
  price: number;
  cost?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  preparationTime?: number;
  tags?: string;
  isActive: boolean;
}

export default function ProductImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ProductTemplate[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; imported: number; errors: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Sample template data
  const templateData: ProductTemplate[] = [
    {
      name: 'Espresso',
      description: 'Strong coffee brewed by forcing steam through ground coffee beans',
      category: 'Beverages',
      price: 3.50,
      cost: 0.80,
      stock: 100,
      sku: 'ESP-001',
      barcode: '1234567890123',
      preparationTime: 2,
      tags: 'coffee,hot,caffeine',
      isActive: true
    },
    {
      name: 'Croissant',
      description: 'Buttery, flaky pastry',
      category: 'Bakery',
      price: 4.25,
      cost: 1.20,
      stock: 50,
      sku: 'CR-002',
      barcode: '1234567890124',
      preparationTime: 3,
      tags: 'pastry,breakfast',
      isActive: true
    }
  ];

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
      setValidationErrors(['Please upload an Excel (.xlsx, .xls) or CSV (.csv) file']);
      return;
    }

    setFile(selectedFile);
    setImportStatus('validating');
    setValidationErrors([]);

    // Simulate file processing
    setTimeout(() => {
      // For demo purposes, generate mock preview data
      const mockPreview: ProductTemplate[] = [
        ...templateData,
        {
          name: 'Cappuccino',
          description: 'Espresso with steamed milk foam',
          category: 'Beverages',
          price: 4.75,
          cost: 1.10,
          stock: 80,
          sku: 'CAP-003',
          barcode: '1234567890125',
          preparationTime: 3,
          tags: 'coffee,milk,hot',
          isActive: true
        }
      ];
      
      setPreviewData(mockPreview);
      setImportStatus('idle');
      setValidationErrors([]);
    }, 1500);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Download template
  const downloadTemplate = () => {
    // Create CSV content
    const csvContent = [
      ['Name*', 'Description', 'Category*', 'Price*', 'Cost', 'Stock', 'SKU', 'Barcode', 'PrepTime', 'Tags', 'IsActive'],
      ...templateData.map(item => [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.category}"`,
        item.price.toString(),
        item.cost?.toString() || '',
        item.stock?.toString() || '',
        item.sku || '',
        item.barcode || '',
        item.preparationTime?.toString() || '',
        item.tags || '',
        item.isActive.toString()
      ])
    ]
    .map(row => row.join(','))
    .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nilelink_product_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import products
  const handleImport = async () => {
    if (!file) return;

    setImportStatus('importing');
    setProgress(0);

    // Simulate import process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    // Set import summary
    setImportSummary({
      total: previewData.length,
      imported: previewData.length - 1, // Simulate one error
      errors: 1
    });

    setImportStatus('success');
  };

  // Reset import process
  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setImportStatus('idle');
    setValidationErrors([]);
    setImportSummary(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-full"
                onClick={() => router.push('/admin/products')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Import Products</h1>
                <p className="text-gray-600">Upload your product catalog from Excel or CSV file</p>
              </div>
            </div>
          </div>
        </header>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">How to import products</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">1. Download Template</h3>
              <p className="text-sm text-gray-600">Download our template with required column headers</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">2. Fill Your Data</h3>
              <p className="text-sm text-gray-600">Add your products following the template format</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">3. Upload & Import</h3>
              <p className="text-sm text-gray-600">Upload your file and we'll process your products</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={downloadTemplate}
            >
              <Download size={16} />
              Download Template
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={triggerFileInput}
            >
              <Upload size={16} />
              {file ? 'Change File' : 'Select File'}
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>
        </Card>

        {validationErrors.length > 0 && (
          <Card className="p-4 mb-6 border-l-4 border-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-800 mb-1">Validation Errors</h3>
                <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {importStatus === 'validating' && (
          <Card className="p-8 mb-6 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Validating your file...</p>
          </Card>
        )}

        {previewData.length > 0 && importStatus !== 'importing' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Preview</h2>
              <Badge variant="info" className="text-sm">
                {previewData.length} products
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.stock || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.isActive ? 'success' : 'warning'} className="text-xs">
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                className="flex items-center gap-2"
                disabled={importStatus === 'importing'}
                onClick={handleImport}
              >
                <Package size={16} />
                Import {previewData.length} Products
              </Button>
            </div>
          </Card>
        )}

        {importStatus === 'importing' && (
          <Card className="p-8 mb-6">
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Products</h3>
              <p className="text-gray-600">Please wait while we process your products...</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              {progress}% Complete
            </div>
          </Card>
        )}

        {importStatus === 'success' && importSummary && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Import Successful!</h3>
              <p className="text-gray-600">
                {importSummary.imported} of {importSummary.total} products imported successfully
              </p>
              
              {importSummary.errors > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md inline-block">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle size={16} />
                    <span>{importSummary.errors} product{importSummary.errors !== 1 ? 's' : ''} had errors</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/products')}
              >
                View Products
              </Button>
              <Button 
                onClick={resetImport}
              >
                Import More
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}