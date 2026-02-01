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

interface InventoryTemplate {
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  sku: string;
  barcode: string;
  weight?: number;
  dimensions?: string;
  supplier?: string;
  tags?: string;
  isActive: boolean;
}

export default function InventoryImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<InventoryTemplate[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; imported: number; errors: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Sample template data for retail
  const templateData: InventoryTemplate[] = [
    {
      name: 'Organic Bananas',
      description: 'Fresh organic bananas, 1lb bunch',
      category: 'Produce',
      brand: 'Nature\'s Best',
      price: 0.69,
      cost: 0.35,
      stock: 150,
      minStock: 20,
      sku: 'FRU-BAN-001',
      barcode: '012345678901',
      weight: 1.0,
      dimensions: '7x4x4 inches',
      supplier: 'ABC Produce Co.',
      tags: 'organic,fruit,fresh',
      isActive: true
    },
    {
      name: 'Whole Milk',
      description: 'Grade A whole milk, 1 gallon',
      category: 'Dairy',
      brand: 'Farm Fresh',
      price: 3.99,
      cost: 2.20,
      stock: 80,
      minStock: 10,
      sku: 'DAI-MILK-002',
      barcode: '012345678902',
      weight: 8.6,
      dimensions: '6x6x10 inches',
      supplier: 'Local Dairy Inc.',
      tags: 'dairy,milk,fresh',
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
      const mockPreview: InventoryTemplate[] = [
        ...templateData,
        {
          name: 'Premium Bread',
          description: 'Artisanal sourdough bread',
          category: 'Bakery',
          brand: 'Artisan Loaves',
          price: 4.99,
          cost: 1.80,
          stock: 45,
          minStock: 15,
          sku: 'BAK-BRD-003',
          barcode: '012345678903',
          weight: 1.2,
          dimensions: '10x5x4 inches',
          supplier: 'Bakery Supplies Ltd.',
          tags: 'bread,sourdough,artisanal',
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
    // Create CSV content for retail inventory
    const csvContent = [
      ['Name*', 'Description', 'Category*', 'Brand', 'Price*', 'Cost', 'Stock*', 'MinStock', 'SKU*', 'Barcode*', 'Weight', 'Dimensions', 'Supplier', 'Tags', 'IsActive'],
      ...templateData.map(item => [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.category}"`,
        `"${item.brand}"`,
        item.price.toString(),
        item.cost?.toString() || '',
        item.stock.toString(),
        item.minStock?.toString() || '',
        `"${item.sku}"`,
        `"${item.barcode}"`,
        item.weight?.toString() || '',
        `"${item.dimensions}"`,
        `"${item.supplier}"`,
        `"${item.tags}"`,
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
    link.setAttribute('download', 'nilelink_inventory_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import inventory
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
      imported: previewData.length - 0, // Simulate no errors for retail
      errors: 0
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
                <h1 className="text-3xl font-bold text-gray-900">Import Inventory</h1>
                <p className="text-gray-600">Upload your retail inventory from Excel or CSV file</p>
              </div>
            </div>
          </div>
        </header>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">How to import inventory</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">1. Download Template</h3>
              <p className="text-sm text-gray-600">Download our template with required column headers</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">2. Fill Your Data</h3>
              <p className="text-sm text-gray-600">Add your inventory following the template format</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">3. Upload & Import</h3>
              <p className="text-sm text-gray-600">Upload your file and we'll process your inventory</p>
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
                {previewData.length} items
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.isActive ? 'success' : 'warning'} className="text-xs">
                          {item.isActive ? 'Active' : 'Inactive'}
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
                Import {previewData.length} Items
              </Button>
            </div>
          </Card>
        )}

        {importStatus === 'importing' && (
          <Card className="p-8 mb-6">
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Inventory</h3>
              <p className="text-gray-600">Please wait while we process your inventory...</p>
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
                {importSummary.imported} of {importSummary.total} items imported successfully
              </p>
              
              {importSummary.errors > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md inline-block">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle size={16} />
                    <span>{importSummary.errors} item{importSummary.errors !== 1 ? 's' : ''} had errors</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/products')}
              >
                View Inventory
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