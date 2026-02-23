
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2, Info, Edit3 } from 'lucide-react';
import { FileSuffix, ProcessingOptions } from './types';
import { processExcelFile, getExcelPreview } from './services/excelService';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [baseNameInput, setBaseNameInput] = useState('');
  const [selectedSuffix, setSelectedSuffix] = useState<FileSuffix>(FileSuffix.PRT);
  const [deleteFirstRow, setDeleteFirstRow] = useState(false);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // Aggiorna il nome base quando viene caricato un file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        const fullNameNoExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFile(selectedFile);
        
        // Estrai nome base (rimuove eventuali suffissi esistenti per pulizia)
        const cleanBase = fullNameNoExt.split('_')[0];
        setBaseNameInput(cleanBase);
        
        // Rileva automaticamente il tipo consigliato
        if (fullNameNoExt.toUpperCase().includes('_STR')) {
          setSelectedSuffix(FileSuffix.STR);
        } else {
          setSelectedSuffix(FileSuffix.PRT);
        }
        
        setStatus({ type: null, message: '' });

        // Carica anteprima
        try {
          const { data, isFirstRowEmpty } = await getExcelPreview(selectedFile);
          setPreviewData(data);
          setDeleteFirstRow(isFirstRowEmpty);
        } catch (err) {
          console.error("Errore anteprima:", err);
        }
      } else {
        setFile(null);
        setPreviewData([]);
        setStatus({ 
          type: 'error', 
          message: 'Formato non supportato. Per favore carica un file .xlsx' 
        });
      }
    }
  };

  const handleProcess = async () => {
    if (!file || !baseNameInput) {
      setStatus({ type: 'error', message: 'Inserire il nome base e caricare un file' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: null, message: '' });

    try {
      const options: ProcessingOptions = {
        baseFileName: baseNameInput,
        suffix: selectedSuffix,
        deleteFirstRow: deleteFirstRow
      };
      await processExcelFile(file, options);
      setStatus({ type: 'success', message: `File "${baseNameInput}_${selectedSuffix}.xlsx" scaricato con successo!` });
    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', message: 'Errore: ' + (error.message || 'Errore durante l\'elaborazione') });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Elaboratore Excel Pro</h1>
          <p className="text-slate-500 italic">Formattazione riga 1, allineamento Col D e naming personalizzato</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8 space-y-8">
          
          {/* Nome Controllo */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 block uppercase tracking-widest">
              1. Nome Controllo (Base File)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Edit3 className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={baseNameInput}
                onChange={(e) => setBaseNameInput(e.target.value)}
                placeholder="es. BA006220"
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono"
              />
            </div>
          </div>

          {/* Caricamento */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 block uppercase tracking-widest">
              2. Caricamento File Originale
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 transition-colors group cursor-pointer bg-slate-50/50">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <Upload className={`w-6 h-6 ${file ? 'text-emerald-500' : 'text-slate-400 group-hover:text-blue-500'}`} />
                <p className="text-sm font-medium text-slate-600 px-4 text-center">
                  {file ? file.name : "Trascina o clicca per caricare"}
                </p>
              </div>
            </div>
          </div>

          {/* Scelta Suffisso */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 block uppercase tracking-widest">
              3. Seleziona Suffisso Download
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedSuffix(FileSuffix.PRT)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  selectedSuffix === FileSuffix.PRT 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                PRT_COMPILATO
              </button>
              <button
                onClick={() => setSelectedSuffix(FileSuffix.STR)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  selectedSuffix === FileSuffix.STR 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                STR_COMPILATO
              </button>
            </div>
          </div>

          {/* Opzione Eliminazione Riga */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Elimina prima riga</p>
                <p className="text-[10px] text-slate-500">Rimuove l'intestazione originale del file caricato</p>
              </div>
              <button
                onClick={() => setDeleteFirstRow(!deleteFirstRow)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  deleteFirstRow ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    deleteFirstRow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Anteprima Tabella */}
            {previewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anteprima (Col C-G, prime 5 righe)</p>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-bottom border-slate-200">
                          {['C', 'D', 'E', 'F', 'G'].map(col => (
                            <th key={col} className="px-3 py-2 text-[10px] font-bold text-slate-400 border-r border-slate-200 last:border-r-0">
                              Col {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr 
                            key={rowIndex} 
                            className={`border-b border-slate-100 last:border-b-0 ${
                              rowIndex === 0 && deleteFirstRow ? 'bg-red-50 opacity-50' : ''
                            }`}
                          >
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-1.5 text-[10px] font-mono text-slate-600 border-r border-slate-100 last:border-r-0 truncate max-w-[120px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {deleteFirstRow && (
                  <p className="text-[9px] text-red-500 font-medium italic">* La riga evidenziata in rosso verrà eliminata</p>
                )}
              </div>
            )}
          </div>

          {/* Preview Nome */}
          {baseNameInput && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Preview Nome File:</p>
              <p className="text-sm font-mono font-bold text-emerald-700 truncate">
                {baseNameInput}_{selectedSuffix}.xlsx
              </p>
            </div>
          )}

          {/* Status */}
          {status.type && (
            <div className={`p-4 rounded-xl flex items-start space-x-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-xs font-medium">{status.message}</p>
            </div>
          )}

          {/* Action */}
          <button
            onClick={handleProcess}
            disabled={!file || !baseNameInput || isProcessing}
            className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-2 font-bold text-white shadow-lg transition-all ${
              !file || !baseNameInput || isProcessing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'
            }`}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isProcessing ? 'Elaborazione...' : 'Elabora e Scarica'}</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Specifiche: Tahoma 8 | Row H: 20 | Header: #DCDCDC | Col D Data: Left
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
