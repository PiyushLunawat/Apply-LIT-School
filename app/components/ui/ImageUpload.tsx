import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react'; // Icons for editing and deleting
import { Button } from './button';
import { useNavigate } from '@remix-run/react';
import { submitTokenReceipt } from '~/utils/studentAPI';

interface TokenPaymentDialogProps {
  paymentType: string;
  
}

const ImageUpload: React.FC<TokenPaymentDialogProps> = ({ paymentType }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null); // State for the uploaded file
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      // Preview image
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);
      setReceiptFile(file); // Store the selected file for upload
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null); // Remove the image preview
    setReceiptFile(null); // Remove the file from state
  };

  const handleEditImage = () => {
    document.getElementById('image-upload')?.click();
  };

  const handleSubmitImage = async () => {
    if (!receiptFile) {
      alert('Please upload a receipt image.');
      return;
    }

    setIsUploading(true);
    setUploadError(null); // Clear previous errors

    const formData = new FormData();
    formData.append('paymentType', paymentType); // Add paymentType to formData
    formData.append('receipt', receiptFile); // Add receipt image file to formData

    try {
      const response = await submitTokenReceipt(formData);

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const data = await response.json();
      console.log('Receipt uploaded successfully:', data);
      navigate('../application/step-3');
    } catch (error) {
      setUploadError('Error uploading receipt. Please try again.');
      console.error('Error uploading receipt:', error);
    } finally {
      setIsUploading(false);
    }
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
