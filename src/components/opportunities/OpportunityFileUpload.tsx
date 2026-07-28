import React, { useRef, useState } from 'react';
import { OpportunityFile, User } from '../../types';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  FileCode,
  X,
  File,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OpportunityFileUploadProps {
  opportunityId: string;
  files: OpportunityFile[];
  currentUser: User | null;
  onAddFile: (file: OpportunityFile) => void;
  onDeleteFile: (fileId: string) => void;
  readOnly?: boolean;
}

export const OpportunityFileUpload: React.FC<OpportunityFileUploadProps> = ({
  opportunityId,
  files = [],
  currentUser,
  onAddFile,
  onDeleteFile,
  readOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<OpportunityFile | null>(null);

  const getFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (fileType.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-indigo-500" />;
    }
    if (fileType.includes('video') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext) || fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (['doc', 'docx'].includes(ext) || fileType.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (ext === 'pdf' || fileType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const newFileItem: OpportunityFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            opportunityId,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileType: file.type || file.name.split('.').pop() || 'unknown',
            dataUrl,
            uploadedAt: new Date().toLocaleDateString('fa-IR'),
            uploadedByUserId: currentUser?.id || 'user-1',
            uploadedByName: currentUser?.name || 'کارشناس سیستم',
            uploadedByRole: currentUser?.role || 'sales',
          };

          onAddFile(newFileItem);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (file: OpportunityFile) => {
    if (!file.dataUrl) return;
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 dir-rtl text-white shadow-inner">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-sm text-slate-100">
            مستندات و فایل‌های پیوست فرصت ({files.length})
          </h3>
        </div>

        {!readOnly && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>افزودن فایل / پیوست جدید</span>
            </button>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="py-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">
            هیچ فایلی برای این فرصت بارگذاری نشده است.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            فرمت‌های مجاز: عکس، ویدیو، PDF، فایل‌های Word، Excel، PowerPoint و فایل‌های پروژه
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {files.map((file) => {
            const ext = file.fileName.split('.').pop()?.toLowerCase() || '';
            const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || file.fileType.includes('image');

            return (
              <div
                key={file.id}
                className="bg-slate-900/80 border border-slate-700/80 hover:border-teal-500/50 rounded-xl p-3 flex items-center justify-between gap-3 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                    {getFileIcon(file.fileType, file.fileName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 truncate dir-ltr text-right" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span>{file.uploadedByName} ({file.uploadedAt})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isImage && file.dataUrl && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      title="پیش‌نمایش تصویر"
                      className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(file)}
                    title="دانلود فایل"
                    className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!readOnly && (
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      title="حذف فایل"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal for Images */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 overflow-hidden relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h4 className="font-bold text-sm text-slate-200 truncate dir-ltr text-right">
                  {previewFile.fileName}
                </h4>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-slate-950 p-2">
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.fileName}
                  className="max-h-[65vh] object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-end mt-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود تصویر با کیفیت اصلی</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
