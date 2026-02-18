import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FiUpload, FiX, FiSmile } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessCategory?: string;
  onSuccess: (category: any) => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  businessCategory,
  onSuccess,
}: CategoryDialogProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      // Upload image if provided
      if (image) {
        imageUrl = await api.uploadImage(image, "categories");
      }

      const response = await api.createCategory({
        name: name.trim(),
        emoji,
        image: imageUrl,
      });

      if (response.success) {
        toast.success("Category added successfully!");
        onSuccess(response.data);
        resetForm();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add category");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmoji("🍽️");
    removeImage();
    setShowEmojiPicker(false);
  };

  const getCategoryPlaceholder = () => {
    if (businessCategory === "Retail / E-Commerce Businesses") return "e.g., Electronics";
    if (businessCategory === "Creative & Design") return "e.g., Logo Design";
    if (businessCategory === "Professional Services") return "e.g., Consulting";
    return "e.g., Appetizers";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {businessCategory === "Retail / E-Commerce Businesses"
              ? "Add Product Category"
              : businessCategory === "Creative & Design"
              ? "Add Portfolio Category"
              : "Add Menu Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Image Upload */}
          <div>
            <Label>Category Image (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                >
                  <FiUpload className="w-6 h-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Category Name */}
          <div>
            <Label>Category Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getCategoryPlaceholder()}
              className="mt-1"
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <Label>Emoji *</Label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="🍽️"
                    className="text-2xl text-center"
                    maxLength={2}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-10 w-10"
                >
                  <FiSmile className="w-5 h-5" />
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="absolute z-50 mt-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full z-10"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={400}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
            {uploading ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
