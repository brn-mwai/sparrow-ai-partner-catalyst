// ============================================
// SPARROW AI - PDF Report Generator
// Generate professional PDF reports
// ============================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: Record<string, unknown>;
  bodyStyles?: Record<string, unknown>;
  alternateRowStyles?: Record<string, unknown>;
  columnStyles?: Record<number, Record<string, unknown>>;
  margin?: { left?: number; right?: number };
  tableWidth?: 'auto' | 'wrap' | number;
}

interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  dateRange?: { start: Date; end: Date };
  summary?: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  tables?: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
  charts?: {
    title: string;
    imageData: string;
  }[];
}

// Sparrow brand colors
const COLORS = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  gray900: '#111827',
  gray600: '#4B5563',
  gray400: '#9CA3AF',
  gray200: '#E5E7EB',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
};

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 20;
  private currentY = 0;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin;
  }

  private addHeader(title: string, subtitle?: string) {
    // Logo placeholder - purple rectangle with text
    this.doc.setFillColor(124, 58, 237);
    this.doc.roundedRect(this.margin, this.currentY, 40, 12, 2, 2, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SPARROW AI', this.margin + 4, this.currentY + 8);

    this.currentY += 20;

    // Title
    this.doc.setTextColor(17, 24, 39);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);

    this.currentY += 8;

    // Subtitle
    if (subtitle) {
      this.doc.setTextColor(75, 85, 99);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 6;
    }

    this.currentY += 5;
  }

  private addMetadata(generatedAt: Date, dateRange?: { start: Date; end: Date }) {
    this.doc.setTextColor(156, 163, 175);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    const generatedText = `Generated: ${generatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    this.doc.text(generatedText, this.margin, this.currentY);

    if (dateRange) {
      const rangeText = `Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
      this.doc.text(rangeText, this.pageWidth - this.margin - this.doc.getTextWidth(rangeText), this.currentY);
    }

    this.currentY += 10;

    // Divider line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);

    this.currentY += 10;
  }

  private addSummaryCards(summary: ReportData['summary']) {
    if (!summary || summary.length === 0) return;

    const cardWidth = (this.pageWidth - this.margin * 2 - 15) / 4;
    const cardHeight = 25;

    summary.slice(0, 4).forEach((item, index) => {
      const x = this.margin + (cardWidth + 5) * index;

      // Card background
      this.doc.setFillColor(249, 250, 251);
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'F');

      // Value
      this.doc.setTextColor(17, 24, 39);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(String(item.value), x + 5, this.currentY + 10);

      // Label
      this.doc.setTextColor(107, 114, 128);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, x + 5, this.currentY + 18);

      // Change indicator
      if (item.change) {
        const isPositive = item.change.startsWith('+');
        this.doc.setTextColor(isPositive ? 34 : 239, isPositive ? 197 : 68, isPositive ? 94 : 68);
        this.doc.setFontSize(8);
        this.doc.text(item.change, x + cardWidth - 15, this.currentY + 10);
      }
    });

    this.currentY += cardHeight + 15;
  }

  private addSectionTitle(title: string) {
    this.doc.setTextColor(17, 24, 39);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addTable(table: NonNullable<ReportData['tables']>[0]) {
    this.addSectionTitle(table.title);

    this.doc.autoTable({
      startY: this.currentY,
      head: [table.headers],
      body: table.rows,
      theme: 'plain',
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: [107, 114, 128],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: [55, 65, 81],
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  private addChartImage(chart: NonNullable<ReportData['charts']>[0]) {
    this.addSectionTitle(chart.title);

    const imgWidth = this.pageWidth - this.margin * 2;
    const imgHeight = 60;

    try {
      this.doc.addImage(chart.imageData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 15;
    } catch {
      // If image fails, add placeholder
      this.doc.setFillColor(249, 250, 251);
      this.doc.roundedRect(this.margin, this.currentY, imgWidth, imgHeight, 3, 3, 'F');
      this.doc.setTextColor(156, 163, 175);
      this.doc.setFontSize(10);
      this.doc.text('Chart data not available', this.pageWidth / 2, this.currentY + imgHeight / 2, { align: 'center' });
      this.currentY += imgHeight + 15;
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;

    this.doc.setTextColor(156, 163, 175);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');

    // Left side - Sparrow branding
    this.doc.text('Sparrow AI - Sales Training Platform', this.margin, footerY);

    // Right side - Page number
    const pageText = `Page ${this.doc.getCurrentPageInfo().pageNumber}`;
    this.doc.text(pageText, this.pageWidth - this.margin - this.doc.getTextWidth(pageText), footerY);

    // Divider line above footer
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.addFooter();
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  public generate(data: ReportData): Blob {
    // Header
    this.addHeader(data.title, data.subtitle);

    // Metadata
    this.addMetadata(data.generatedAt, data.dateRange);

    // Summary cards
    if (data.summary) {
      this.addSummaryCards(data.summary);
    }

    // Tables
    if (data.tables) {
      data.tables.forEach((table) => {
        this.checkPageBreak(50);
        this.addTable(table);
      });
    }

    // Charts
    if (data.charts) {
      data.charts.forEach((chart) => {
        this.checkPageBreak(80);
        this.addChartImage(chart);
      });
    }

    // Footer on last page
    this.addFooter();

    return this.doc.output('blob');
  }

  public download(data: ReportData, filename: string) {
    this.generate(data);
    this.doc.save(filename);
  }
}

// Helper function to generate admin report
export function generateAdminReport(stats: {
  users: { total: number; newThisWeek: number; active: number; byPlan: { free: number; starter: number; pro: number } };
  calls: { total: number; today: number };
  revenue: { mrr: number; estimated: number };
}, users: Array<{ name: string | null; email: string; plan: string; created_at: string }>) {
  const generator = new PDFReportGenerator();

  const reportData: ReportData = {
    title: 'Admin Dashboard Report',
    subtitle: 'User Analytics & Revenue Overview',
    generatedAt: new Date(),
    summary: [
      { label: 'Total Users', value: stats.users.total, change: `+${stats.users.newThisWeek}` },
      { label: 'Active Users (7d)', value: stats.users.active },
      { label: 'Total Calls', value: stats.calls.total, change: `+${stats.calls.today}` },
      { label: 'MRR', value: `$${stats.revenue.mrr}` },
    ],
    tables: [
      {
        title: 'Users by Plan',
        headers: ['Plan', 'Users', 'Revenue'],
        rows: [
          ['Free', stats.users.byPlan.free, '$0'],
          ['Starter', stats.users.byPlan.starter, `$${stats.users.byPlan.starter * 29}`],
          ['Pro', stats.users.byPlan.pro, `$${stats.users.byPlan.pro * 79}`],
        ],
      },
      {
        title: 'Recent Users',
        headers: ['Name', 'Email', 'Plan', 'Joined'],
        rows: users.slice(0, 10).map(u => [
          u.name || 'N/A',
          u.email,
          u.plan,
          new Date(u.created_at).toLocaleDateString(),
        ]),
      },
    ],
  };

  return generator.download(reportData, `sparrow-admin-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

// Helper function for user progress report
export function generateUserProgressReport(user: {
  name: string;
  email: string;
}, progress: {
  totalCalls: number;
  totalDuration: number;
  avgScore: number;
  currentStreak: number;
  skillScores: { opening: number; discovery: number; objection: number; control: number; closing: number };
}, calls: Array<{ type: string; score: number; duration: number; date: string }>) {
  const generator = new PDFReportGenerator();

  const reportData: ReportData = {
    title: 'Training Progress Report',
    subtitle: `Performance summary for ${user.name || user.email}`,
    generatedAt: new Date(),
    summary: [
      { label: 'Total Calls', value: progress.totalCalls },
      { label: 'Avg Score', value: progress.avgScore.toFixed(1) },
      { label: 'Practice Time', value: `${Math.floor(progress.totalDuration / 60)}m` },
      { label: 'Current Streak', value: `${progress.currentStreak} days` },
    ],
    tables: [
      {
        title: 'Skill Breakdown',
        headers: ['Skill', 'Score', 'Level'],
        rows: Object.entries(progress.skillScores).map(([skill, score]) => [
          skill.charAt(0).toUpperCase() + skill.slice(1),
          score.toFixed(1),
          score >= 8 ? 'Expert' : score >= 6 ? 'Proficient' : score >= 4 ? 'Developing' : 'Beginner',
        ]),
      },
      {
        title: 'Recent Calls',
        headers: ['Type', 'Score', 'Duration', 'Date'],
        rows: calls.slice(0, 10).map(c => [
          c.type.replace('_', ' '),
          c.score.toFixed(1),
          `${Math.floor(c.duration / 60)}:${(c.duration % 60).toString().padStart(2, '0')}`,
          new Date(c.date).toLocaleDateString(),
        ]),
      },
    ],
  };

  return generator.download(reportData, `sparrow-progress-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
