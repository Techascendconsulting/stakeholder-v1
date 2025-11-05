import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { groupsService } from '../../../services/community/groupsService';

interface ImportCsvDialogProps {
  onClose: () => void;
  onImport: () => void;
}

interface CsvRow {
  email: string;
  full_name: string;
  role: string;
  cohort: string;
}

const ImportCsvDialog: React.FC<ImportCsvDialogProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: CsvRow[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          email: values[0] || '',
          full_name: values[1] || '',
          role: values[2] || 'student',
          cohort: values[3] || ''
        };
      });

      setPreview(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const result = await groupsService.importCsv(file);
      setResult(result);
      if (result.added > 0) {
        onImport();
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Import users from a CSV file. Expected format: email,full_name,role,cohort
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-500">
                  CSV should have headers: email,full_name,role,cohort
                </p>
              </div>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Preview ({preview.length} rows)</h4>
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Cohort</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.full_name}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>{row.cohort}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {preview.length > 10 && (
                      <p className="text-sm text-gray-500 p-2">
                        ... and {preview.length - 10} more rows
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {result.errors.length === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <h4 className="font-semibold">Import Results</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.added}</div>
                  <div className="text-sm text-green-600">Added</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                  <div className="text-sm text-yellow-600">Skipped</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-red-600">Errors:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">
                        Row {error.row}: {error.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && preview.length > 0 && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import CSV'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCsvDialog;















