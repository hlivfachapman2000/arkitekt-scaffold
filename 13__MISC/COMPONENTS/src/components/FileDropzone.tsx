import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Database, BrainCircuit, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const FileDropzone = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('FILES DROPPED:', acceptedFiles);
    // HERE WE WOULD TRIGGER THE SMART FUNCTIONS TO VECTORIZE, ORGANIZE, ETC.
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="h-full flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white tracking-tighter">DATA INGESTION ENGINE</h2>
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">SYSTEM_VERSION: ALPHA_V0.1</span>
      </div>

      <div
        {...getRootProps()}
        className={`flex-1 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-6 p-12 transition-all ${
          isDragActive ? 'border-lime-500 bg-lime-500/5' : 'border-white/10 hover:border-zinc-500 bg-[#0c0c0c]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center">
            <Upload size={40} className="text-zinc-400" />
        </div>
        <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">DROP ANYTHING HERE</h3>
            <p className="text-zinc-500 font-mono text-sm max-w-sm">VECTORIZATION_ACTIVE // AUTO_ORGANIZATION_ENABLED // DEEP_SCAN_ENABLED</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
            { icon: FileText, label: "DOCUMENT_ANALYSIS" },
            { icon: Database, label: "DB_INDEXING" },
            { icon: BrainCircuit, label: "SEMANTIC_VEC" },
        ].map(feat => (
            <div key={feat.label} className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-zinc-400"><feat.icon size={20} /></div>
                <span className="text-zinc-300 font-bold text-xs tracking-tight">{feat.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};
