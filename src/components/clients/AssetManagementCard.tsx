import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  File,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "other";
  size: string;
  uploadedAt: string;
}

interface AssetManagementCardProps {
  assets?: Asset[];
  onUpload?: (files: FileList) => void;
  onDownload?: (assetId: string) => void;
  onDelete?: (assetId: string) => void;
}

const getFileIcon = (type: Asset["type"]) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-destructive" />;
    case "image":
      return <Image className="h-5 w-5 text-primary" />;
    case "doc":
      return <FileSpreadsheet className="h-5 w-5 text-success" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

export function AssetManagementCard({
  assets = [],
  onUpload,
  onDownload,
  onDelete,
}: AssetManagementCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onUpload?.(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Documents & Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-accent/50"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          )}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-secondary p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop files here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, Images, Documents up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Uploaded Files
          </h4>
          
          {assets.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No files uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(asset.type)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset.size} • {asset.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownload?.(asset.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete?.(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
