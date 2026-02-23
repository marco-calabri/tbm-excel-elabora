
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
      <div className="max-w-[1600px] w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Elaboratore Excel Pro</h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
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
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedSuffix(FileSuffix.PRT)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      selectedSuffix === FileSuffix.PRT 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span>PRT_COMPILATO</span>
                    {selectedSuffix === FileSuffix.PRT && <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSelectedSuffix(FileSuffix.STR)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      selectedSuffix === FileSuffix.STR 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span>STR_COMPILATO</span>
                    {selectedSuffix === FileSuffix.STR && <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Opzione Eliminazione Riga */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Elimina prima riga</p>
                  <p className="text-[10px] text-slate-500">Rimuove l'intestazione originale</p>
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
          </div>

          {/* Right Column: Preview & Status */}
          <div className="lg:col-span-8 space-y-6">
            {/* Status & Preview Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseNameInput && (
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col justify-center">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1 tracking-widest">Preview Nome File:</p>
                  <p className="text-lg font-mono font-bold text-emerald-700 truncate">
                    {baseNameInput}_{selectedSuffix}.xlsx
                  </p>
                </div>
              )}
              {status.type && (
                <div className={`p-6 rounded-3xl flex items-center space-x-4 border ${
                  status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {status.type === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              )}
            </div>

            {/* Anteprima Tabella */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Info className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Anteprima Dati</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Visualizzazione Colonne C-G (Prime 6 righe)</p>
                  </div>
                </div>
                {previewData.length > 0 && deleteFirstRow && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-tight">
                    Riga 1 in eliminazione
                  </span>
                )}
              </div>
              
              <div className="p-0">
                {previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          {['C', 'D', 'E', 'F', 'G'].map(col => (
                            <th key={col} className="px-6 py-4 text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-widest">
                              Colonna {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr 
                            key={rowIndex} 
                            className={`transition-colors border-b border-slate-50 last:border-b-0 ${
                              rowIndex === 0 && deleteFirstRow ? 'bg-red-50/50' : 'hover:bg-slate-50/30'
                            }`}
                          >
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className={`px-6 py-4 text-xs font-mono text-slate-600 truncate max-w-[200px] ${
                                rowIndex === 0 && deleteFirstRow ? 'text-red-400 line-through' : ''
                              }`}>
                                {cell || <span className="text-slate-300 italic">vuoto</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <Upload className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">Carica un file per vedere l'anteprima</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            TBM System 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
