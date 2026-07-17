import { useState } from 'react';
import { FileText, Calendar, Download, RefreshCcw, Loader2, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { mockReportTypes } from '@/mock-data/reports';
import type { ReportType } from '@/mock-data/reports';

export default function ReportsHub() {
  const { success } = useToast();

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(mockReportTypes[0]);
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-18');
  const [fileFormat, setFileFormat] = useState<'csv' | 'pdf'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Mock Table Data Preview structure
  const [previewRecords, setPreviewRecords] = useState<Record<string, string>[]>([]);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      success(`${selectedReport?.name} exported successfully in .${fileFormat.toUpperCase()} format`);
    }, 1500);
  };

  const handlePreviewReport = () => {
    setIsPreviewing(true);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      
      // Load different columns based on report ID
      if (selectedReport?.id === 'REP-SALES') {
        setPreviewRecords([
          { 'Report Date': '2026-07-18', 'Sales Amount': '$3,400.00', 'Qty Sold': '28 units', 'Transactions Count': '12 orders' },
          { 'Report Date': '2026-07-17', 'Sales Amount': '$2,900.00', 'Qty Sold': '22 units', 'Transactions Count': '9 orders' },
          { 'Report Date': '2026-07-16', 'Sales Amount': '$1,800.00', 'Qty Sold': '15 units', 'Transactions Count': '6 orders' }
        ]);
      } else if (selectedReport?.id === 'REP-COMPANY') {
        setPreviewRecords([
          { 'Agro Partner': 'Greenfield Agro Ltd.', 'Revenue Share': '$12,450.00', 'Catalog Size': '42 SKUs', 'Rating Score': '4.8 ★' },
          { 'Agro Partner': 'Bayer CropScience BD', 'Revenue Share': '$7,890.00', 'Catalog Size': '32 SKUs', 'Rating Score': '4.5 ★' }
        ]);
      } else {
        setPreviewRecords([
          { 'Field Column A': 'Record Value A1', 'Field Column B': 'Record Value B1', 'Total Audited': '124 records' },
          { 'Field Column A': 'Record Value A2', 'Field Column B': 'Record Value B2', 'Total Audited': '89 records' }
        ]);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Platform Business Reports Hub" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports Hub' }]} />

      {/* Main Grid: Left Hub Cards, Right Generator Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reports Hub Lists */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-foreground tracking-wider uppercase px-1">Available Report Logs</h3>
          
          <div className="space-y-2.5">
            {mockReportTypes.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setIsPreviewing(false);
                    setPreviewRecords([]);
                  }}
                  className={`w-full text-left p-4 border rounded-xl shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-muted/10'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{rep.name}</p>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed font-medium">
                      {rep.description}
                    </span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground/50'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Generator Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport && (
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="border-b border-border/60 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-foreground">{selectedReport.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedReport.description}</p>
                </div>
                <FileText className="h-7 w-7 text-primary/80 shrink-0" />
              </div>

              {/* Form Config */}
              <form onSubmit={handleGenerateReport} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Start Audit Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> End Audit Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Specific Fields preview info */}
                  <div className="md:col-span-2 p-3 bg-muted/40 border border-border/80 rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Parameters Included in Export:</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedReport.fields.map((field, idx) => (
                        <span key={idx} className="text-[10px] bg-background border border-border px-2 py-0.5 rounded font-semibold text-foreground/80">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* File Format select */}
                  <div className="space-y-1.5 md:col-span-2">
                    <span className="text-[11px] font-bold text-foreground/80 block">Export Format Target</span>
                    <div className="flex gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          checked={fileFormat === 'pdf'}
                          onChange={() => setFileFormat('pdf')}
                          disabled={isGenerating}
                          className="text-primary focus:ring-primary"
                        />
                        Acrobat PDF File (.pdf)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          checked={fileFormat === 'csv'}
                          onChange={() => setFileFormat('csv')}
                          disabled={isGenerating}
                          className="text-primary focus:ring-primary"
                        />
                        Spreadsheet CSV Comma-delimited (.csv)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Generator buttons */}
                <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
                  <button
                    type="button"
                    onClick={handlePreviewReport}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {isGenerating && isPreviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-3.5 w-3.5" />
                    )}
                    Generate Live Preview
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {isGenerating && !isPreviewing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        Download Exported File
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* Live Preview section */}
      {isPreviewing && previewRecords.length > 0 && (
        <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-sm font-bold text-foreground px-1 flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-primary animate-spin" />
            Live Generated Audit Preview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  {Object.keys(previewRecords[0]).map((head, idx) => (
                    <th key={idx} className="pb-3 px-3">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {previewRecords.map((rec, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-muted/10 transition-colors">
                    {Object.values(rec).map((val, cellIdx) => (
                      <td key={cellIdx} className="py-3 px-3 font-semibold text-foreground/80">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
