"use client";

import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/media", {
    body: formData,
    method: "POST"
  });
  const result = (await response.json().catch(() => ({}))) as { message?: string; url?: string };

  if (!response.ok || !result.url) {
    throw new Error(result.message ?? "Unable to upload image right now.");
  }

  return result.url;
}

export function ImageUploadButton({
  label = "Upload image",
  onUploaded
}: {
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      onUploaded(await uploadImageFile(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload image right now.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={`admin-action cursor-pointer ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        {isUploading ? "Uploading..." : label}
        <input
          accept="image/*"
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          type="file"
        />
      </label>
      {uploadError ? <p className="text-xs font-bold text-coral" role="alert">{uploadError}</p> : null}
    </div>
  );
}

export function ImageUploadField({
  helperText,
  label,
  onChange,
  value
}: {
  helperText?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      onChange(await uploadImageFile(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload image right now.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid content-start gap-3">
      <Input
        helperText={helperText}
        label={label}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://... or upload below"
        value={value}
      />
      <div className="grid gap-3 rounded-md border border-dashed border-black/20 bg-mist p-3">
        <div
          aria-label={`${label} preview`}
          className="aspect-[16/9] rounded-md border border-black/10 bg-white bg-contain bg-center bg-no-repeat"
          role="img"
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {value ? null : <div className="grid h-full place-items-center text-xs font-bold text-slate">No image selected</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`admin-action cursor-pointer ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {isUploading ? "Uploading..." : "Upload image"}
            <input
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          {value ? (
            <button className="admin-action text-coral" onClick={() => onChange("")} type="button">
              Clear
            </button>
          ) : null}
        </div>
        {uploadError ? <p className="text-xs font-bold text-coral" role="alert">{uploadError}</p> : null}
      </div>
    </div>
  );
}
