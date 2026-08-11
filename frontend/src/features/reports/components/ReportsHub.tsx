import { useState } from 'react';
import { FileText, Calendar, Download, RefreshCcw, Loader2, ArrowRight, Building2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { mockReportTypes } from '@/mock-data/reports';
import type { ReportType } from '@/mock-data/reports';

export default function ReportsHub() {
  const { success } = useToast();

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(mockReportTypes[0]);
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [companyFilter, setCompanyFilter] = useState('all');
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
    }, 1200);
  };

  const handlePreviewReport = () => {
    setIsPreviewing(true);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      
      const compLabel = companyFilter === 'all' ? 'All Companies' : companyFilter;

      if (selectedReport?.id === 'REP-SALES') {
        setPreviewRecords([
          { 'Date': '2026-08-11', 'Agro Company': compLabel === 'All Companies' ? 'Acme Agritech Solutions' : compLabel, 'Gross Sales (GMV)': '$1,200.00', 'Commission %': '10.0%', 'Platform Earning': '$120.00' },
          { 'Date': '2026-08-10', 'Agro Company': compLabel === 'All Companies' ? 'Bayer CropScience BD' : compLabel, 'Gross Sales (GMV)': '$4,500.00', 'Commission %': '10.0%', 'Platform Earning': '$450.00' },
          { 'Date': '2026-08-09', 'Agro Company': compLabel === 'All Companies' ? 'Greenfield Agro Ltd.' : compLabel, 'Gross Sales (GMV)': '$2,400.00', 'Commission %': '8.0%', 'Platform Earning': '$192.00' }
        ]);
      } else if (selectedReport?.id === 'REP-COMPANY') {
        setPreviewRecords([
          { 'Company ID': 'COMP-003', 'Agro Partner': 'Bayer CropScience BD', 'Verification Status': 'VERIFIED', 'Joined Date': '2025-09-18', 'Contribution Share': '36.4%' },
          { 'Company ID': 'COMP-001', 'Agro Partner': 'Greenfield Agro Ltd.', 'Verification Status': 'VERIFIED', 'Joined Date': '2026-01-05', 'Contribution Share': '24.6%' }
        ]);
      } else if (selectedReport?.id === 'REP-REVENUE') {
        setPreviewRecords([
          { 'Billing Date': '2026-08-11', 'Source Company': compLabel === 'All Companies' ? 'Acme Agritech Solutions' : compLabel, 'Revenue Stream': 'Commission fee', 'Amount Earned': '$120.00', 'Status': 'settled' },
          { 'Billing Date': '2026-08-10', 'Source Company': compLabel === 'All Companies' ? 'Greenfield Agro Ltd.' : compLabel, 'Revenue Stream': 'Premium subscription', 'Amount Earned': '$250.00', 'Status': 'settled' }
        ]);
      } else if (selectedReport?.id === 'REP-COMMISSION') {
        setPreviewRecords([
          { 'Company Name': compLabel === 'All Companies' ? 'Greenfield Agro Ltd.' : compLabel, 'Sales (GMV)': '$420,000.00', 'Commission Rate %': '8.0%', 'Gross Commission Owed': '$33,600.00', 'Status': 'settled' },
          { 'Company Name': compLabel === 'All Companies' ? 'Acme Agritech Solutions' : compLabel, 'Sales (GMV)': '$260,000.00', 'Commission Rate %': '10.0%', 'Gross Commission Owed': '$26,000.00', 'Status': 'pending' }
        ]);
      } else if (selectedReport?.id === 'REP-SETTLEMENT') {
        setPreviewRecords([
          { 'Settlement ID': 'SET-901', 'Company Name': compLabel === 'All Companies' ? 'Bayer CropScience BD' : compLabel, 'Gross Sales (GMV)': '$620,000.00', 'Discounts Cut': '-$9,300.00', 'Platform Fees Cut': '-$74,400.00', 'Final Payout Net Paid': '$536,300.00' }
        ]);
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports Hub"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports Hub' }]}
      />

      {/* Main Grid: Left Hub Cards, Right Generator Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reports Hub Lists */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-foreground tracking-wider uppercase px-1">Available Report Configurations</h3>
          
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
                    <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
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
                      <Calendar className="h-3.5 w-3.5" /> Start Date
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
                      <Calendar className="h-3.5 w-3.5" /> End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Company Filter Dropdown */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> Filter by Company
                    </label>
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">All Companies</option>
                      <option value="Acme Agritech Solutions">Acme Agritech Solutions</option>
                      <option value="Bayer CropScience BD">Bayer CropScience BD</option>
                      <option value="Greenfield Agro Ltd.">Greenfield Agro Ltd.</option>
                      <option value="Sufala Fertilizer Co.">Sufala Fertilizer Co.</option>
                    </select>
                  </div>

                  {/* Specific Fields preview info */}
                  <div className="md:col-span-2 p-3 bg-muted/40 border border-border/80 rounded-lg space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Report Columns Included in Output:</span>
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
                    <span className="text-[11px] font-bold text-foreground/80 block">Export Format File Target</span>
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
                        Acrobat PDF Document (.pdf)
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
                        Spreadsheet Excel CSV (.csv)
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
                        Export Report File
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
            Live Generated Preview
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
