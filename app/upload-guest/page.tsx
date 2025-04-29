"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

export default function UploadGuestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (files: File[]) => {
    const selectedFile = files[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please upload the file!");
      setTimeout(() => {
        setMessage("");
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setMessage("");

    try {
      const response = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("File uploaded successfully!");
        setTimeout(() => {
          setMessage("");
        }, 5000);
        setFile(null);
      } else {
        setMessage(result.error || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full px-3 md:px-0">
      <div className="px-5 py-4 mt-20 w-full max-w-3xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-500 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={handleFileChange} files={file ? [file] : []} />
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="mb-3 w-full bg-neutral-600 text-neutral-100 py-2 rounded-sm hover:bg-neutral-700 transition-colors duration-200 disabled:bg-neutral-500 cursor-pointer"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {message && (
          <p className="my-6 text-center text-neutral-700 font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
