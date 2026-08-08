"use client";

import { useRef, useState } from "react";
import { Upload, ImagePlus, X } from "lucide-react";

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const removeImage = () => {
    setPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">

      <h2 className="mb-6 text-2xl font-bold text-white">
        📷 Upload Complaint Image
      </h2>

      {!preview ? (
        <label className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 transition hover:border-blue-500">

          <Upload className="mb-4 h-12 w-12 text-blue-400" />

          <p className="text-lg font-medium text-white">
            Click to Upload
          </p>

          <p className="mt-2 text-slate-400">
            JPG, PNG, JPEG
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />

        </label>
      ) : (
        <div className="relative">

          <img
            src={preview}
            alt="Preview"
            className="h-96 w-full rounded-2xl object-cover"
          />

          <button
            onClick={removeImage}
            className="absolute right-4 top-4 rounded-full bg-red-600 p-2 text-white"
          >
            <X size={18} />
          </button>

          <div className="mt-5 flex gap-4">

            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              <ImagePlus className="mr-2 inline h-5 w-5" />
              Change Image
            </button>

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

          </div>

        </div>
      )}

    </div>
  );
}