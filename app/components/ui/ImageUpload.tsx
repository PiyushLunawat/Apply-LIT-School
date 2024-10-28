import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react'; // Icons for editing and deleting
import { Button } from './button';

const ImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null); // Remove the image
  };

  // Trigger file input for editing the image
  const handleEditImage = () => {
    document.getElementById('image-upload')?.click();
  };

  return (
    <div className="flex flex-col items-center">
      {selectedImage ? (
        <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
          <img
            src={selectedImage}
            alt="Uploaded receipt"
            className="rounded-xl w-full h-full object-cover "
          />

          <div className="absolute top-3 right-3 flex space-x-2">
            <Button variant="outline" size="icon"
              className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
              onClick={handleEditImage}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon"
              className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
              onClick={handleDeleteImage}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center bg-[#64748B33] p-4 rounded-xl border-[#2C2C2C] w-full h-[220px]"
        >
          <div className="flex flex-col items-center space-y-3">
            <img
              src="/assets/images/receipt-icon.svg"
              alt="Upload icon"
              className="w-14 h-14"
            />
            <p className="text-sm">Upload your Acknowledgement Receipt</p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
