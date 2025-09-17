import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';

interface QuoteScheduleRow {
  quoteNumber: string;
  clientName: string;
  agentName: string;
  tourType: 'FIT' | 'Group';
  departureDate: string;
  returnDate: string;
  paxCount: number;
  quoteDate: string;
  validUntil: string;
  status: 'Pending' | 'Confirmed' | 'Not Accepted' | 'Requote Requested';
  totalAmount: number;
  currency: string;
  consultant: string;
  notes: string;
}

interface ExcelImportExportProps {
  onImport: (data: QuoteScheduleRow[]) => void;
  onExport: () => void;
  quotes: QuoteScheduleRow[];
}

export default function ExcelImportExport({ onImport, onExport, quotes }: ExcelImportExportProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus('idle');
      setErrorMessage('');
    }
  };

  const processExcelFile = async () => {
    if (!importFile) return;

    setImportStatus('processing');
    setErrorMessage('');

    try {
      const data = await readExcelFile(importFile);
      onImport(data);
      setImportStatus('success');
      setImportFile(null);
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  const readExcelFile = (file: File): Promise<QuoteScheduleRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and process data
          const rows = jsonData.slice(1).map((row: any[], index: number) => {
            try {
              return {
                quoteNumber: row[0]?.toString() || '',
                clientName: row[1]?.toString() || '',
                agentName: row[2]?.toString() || '',
                tourType: (row[3]?.toString() || 'FIT') as 'FIT' | 'Group',
                departureDate: row[4] ? new Date(row[4]).toISOString().split('T')[0] : '',
                returnDate: row[5] ? new Date(row[5]).toISOString().split('T')[0] : '',
                paxCount: parseInt(row[6]?.toString() || '0') || 0,
                quoteDate: row[7] ? new Date(row[7]).toISOString().split('T')[0] : '',
                validUntil: row[8] ? new Date(row[8]).toISOString().split('T')[0] : '',
                status: (row[9]?.toString() || 'Pending') as 'Pending' | 'Confirmed' | 'Not Accepted' | 'Requote Requested',
                totalAmount: parseFloat(row[10]?.toString() || '0') || 0,
                currency: row[11]?.toString() || 'ZAR',
                consultant: row[12]?.toString() || '',
                notes: row[13]?.toString() || ''
              };
            } catch (error) {
              throw new Error(`Error processing row ${index + 2}: ${error}`);
            }
          });

          resolve(rows);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const exportToExcel = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data with headers
    const headers = [
      'Quote Number', 'Client Name', 'Agent Name', 'Tour Type', 'Departure Date',
      'Return Date', 'Pax Count', 'Quote Date', 'Valid Until', 'Status',
      'Total Amount', 'Currency', 'Consultant', 'Notes'
    ];
    
    const data = quotes.map(quote => [
      quote.quoteNumber,
      quote.clientName,
      quote.agentName,
      quote.tourType,
      quote.departureDate,
      quote.returnDate,
      quote.paxCount,
      quote.quoteDate,
      quote.validUntil,
      quote.status,
      quote.totalAmount,
      quote.currency,
      quote.consultant,
      quote.notes
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quote Schedule');
    
    // Export file
    XLSX.writeFile(workbook, `quote-schedule-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Excel Import/Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="excel-import">Import Quote Schedule from Excel</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  id="excel-import"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button
                  onClick={processExcelFile}
                  disabled={!importFile || importStatus === 'processing'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            {/* Import Status */}
            {importStatus === 'processing' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing Excel file...</span>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Excel file imported successfully!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <Label>Export Quote Schedule to Excel</Label>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {/* Excel Template Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Expected Excel Format:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Columns:</strong> Quote Number, Client Name, Agent Name, Tour Type, Departure Date, Return Date, Pax Count, Quote Date, Valid Until, Status, Total Amount, Currency, Consultant, Notes</p>
              <p><strong>Tour Type:</strong> FIT or Group</p>
              <p><strong>Status:</strong> Pending, Confirmed, Not Accepted, Requote Requested</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
