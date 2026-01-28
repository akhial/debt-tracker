import { useCallback, useState } from "react";
import { Upload, X, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,application/pdf,text/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (file.size > maxSize) {
        setError(
          `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
        );
        return false;
      }

      return true;
    },
    [maxSize],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input
      e.target.value = "";
    },
    [handleFile],
  );

  return (
    <div className={className}>
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-zinc-700 hover:border-zinc-600",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mb-2 h-8 w-8 text-zinc-400" />
        <span className="text-sm text-zinc-400">
          Drop a file here, or click to select
        </span>
        <span className="mt-1 text-xs text-zinc-500">
          Max {Math.round(maxSize / 1024 / 1024)}MB
        </span>
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface FilePreviewProps {
  fileName: string;
  fileSize: number;
  contentType: string;
  onRemove?: () => void;
  onView?: () => void;
  isLoading?: boolean;
}

export function FilePreview({
  fileName,
  fileSize,
  contentType,
  onRemove,
  onView,
  isLoading,
}: FilePreviewProps) {
  const isImage = contentType.startsWith("image/");
  const Icon = isImage ? Image : FileText;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-700">
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{fileName}</p>
        <p className="text-xs text-zinc-500">{formatSize(fileSize)}</p>
      </div>
      <div className="flex gap-1">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            disabled={isLoading}
          >
            View
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
