import { useId, useState } from "react";

import type { UploadWidgetProps } from "@/@types";
import { ALLOWED_TYPES, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL, MAX_FILE_SIZE } from "@/constants";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Input } from "./input";

const UploadWidget = ({ value = null, onChange, disabled = false }: UploadWidgetProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PNG, JPG, JPEG, and WEBP files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 3MB or less.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      const payload = new FormData();
      payload.append("file", file);
      payload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = (await response.json()) as {
        secure_url?: string;
        public_id?: string;
      };

      if (!result.secure_url || !result.public_id) {
        throw new Error("Invalid upload response");
      }

      onChange?.({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch {
      setError("Failed to upload image. Try again.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = () => {
    setError("");
    onChange?.(null);
  };

  return (
    <div className="space-y-3">
      <Input
        id={inputId}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {value?.url ? (
        <div className="space-y-3 rounded-md border p-3">
          <img
            src={value.url}
            alt="Uploaded preview"
            className={cn("h-40 w-full rounded-md object-cover", disabled && "opacity-80")}
          />
          <Button type="button" variant="outline" onClick={removeImage} disabled={disabled || isUploading}>
            Remove Image
          </Button>
        </div>
      ) : null}

      {isUploading ? <p className="text-sm text-muted-foreground">Uploading image...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

export default UploadWidget;
