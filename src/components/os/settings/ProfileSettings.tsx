import { useEffect, useRef, useState } from "react";
import { Camera, Check, Trash2, User, X } from "lucide-react";
import { toast } from "sonner";
import { processAvatarFile, validateAvatarFile } from "@/lib/os/avatar";
import { applyProfileUpdate, selectProfileSettings } from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import { Button, Input, Label } from "@/components/os/ui";
import { ProfileAvatar } from "@/components/os/ProfileAvatar";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export function ProfileSettings() {
  const { state, update } = useOS();
  const profile = selectProfileSettings(state);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.userName);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setNameInput(profile.userName);
    setNameError(null);
  }, [profile.userName]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image file");
      e.target.value = "";
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await processAvatarFile(file, 256);
      setPreviewAvatar(dataUrl);
      toast.info("Image preview ready. Click 'Save Photo' to apply.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to process image";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  const handleSaveAvatar = () => {
    if (!previewAvatar) return;
    let saved = false;
    update((s) => {
      const res = applyProfileUpdate(s, { userAvatar: previewAvatar });
      if (!res.ok) return s;
      saved = true;
      return res.state;
    });
    if (saved) {
      setPreviewAvatar(null);
      toast.success("Profile photo saved");
    }
  };

  const handleCancelPreview = () => {
    setPreviewAvatar(null);
    toast.info("Profile photo preview discarded");
  };

  const handleRemoveAvatar = () => {
    update((s) => {
      const res = applyProfileUpdate(s, { userAvatar: null });
      return res.ok ? res.state : s;
    });
    setPreviewAvatar(null);
    toast.success("Profile photo removed");
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyProfileUpdate(state, { userName: nameInput });
    if (!res.ok) {
      setNameError(res.error);
      toast.error(res.error);
      return;
    }
    setNameError(null);
    update((s) => {
      const next = applyProfileUpdate(s, { userName: nameInput });
      return next.ok ? next.state : s;
    });
    toast.success("Display name saved");
  };

  const isNameDirty = nameInput.trim() !== profile.userName;

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Profile & Identity"
        description="Manage your founder display name and circular profile photo across Yash OS."
        icon={User}
      />

      <div className="flex flex-col gap-5 rounded-2xl border border-glass-border/60 bg-secondary/20 p-5 sm:flex-row sm:items-center">
        <div className="relative flex shrink-0 justify-center">
          <ProfileAvatar
            src={previewAvatar || profile.userAvatar}
            name={profile.userName}
            size="xl"
            className={previewAvatar ? "ring-2 ring-primary" : undefined}
          />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Profile Photo
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Displayed in the top bar and review print views. Accepts PNG, JPG,
              WebP, SVG, or GIF up to 5 MB and crops locally to 256×256.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            aria-label="Upload profile photo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-wrap items-center gap-2">
            {previewAvatar ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAvatar}
                  disabled={isProcessing}
                >
                  <Check className="h-4 w-4" />
                  Save Photo
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleCancelPreview}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Camera className="h-4 w-4" />
                  {profile.userAvatar ? "Replace Photo" : "Upload Photo"}
                </Button>
                {profile.userAvatar && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Photo
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handleSaveName} className="space-y-3">
        <Label htmlFor="settings-user-name">Display Name</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="settings-user-name"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="e.g. Yash"
            maxLength={80}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!isNameDirty && !nameError}
            className="shrink-0"
          >
            Save Name
          </Button>
        </div>
        {nameError ? (
          <p role="alert" className="text-xs text-destructive">
            {nameError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Shown in the Home greeting, avatar initials fallback, and exported
            review headers. Personal identity stays separate from the Yash OS
            brand.
          </p>
        )}
      </form>
    </div>
  );
}
