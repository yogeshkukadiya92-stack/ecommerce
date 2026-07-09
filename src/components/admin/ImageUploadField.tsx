"use client";

import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { getCurrentAdminSession } from "@/lib/admin/adminAuth";
import { adminJsonHeaders } from "@/lib/admin/adminApiClient";
import { Input } from "@/components/ui/Input";

export async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/media", {
    body: formData,
    headers: adminJsonHeaders(getCurrentAdminSession()),
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
  compact = false,
  helperText,
  label,
  onChange,
  value
}: {
  compact?: boolean;
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
          className={`rounded-md border border-black/10 bg-white bg-contain bg-center bg-no-repeat ${
            compact ? "h-40" : "aspect-[16/9]"
          }`}
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

export function MultiImageUploadField({
  helperText,
  label,
  onChange,
  value
}: {
  helperText?: string;
  label: string;
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const [draftUrl, setDraftUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function addUrl(url: string) {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return;
    }

    onChange([...value, trimmedUrl]);
    setDraftUrl("");
  }

  async function handleFiles(files?: FileList | null) {
    if (!files?.length) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const uploadedUrls = await Promise.all(Array.from(files).map((file) => uploadImageFile(file)));
      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload images right now.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, imageIndex) => imageIndex !== index));
  }

  function makePrimary(index: number) {
    onChange([value[index], ...value.filter((_, imageIndex) => imageIndex !== index)].filter(Boolean));
  }

  return (
    <div className="grid content-start gap-3">
      <div>
        <p className="mb-2 block text-sm font-semibold text-ink">{label}</p>
        {helperText ? <p className="text-xs text-slate">{helperText}</p> : null}
      </div>
      <div className="rounded-md border border-dashed border-black/20 bg-mist p-3">
        {value.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {value.map((url, index) => (
              <div className="overflow-hidden rounded-md border border-black/10 bg-white shadow-sm" key={`${url}-${index}`}>
                <div
                  aria-label={`${label} ${index + 1}`}
                  className="aspect-square bg-white bg-contain bg-center bg-no-repeat"
                  role="img"
                  style={{ backgroundImage: `url(${url})` }}
                />
                <div className="grid gap-2 p-2">
                  <p className="truncate text-xs font-bold text-slate">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</p>
                  <div className="flex flex-wrap gap-2">
                    {index > 0 ? (
                      <button className="admin-action px-2 py-1" onClick={() => makePrimary(index)} type="button">
                        Make main
                      </button>
                    ) : null}
                    <button className="admin-action px-2 py-1 text-coral" onClick={() => removeImage(index)} type="button">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-32 place-items-center rounded-md border border-black/10 bg-white text-xs font-bold text-slate">
            No product photos selected
          </div>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="Paste image URL"
            value={draftUrl}
          />
          <button className="admin-action" onClick={() => addUrl(draftUrl)} type="button">
            Add URL
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className={`admin-action cursor-pointer ${isUploading ? "pointer-events-none opacity-60" : ""}`}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {isUploading ? "Uploading..." : "Upload photos"}
            <input
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              multiple
              onChange={(event) => {
                void handleFiles(event.target.files);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          {value.length > 0 ? (
            <button className="admin-action text-coral" onClick={() => onChange([])} type="button">
              Clear all
            </button>
          ) : null}
        </div>
        {uploadError ? <p className="mt-2 text-xs font-bold text-coral" role="alert">{uploadError}</p> : null}
      </div>
    </div>
  );
}
