'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  ingredients?: string[];
  tax?: number;
  availability?: boolean;
  variants?: string[];
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}

export const InventoryImporter = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { localLedger } = usePOS();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        throw new Error('Please upload a CSV or Excel file (.csv or .xlsx)');
      }

      // Simulate file processing - in a real implementation, this would parse the file
      // and convert to the appropriate format for the POS system
      const parsedData = await parseFile(file);
      
      // Validate the data structure
      const validationErrors = validateData(parsedData);
      if (validationErrors.length > 0) {
        setResult({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
        return;
      }

      // Process the import
      const importResult = await importToPOS(parsedData);
      
      setResult(importResult);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'An error occurred during import'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    // In a real implementation, this would parse the CSV/Excel file
    // For now, we'll simulate with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            name: 'Burger',
            category: 'Main Course',
            price: 12.99,
            costPrice: 5.50,
            ingredients: ['Beef Patty', 'Bun', 'Lettuce', 'Tomato'],
            tax: 0.1,
            availability: true,
            variants: ['Regular', 'Spicy']
          },
          {
            name: 'Fries',
            category: 'Side Dish',
            price: 4.99,
            costPrice: 1.20,
            ingredients: ['Potatoes', 'Salt', 'Oil'],
            tax: 0.1,
            availability: true,
            variants: ['Regular', 'Large']
          }
        ]);
      }, 1000);
    });
  };

  const validateData = (data: any[]): string[] => {
    const errors: string[] = [];

    data.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Row ${index + 1}: Item name is required`);
      }
      if (!item.category) {
        errors.push(`Row ${index + 1}: Category is required`);
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Row ${index + 1}: Price must be a positive number`);
      }
    });

    return errors;
  };

  const importToPOS = async (data: any[]): Promise<ImportResult> => {
    // In a real implementation, this would save the data to the POS system
    // For now, we'll simulate the import process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Successfully imported inventory items',
          importedCount: data.length
        });
      }, 1500);
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Smart Inventory Import
          </h2>
          <p className="text-gray-600 mt-2">
            Upload Excel/CSV files to automatically generate menus and inventory
          </p>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
            </h3>
            
            <p className="text-gray-500 mb-4">
              CSV or Excel files (.csv, .xlsx, .xls)
            </p>
            
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={triggerFileInput}
              disabled={isProcessing}
            >
              Select File
            </button>
          </div>

          {isProcessing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800">Processing your inventory file...</p>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              
              <div>
                <p className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                
                {result.importedCount !== undefined && (
                  <p className="text-green-700 mt-1">
                    Successfully imported {result.importedCount} items
                  </p>
                )}
                
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-red-700">Validation Errors:</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Expected File Format</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">name</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Item name (e.g., "Cheeseburger")</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">category</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Category (e.g., "Main Course", "Drinks")</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">price</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Selling price (e.g., 12.99)</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">cost_price</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Cost price for profit calculation</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">ingredients</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Comma-separated list of ingredients</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">tax</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Tax rate (e.g., 0.1 for 10%)</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">availability</td>
                    <td className="px-4 py-2 text-sm text-gray-500">"true" or "false"</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">variants</td>
                    <td className="px-4 py-2 text-sm text-gray-500">Comma-separated list of variants</td>
                    <td className="px-4 py-2 text-sm text-gray-500">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryImporter;