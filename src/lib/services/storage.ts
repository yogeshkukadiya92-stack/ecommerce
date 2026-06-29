export type UploadTarget = "product-image" | "label-image" | "lab-report" | "blog-media";

export async function createUploadPlaceholder(target: UploadTarget, filename: string) {
  return {
    target,
    filename,
    uploadUrl: `/api/uploads/${target}/${filename}`,
    message: "Storage provider integration placeholder."
  };
}
