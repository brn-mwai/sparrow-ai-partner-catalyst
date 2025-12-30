// ============================================
// SPARROW AI - User Progress Report Generator
// Generate PDF reports with charts for users
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

// Sparrow brand colors
const COLORS = {
  primary: [124, 58, 237] as [number, number, number],
  primaryLight: [139, 92, 246] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  gray900: [17, 24, 39] as [number, number, number],
  gray600: [75, 85, 99] as [number, number, number],
  gray400: [156, 163, 175] as [number, number, number],
  gray200: [229, 231, 235] as [number, number, number],
  gray50: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export interface UserReportData {
  userName: string;
  userEmail: string;
  generatedAt: Date;
  timeRange: string;
  stats: {
    totalCalls: number;
    totalDuration: number;
    avgScore: number | null;
    currentStreak: number;
    longestStreak: number;
  };
  skillScores: {
    opening: number | null;
    discovery: number | null;
    objection_handling: number | null;
    call_control: number | null;
    closing: number | null;
  };
  outcomes: {
    meeting_booked: number;
    callback: number;
    rejected: number;
    no_decision: number;
  };
  callsByType: Array<{ type: string; count: number }>;
  scoreHistory: Array<{ date: string; score: number }>;
  recentCalls: Array<{
    type: string;
    personaName: string;
    score: number | null;
    duration: number;
    date: string;
    outcome: string | null;
  }>;
  chartImages?: {
    scoreTrend?: string;
    skillRadar?: string;
    callsByType?: string;
  };
}

export class UserReportGenerator {
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

  private addHeader(userName: string, timeRange: string) {
    // Sparrow logo
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin, this.currentY, 40, 12, 2, 2, 'F');

    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SPARROW AI', this.margin + 4, this.currentY + 8);

    this.currentY += 20;

    // Title
    this.doc.setTextColor(...COLORS.gray900);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Progress Report', this.margin, this.currentY);

    this.currentY += 8;

    // User name and time range
    this.doc.setTextColor(...COLORS.gray600);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${userName} • ${timeRange}`, this.margin, this.currentY);

    this.currentY += 12;
  }

  private addMetadata(generatedAt: Date) {
    this.doc.setTextColor(...COLORS.gray400);
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
    this.currentY += 8;

    // Divider
    this.doc.setDrawColor(...COLORS.gray200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);

    this.currentY += 10;
  }

  private addStatsCards(stats: UserReportData['stats']) {
    const cardWidth = (this.pageWidth - this.margin * 2 - 15) / 4;
    const cardHeight = 28;

    const statsArray = [
      { label: 'Total Calls', value: String(stats.totalCalls), icon: 'calls' },
      { label: 'Practice Time', value: this.formatDuration(stats.totalDuration), icon: 'time' },
      { label: 'Avg Score', value: stats.avgScore ? stats.avgScore.toFixed(1) : '--', icon: 'score' },
      { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: 'streak' },
    ];

    statsArray.forEach((stat, index) => {
      const x = this.margin + (cardWidth + 5) * index;

      // Card background
      this.doc.setFillColor(...COLORS.gray50);
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'F');

      // Value
      this.doc.setTextColor(...COLORS.gray900);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.value, x + 5, this.currentY + 12);

      // Label
      this.doc.setTextColor(...COLORS.gray600);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(stat.label, x + 5, this.currentY + 20);
    });

    this.currentY += cardHeight + 15;
  }

  private addSectionTitle(title: string, icon?: string) {
    this.doc.setTextColor(...COLORS.gray900);
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addSkillBreakdown(skillScores: UserReportData['skillScores']) {
    this.addSectionTitle('Skill Performance');

    const skills = [
      { name: 'Opening', score: skillScores.opening },
      { name: 'Discovery', score: skillScores.discovery },
      { name: 'Objection Handling', score: skillScores.objection_handling },
      { name: 'Call Control', score: skillScores.call_control },
      { name: 'Closing', score: skillScores.closing },
    ];

    const barWidth = this.pageWidth - this.margin * 2 - 60;
    const barHeight = 8;

    skills.forEach((skill) => {
      const score = skill.score || 0;
      const color = this.getScoreColor(score);

      // Skill name
      this.doc.setTextColor(...COLORS.gray600);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(skill.name, this.margin, this.currentY + 5);

      // Score value
      this.doc.setTextColor(...color);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(score > 0 ? score.toFixed(1) : '--', this.pageWidth - this.margin - 10, this.currentY + 5);

      // Bar background
      this.doc.setFillColor(...COLORS.gray200);
      this.doc.roundedRect(this.margin + 50, this.currentY, barWidth, barHeight, 2, 2, 'F');

      // Bar fill
      if (score > 0) {
        this.doc.setFillColor(...color);
        this.doc.roundedRect(this.margin + 50, this.currentY, barWidth * (score / 10), barHeight, 2, 2, 'F');
      }

      this.currentY += barHeight + 6;
    });

    this.currentY += 10;
  }

  private addOutcomesSection(outcomes: UserReportData['outcomes']) {
    this.addSectionTitle('Call Outcomes');

    const total = outcomes.meeting_booked + outcomes.callback + outcomes.rejected + outcomes.no_decision;
    const outcomeData = [
      { label: 'Meetings Booked', value: outcomes.meeting_booked, color: COLORS.success },
      { label: 'Callbacks', value: outcomes.callback, color: COLORS.warning },
      { label: 'Rejected', value: outcomes.rejected, color: COLORS.danger },
      { label: 'No Decision', value: outcomes.no_decision, color: COLORS.gray400 },
    ];

    const cardWidth = (this.pageWidth - this.margin * 2 - 15) / 4;

    outcomeData.forEach((outcome, index) => {
      const x = this.margin + (cardWidth + 5) * index;
      const percentage = total > 0 ? ((outcome.value / total) * 100).toFixed(0) : '0';

      // Card
      this.doc.setFillColor(...COLORS.gray50);
      this.doc.roundedRect(x, this.currentY, cardWidth, 24, 3, 3, 'F');

      // Value
      this.doc.setTextColor(...outcome.color);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${outcome.value}`, x + 5, this.currentY + 10);

      // Percentage
      this.doc.setTextColor(...COLORS.gray400);
      this.doc.setFontSize(9);
      this.doc.text(`(${percentage}%)`, x + 20, this.currentY + 10);

      // Label
      this.doc.setTextColor(...COLORS.gray600);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(outcome.label, x + 5, this.currentY + 18);
    });

    this.currentY += 35;
  }

  private addChartImage(title: string, imageData: string | undefined, height: number = 60) {
    if (!imageData) return;

    this.addSectionTitle(title);

    const imgWidth = this.pageWidth - this.margin * 2;

    try {
      this.doc.addImage(imageData, 'PNG', this.margin, this.currentY, imgWidth, height);
      this.currentY += height + 10;
    } catch {
      // If image fails, add placeholder
      this.doc.setFillColor(...COLORS.gray50);
      this.doc.roundedRect(this.margin, this.currentY, imgWidth, height, 3, 3, 'F');
      this.doc.setTextColor(...COLORS.gray400);
      this.doc.setFontSize(10);
      this.doc.text('Chart not available', this.pageWidth / 2, this.currentY + height / 2, { align: 'center' });
      this.currentY += height + 10;
    }
  }

  private addRecentCallsTable(calls: UserReportData['recentCalls']) {
    if (calls.length === 0) return;

    this.addSectionTitle('Recent Calls');

    const tableData = calls.slice(0, 10).map((call) => [
      call.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      call.personaName,
      call.score ? call.score.toFixed(1) : '--',
      this.formatDuration(call.duration),
      new Date(call.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      call.outcome ? call.outcome.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '--',
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Type', 'Prospect', 'Score', 'Duration', 'Date', 'Outcome']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.gray50,
        textColor: COLORS.gray600,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: COLORS.gray600,
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.white,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 22 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  private addInsightsSection(data: UserReportData) {
    this.checkPageBreak(60);
    this.addSectionTitle('Key Insights');

    const insights: string[] = [];

    // Skill insights
    const skillEntries = Object.entries(data.skillScores).filter(([_, v]) => v !== null);
    if (skillEntries.length > 0) {
      const sorted = skillEntries.sort(([_, a], [__, b]) => (b || 0) - (a || 0));
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      if (best && best[1] && best[1] >= 7) {
        insights.push(`Your strongest skill is ${this.formatSkillName(best[0])} at ${best[1].toFixed(1)}/10.`);
      }
      if (worst && worst[1] && worst[1] < 6) {
        insights.push(`Focus on improving ${this.formatSkillName(worst[0])} (currently ${worst[1].toFixed(1)}/10).`);
      }
    }

    // Outcome insights
    const totalOutcomes = data.outcomes.meeting_booked + data.outcomes.callback + data.outcomes.rejected + data.outcomes.no_decision;
    if (totalOutcomes > 0) {
      const bookingRate = (data.outcomes.meeting_booked / totalOutcomes * 100).toFixed(0);
      insights.push(`Your meeting booking rate is ${bookingRate}%.`);
    }

    // Streak insights
    if (data.stats.currentStreak >= 3) {
      insights.push(`Great consistency! You're on a ${data.stats.currentStreak}-day streak.`);
    }

    // Score trend
    if (data.scoreHistory.length >= 3) {
      const recent = data.scoreHistory.slice(-3);
      const trend = recent[recent.length - 1].score - recent[0].score;
      if (trend > 0.5) {
        insights.push(`Your scores are trending upward (+${trend.toFixed(1)} recently).`);
      }
    }

    if (insights.length === 0) {
      insights.push('Complete more calls to unlock personalized insights.');
    }

    // Render insights
    this.doc.setFillColor(...COLORS.gray50);
    const insightBoxHeight = 8 + insights.length * 8;
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - this.margin * 2, insightBoxHeight, 3, 3, 'F');

    this.doc.setTextColor(...COLORS.gray600);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    insights.forEach((insight, i) => {
      this.doc.text(`• ${insight}`, this.margin + 5, this.currentY + 8 + i * 8);
    });

    this.currentY += insightBoxHeight + 15;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;

    this.doc.setTextColor(...COLORS.gray400);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');

    this.doc.text('Sparrow AI - Sales Training Platform', this.margin, footerY);

    const pageText = `Page ${this.doc.getCurrentPageInfo().pageNumber}`;
    this.doc.text(pageText, this.pageWidth - this.margin - this.doc.getTextWidth(pageText), footerY);

    this.doc.setDrawColor(...COLORS.gray200);
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

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  private formatSkillName(key: string): string {
    const labels: Record<string, string> = {
      opening: 'Opening',
      discovery: 'Discovery',
      objection_handling: 'Objection Handling',
      call_control: 'Call Control',
      closing: 'Closing',
    };
    return labels[key] || key;
  }

  private getScoreColor(score: number | null): [number, number, number] {
    if (!score) return COLORS.gray400;
    if (score >= 8) return COLORS.success;
    if (score >= 6) return COLORS.warning;
    return COLORS.danger;
  }

  public generate(data: UserReportData): Blob {
    // Header
    this.addHeader(data.userName, data.timeRange);
    this.addMetadata(data.generatedAt);

    // Stats overview
    this.addStatsCards(data.stats);

    // Skill breakdown
    this.addSkillBreakdown(data.skillScores);

    // Charts if available
    if (data.chartImages?.scoreTrend) {
      this.checkPageBreak(80);
      this.addChartImage('Score Trend', data.chartImages.scoreTrend, 55);
    }

    if (data.chartImages?.skillRadar) {
      this.checkPageBreak(80);
      this.addChartImage('Skill Radar', data.chartImages.skillRadar, 55);
    }

    // Outcomes
    this.checkPageBreak(50);
    this.addOutcomesSection(data.outcomes);

    // Call type chart
    if (data.chartImages?.callsByType) {
      this.checkPageBreak(70);
      this.addChartImage('Calls by Type', data.chartImages.callsByType, 50);
    }

    // Recent calls table
    this.checkPageBreak(80);
    this.addRecentCallsTable(data.recentCalls);

    // Insights
    this.addInsightsSection(data);

    // Footer
    this.addFooter();

    return this.doc.output('blob');
  }

  public download(data: UserReportData, filename?: string): void {
    this.generate(data);
    const name = filename || `sparrow-progress-${data.userName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(name);
  }
}

// Helper to capture charts as images
export async function captureChartAsImage(elementId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture chart:', error);
    return null;
  }
}

// Export helper function
export async function generateUserProgressReport(
  data: Omit<UserReportData, 'chartImages'>,
  chartIds?: { scoreTrend?: string; skillRadar?: string; callsByType?: string }
): Promise<void> {
  const chartImages: UserReportData['chartImages'] = {};

  // Capture charts if IDs provided
  if (chartIds) {
    if (chartIds.scoreTrend) {
      chartImages.scoreTrend = (await captureChartAsImage(chartIds.scoreTrend)) || undefined;
    }
    if (chartIds.skillRadar) {
      chartImages.skillRadar = (await captureChartAsImage(chartIds.skillRadar)) || undefined;
    }
    if (chartIds.callsByType) {
      chartImages.callsByType = (await captureChartAsImage(chartIds.callsByType)) || undefined;
    }
  }

  const generator = new UserReportGenerator();
  generator.download({ ...data, chartImages });
}
