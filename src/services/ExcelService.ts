import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { JourneyItem, UserProfile } from '../types/journey';

/**
 * Generates a random start time between 07:30:00 and 08:15:59
 * Example output: "7:45:12" or "7:32:05"
 */
function getRandomStartTime(seed: number): string {
  // 07:30 (27000s) to 08:15:59 (29759s)
  const minSec = 7 * 3600 + 30 * 60; // 27000
  const maxSec = 8 * 3600 + 15 * 60 + 59; // 29759
  const rand = Math.abs(Math.sin(seed * 9999 + 1234));
  const totalSec = Math.floor(minSec + rand * (maxSec - minSec));
  
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Generates a random end time between 16:50:00 and 17:30:59
 * Example output: "17:15:33" or "17:22:11"
 */
function getRandomEndTime(seed: number): string {
  // 16:50 (60600s) to 17:30:59 (63059s)
  const minSec = 16 * 3600 + 50 * 60; // 60600
  const maxSec = 17 * 3600 + 30 * 60 + 59; // 63059
  const rand = Math.abs(Math.cos(seed * 8888 + 5678));
  const totalSec = Math.floor(minSec + rand * (maxSec - minSec));
  
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export class ExcelService {
  /**
   * Generates a fully-styled Excel Timesheet (.xlsx) matching Google Sheets template
   */
  public static async exportTimesheetExcel(
    items: JourneyItem[],
    profile?: UserProfile,
    selectedMonth?: string
  ): Promise<string | null> {
    // Determine target month (format YYYY-MM)
    const targetMonth = selectedMonth || (items.length > 0 && items[0].date ? items[0].date.slice(0, 7) : new Date().toISOString().slice(0, 7));
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed

    const monthDate = new Date(year, month - 1, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
    const lastDay = new Date(year, month, 0).getDate();
    const periodeStr = `${year}-${String(month).padStart(2, '0')}-01 s/d ${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Map items for the target month by date (YYYY-MM-DD)
    const itemsByDate: Record<string, JourneyItem[]> = {};
    items.forEach(it => {
      if (it.date && it.date.startsWith(targetMonth)) {
        if (!itemsByDate[it.date]) itemsByDate[it.date] = [];
        itemsByDate[it.date].push(it);
      }
    });

    const nik = profile?.nik ? profile.nik.trim() : '260114';
    const name = profile?.name ? profile.name.trim().toUpperCase() : 'REDHA DEFINTO';
    const role = profile?.role ? profile.role.trim().toUpperCase() : 'BACKEND';
    const defaultFileName = `${nik}_${name}_${role}.xlsx`;

    const defaultUri = vscode.workspace.workspaceFolders?.[0]
      ? vscode.Uri.file(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, defaultFileName))
      : undefined;

    const fileUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: {
        'Excel Files': ['xlsx']
      },
      title: `Simpan Timesheet Excel ${monthName} ${year} (.xlsx)`
    });

    if (!fileUri) {
      return null;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'My Journey Assistant';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(monthName, {
      views: [{ showGridLines: true }]
    });

    // Calculate dynamic auto-fit width for Column B (Start Time + Header texts)
    const col2Texts = [
      profile?.employeeStatus || 'Kontrak',
      profile?.division || 'HR Shared Services Operation',
      profile?.department || 'Recruitment & Training Operation',
      profile?.services || 'Pengadaan Kebutuhan Talent Subisidi Tepat MyPertamina 2026',
      periodeStr,
      profile?.name || 'Redha Definto',
      profile?.nik || '260114',
      'Start Time'
    ];
    const maxCol2Len = Math.max(...col2Texts.map(t => t.length));
    const col2Width = Math.max(72.7, maxCol2Len + 4);

    // Calculate dynamic width for Column D (Task Description)
    let maxTaskLineLen = 60;
    Object.values(itemsByDate).forEach(dayList => {
      dayList.forEach(t => {
        const fullLen = (t.jiraKey ? `[${t.jiraKey}] ` : '[BE] ') + t.title;
        if (fullLen.length > maxTaskLineLen) maxTaskLineLen = fullLen.length;
        if (t.notes && t.notes.length > maxTaskLineLen) maxTaskLineLen = t.notes.length;
      });
    });
    const col4Width = Math.min(220, Math.max(90, maxTaskLineLen + 6));

    // Column definitions with dynamic auto-fitting widths matching template
    worksheet.columns = [
      { key: 'colA', width: 24 },          // Col 1: Date
      { key: 'colB', width: col2Width },     // Col 2: Start Time & Header (Longest text)
      { key: 'colC', width: 22 },          // Col 3: End Time & Role
      { key: 'colD', width: col4Width },    // Col 4: Task Description & Level
      { key: 'colE', width: 28 },          // Col 5: Location & Position
      { key: 'colF', width: 14 }           // Col 6: Place
    ];

    // Styles definitions
    const boldFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF000000' } };
    const regularFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 9, color: { argb: 'FF000000' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };

    // Kuning Muda 3 (Google Sheets Light Yellow 3 / EAF1DD)
    const yellowFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEAF1DD' }
    };

    // Biru Cornflower (Google Sheets Cornflower Blue 4A86E8)
    const cornflowerBlueFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A86E8' }
    };

    // Weekend Grey #D8D8D8
    const greyWeekendFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD8D8D8' }
    };

    const blackMediumBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    };

    // Row 1: Employee Status (All Bold)
    const r1 = worksheet.addRow(['Employee Status', profile?.employeeStatus || '']);
    r1.height = 18;
    r1.getCell(1).font = boldFont;
    r1.getCell(2).font = boldFont;

    // Row 2: Division (All Bold)
    const r2 = worksheet.addRow(['Division', profile?.division || '']);
    r2.height = 18;
    r2.getCell(1).font = boldFont;
    r2.getCell(2).font = boldFont;

    // Row 3: Department (All Bold)
    const r3 = worksheet.addRow(['Department', profile?.department || '']);
    r3.height = 18;
    r3.getCell(1).font = boldFont;
    r3.getCell(2).font = boldFont;

    // Row 4: Services (All Bold)
    const r4 = worksheet.addRow(['Services', profile?.services || '']);
    r4.height = 18;
    r4.getCell(1).font = boldFont;
    r4.getCell(2).font = boldFont;

    // Row 5: Periode (All Bold)
    const r5 = worksheet.addRow(['Periode', periodeStr]);
    r5.height = 18;
    r5.getCell(1).font = boldFont;
    r5.getCell(2).font = boldFont;

    // Row 6: Nama Pekerja (All Bold + Full Kuning Muda 3 across Col B to F)
    const r6 = worksheet.addRow([
      'Nama Pekerja',
      profile?.name || '',
      profile?.role || '',
      profile?.level || '',
      profile?.position || '',
      ''
    ]);
    r6.height = 18;
    r6.getCell(1).font = boldFont;
    for (let c = 2; c <= 6; c++) {
      r6.getCell(c).fill = yellowFill;
      r6.getCell(c).font = boldFont;
    }

    // Row 7: NIK (All Bold + Full Kuning Muda 3 across Col B to F)
    const r7 = worksheet.addRow(['NIK', profile?.nik || '', '', '', '', '']);
    r7.height = 18;
    r7.getCell(1).font = boldFont;
    for (let c = 2; c <= 6; c++) {
      r7.getCell(c).fill = yellowFill;
      r7.getCell(c).font = boldFont;
    }

    // Row 8: Table Header (Biru Cornflower, White Bold Text, Black Medium Borders)
    const r8 = worksheet.addRow(['Date', 'Start Time', 'End Time', 'Task Description', 'Location', 'Place']);
    r8.height = 24;
    for (let c = 1; c <= 6; c++) {
      const cell = r8.getCell(c);
      cell.fill = cornflowerBlueFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = blackMediumBorder;
    }

    // Generate Rows 9..end for every day of the month (1 to lastDay)
    for (let day = 1; day <= lastDay; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dateFormatted = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend (Libur) -> Fill #D8D8D8
        const row = worksheet.addRow([dateFormatted, 'Libur', 'Libur', 'Libur', 'Libur', 'Libur']);
        row.height = 20;
        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c);
          cell.fill = greyWeekendFill;
          cell.font = regularFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = blackMediumBorder;
        }
      } else {
        // Workday
        const dayTasks = itemsByDate[dateKey] || [];
        let taskDescription = '';

        if (dayTasks.length > 0) {
          taskDescription = dayTasks
            .map(t => {
              const prefix = t.jiraKey ? `[${t.jiraKey}] ` : '[BE] ';
              let line = `${prefix}${t.title}`;
              if (t.notes) line += `\n${t.notes}`;
              return line;
            })
            .join('\n');
        }

        // Attendance Rule:
        // Wednesday (dayOfWeek === 3) -> FIX WFH (Location empty)
        // Other weekdays (Mon, Tue, Thu, Fri) -> FIX OFFICE (Location = GPS coordinate)
        const isWednesday = dayOfWeek === 3;
        const place = isWednesday ? 'WFH' : 'OFFICE';
        const location = isWednesday ? '' : (profile?.officeLocation || '-6.1824778, 106.8300436');

        // Randomized Start Time (07:30 - 08:15) and End Time (16:50 - 17:30)
        const seed = year * 10000 + month * 100 + day;
        const randomStart = getRandomStartTime(seed);
        const randomEnd = getRandomEndTime(seed);

        const row = worksheet.addRow([
          dateFormatted,
          randomStart,
          randomEnd,
          taskDescription,
          location,
          place
        ]);

        // Adjust row height if multi-line task description
        const lineCount = taskDescription ? taskDescription.split('\n').length : 1;
        row.height = Math.max(22, lineCount * 18);

        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c);
          cell.font = regularFont;
          cell.border = blackMediumBorder;

          if (c === 4) {
            // Task Description: left-aligned with wrap text
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          } else if (c === 1) {
            // Date: left-aligned
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          } else {
            // Start/End Time, Location, Place: centered
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }
      }
    }

    // Write file using ExcelJS buffer
    const buffer = await workbook.xlsx.writeBuffer();
    fs.writeFileSync(fileUri.fsPath, Buffer.from(buffer));

    vscode.window.showInformationMessage(
      `✅ Berhasil meng-export Timesheet Excel: ${path.basename(fileUri.fsPath)}`,
      'Buka File'
    ).then(selection => {
      if (selection === 'Buka File') {
        vscode.env.openExternal(fileUri);
      }
    });

    return fileUri.fsPath;
  }
}
