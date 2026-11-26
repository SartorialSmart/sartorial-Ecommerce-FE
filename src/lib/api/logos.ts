import { apiRequest } from "./client";

interface LogoUploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export interface UploadedLogo {
  publicId: string;
  url: string;
}

export async function uploadStoreLogo(file: File): Promise<UploadedLogo> {
  const signature = await apiRequest<LogoUploadSignature>("/logos/upload-signature/", {
    method: "POST",
    tenantSlug: null,
    body: {},
  });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.api_key);
  form.append("timestamp", String(signature.timestamp));
  form.append("signature", signature.signature);
  form.append("folder", signature.folder);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: "POST", body: form },
  );
  if (!response.ok) throw new Error("The logo upload failed.");
  const uploaded = (await response.json()) as { public_id?: string; secure_url?: string };
  if (!uploaded.public_id) throw new Error("Cloudinary did not return a logo ID.");
  return {
    publicId: uploaded.public_id,
    url:
      uploaded.secure_url ||
      `https://res.cloudinary.com/${signature.cloud_name}/image/upload/${uploaded.public_id}`,
  };
}
