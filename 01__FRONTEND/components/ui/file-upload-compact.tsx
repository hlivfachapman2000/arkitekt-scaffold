"use client"

import { cn } from "@/lib/utils";
import React, { useCallback, useState } from "react";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

interface FileUploadCompactProps {
  onFilesUploaded: (files: File[]) => void;
  className?: string;
}

export function FileUploadCompact({ onFilesUploaded, className }: FileUploadCompactProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      onFilesUploaded(acceptedFiles);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  const clearFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/40 bg-black p-3 transition-all",
          isDragActive ? "border-white bg-black/60 scale-[1.02]" : "hover:border-white/60 hover:bg-black/40"
        )}
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-1">
            <IconUpload className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-mono text-gray-500">DROP FILES</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <IconFile className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-300">{files.length} file{files.length > 1 ? "s" : ""}</span>
            <button
              onClick={clearFiles}
              className="ml-1 border border-white/20 p-0.5 hover:border-white"
            >
              <IconX className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
