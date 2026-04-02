'use client';

import { useState, useCallback, useRef } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { UploadCloud, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';

interface ImageCropperProps {
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel?: () => void;
}

export function ImageCropper({ onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate the cropped image
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas sizes to match the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // As a circular cropper natively, we could clip it, but the UI guideline handles the circle.
    // The consumer might apply border-radius: 50% to make it circular.
    // However, let's make the background transparent and clip it nicely to a circle directly here to be proper.
    const circleCanvas = document.createElement('canvas');
    circleCanvas.width = pixelCrop.width;
    circleCanvas.height = pixelCrop.height;
    const circleCtx = circleCanvas.getContext('2d');
    
    if (circleCtx) {
      circleCtx.beginPath();
      circleCtx.arc(pixelCrop.width / 2, pixelCrop.height / 2, pixelCrop.width / 2, 0, 2 * Math.PI);
      circleCtx.clip();
      circleCtx.drawImage(canvas, 0, 0);
      return circleCanvas.toDataURL('image/png');
    }
    
    return canvas.toDataURL('image/jpeg');
  };

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!imageSrc) {
    return (
      <div 
        className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isHovering ? 'border-red-500 bg-red-500/10' : 'border-gray-500/50 bg-white/5 hover:border-white'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className={`w-10 h-10 mb-3 ${isHovering ? 'text-red-500' : 'text-gray-400'}`} />
        <p className="text-gray-300 font-medium">Click or drag image here</p>
        <p className="text-gray-500 text-sm mt-1">Recommended 1:1 aspect ratio</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-black/40 border border-white/20 rounded-2xl overflow-hidden shadow-inner">
      <div className="relative h-[300px] w-full">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={handleCropCompleteHandler}
          onZoomChange={setZoom}
        />
      </div>
      <div className="p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-4 text-white">
          <ZoomOut className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            className="flex-1 accent-red-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setImageSrc(null);
              if (onCancel) onCancel();
            }}
            className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
          >
             {onCancel ? 'Cancel' : 'Choose Different'}
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Image
          </Button>
        </div>
      </div>
    </div>
  );
}
