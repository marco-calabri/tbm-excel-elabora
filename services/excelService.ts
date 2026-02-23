
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { ProcessingOptions } from '../types';

/**
 * Elabora il file Excel seguendo fedelmente la macro VBA e lo screenshot di riferimento.
 */
export const processExcelFile = async (file: File, options: ProcessingOptions): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error("Il file è vuoto.");
  }

  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch (err: any) {
    console.error("ExcelJS Load Error:", err);
    throw new Error("Errore nel caricamento del file .xlsx.");
  }

  workbook.worksheets.forEach((worksheet) => {
    // 1. Eliminazione riga 1 originale (se richiesto)
    if (options.deleteFirstRow) {
      worksheet.spliceRows(1, 1);
    }

    // 2. Definizione intestazioni specifiche (nuova riga 1)
    worksheet.getCell('E1').value = 'Codice';
    worksheet.getCell('F1').value = 'Configurazione';
    worksheet.getCell('G1').value = 'Revisione';

    // Determiniamo l'area di azione (fino alla colonna L = 12)
    const lastRow = Math.max(worksheet.rowCount, 50); 
    const lastCol = 12; 

    // 3. Ciclo di formattazione cella per cella
    for (let r = 1; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      row.height = 20; // Altezza riga fissa 20

      for (let c = 1; c <= lastCol; c++) {
        const cell = row.getCell(c);

        // --- FONT (Tahoma 8) ---
        cell.font = {
          name: 'Tahoma',
          size: 8,
          bold: false, // MODIFICA: Grassetto rimosso (era: bold: r === 1)
          color: { argb: 'FF000000' }
        };

        // --- BORDI (Sottili e più chiari) ---
        // MODIFICA: Colore cambiato da FF000000 (Nero) a FFB0B0B0 (Grigio Chiaro)
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          right: { style: 'thin', color: { argb: 'FFB0B0B0' } }
        };

        // --- ALLINEAMENTO ---
        if (r === 1) {
          // Riga 1: Tutto centrato
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: false
          };
          
          // --- SFONDO GRIGIO INTESTAZIONE ---
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDCDCDC' }
          };
        } else {
          // Righe dati
          if (c === 4) {
            // Colonna D (Descrizione): SINISTRA
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'left',
              wrapText: false
            };
          } else {
            // Tutte le altre: CENTRO
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'center',
              wrapText: false
            };
          }
          // Nessun riempimento per le righe dati
          cell.fill = { type: 'pattern', pattern: 'none' };
        }
      }
    }

    // 4. Filtro automatico e Blocco riquadri
    const lastColLetter = worksheet.getColumn(lastCol).letter;
    worksheet.autoFilter = `A1:${lastColLetter}1`;
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
    ];

    // 5. Auto-fit colonne migliorato
    worksheet.columns.forEach((column, i) => {
      if (i < lastCol) {
        let maxLen = 10;
        column.eachCell?.({ includeEmpty: false }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          if (val.length > maxLen) maxLen = val.length;
        });
        column.width = Math.min(maxLen + 4, 60);
      }
    });
  });

  // Generazione del file finale
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const finalFileName = `${options.baseFileName}_${options.suffix}.xlsx`;
  
  FileSaver.saveAs(blob, finalFileName);
};

export const getExcelPreview = async (file: File): Promise<{ data: any[][], isFirstRowEmpty: boolean }> => {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  const previewData: any[][] = [];
  
  // Controlla se la prima riga è effettivamente vuota (nessun valore in nessuna cella)
  const firstRow = worksheet.getRow(1);
  let isFirstRowEmpty = true;
  firstRow.eachCell({ includeEmpty: false }, () => {
    isFirstRowEmpty = false;
  });

  // Colonne C, D, E, F, G sono 3, 4, 5, 6, 7
  const targetCols = [3, 4, 5, 6, 7];
  
  for (let i = 1; i <= Math.min(worksheet.rowCount, 6); i++) {
    const row = worksheet.getRow(i);
    const rowData = targetCols.map(colIndex => {
      const cell = row.getCell(colIndex);
      return cell.value?.toString() || '';
    });
    previewData.push(rowData);
  }
  
  return { data: previewData, isFirstRowEmpty };
};
