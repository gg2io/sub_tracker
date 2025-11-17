import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { importCSV } from '../services/api';
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function CSVImport({ onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await importCSV(file);
      setResult(response.data);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="w-1 h-6 gradient-primary rounded-full"></div>
          Import Bank Statement
        </CardTitle>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300"
        >
          <X size={20} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 p-4 rounded-xl border border-blue-200 dark:border-slate-600">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-3 font-medium">
              Required CSV columns:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-white dark:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold shadow-sm">
                date
              </span>
              <span className="px-3 py-1 bg-white dark:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold shadow-sm">
                description
              </span>
              <span className="px-3 py-1 bg-white dark:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold shadow-sm">
                amount
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Optional: <span className="font-medium">currency</span>, <span className="font-medium">merchant</span>
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="block cursor-pointer"
            >
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group">
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Upload className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">Click to select CSV file</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">or drag and drop here</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-up">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</span>
            </div>
          )}

          {result && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-up">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-800 dark:text-green-300 font-medium">{result.message}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              variant="primary"
              className="flex-1"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Uploading...
                </span>
              ) : (
                'Upload & Import'
              )}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
