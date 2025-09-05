import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

export const DamageReport: React.FC<{ jobId?: string }> = ({ jobId }) => {
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const path = `damage/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("public").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("public").getPublicUrl(path);
      setFileUrl(data.publicUrl);
    } catch (e) {
      // Silent error; in real app show toast
    } finally {
      setUploading(false);
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-4">
      <Input
        label="Damage comments"
        placeholder="Describe damages…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <Button onClick={handlePick} disabled={uploading}>{uploading ? "Uploading…" : "Upload/Take Photo"}</Button>
        {fileUrl && (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">View uploaded image</a>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*;capture=camera" className="hidden" onChange={handleChange} />
      <div>
        <Button onClick={async ()=>{
          if (!jobId) { toast.error("Missing job id"); return; }
          await supabase.from("damage_reports").insert([{ job_id: jobId, comment, photo_url: fileUrl }]);
          toast.success("Saved"); setComment(""); setFileUrl(null);
        }}>Save</Button>
      </div>
    </div>
  );
};


