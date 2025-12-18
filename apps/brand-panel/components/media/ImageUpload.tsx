'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { apiClient } from '@/lib/api/client'
import { Media } from '@/lib/types/payload'

interface ImageUploadProps {
  onUploadComplete: (media: Media) => void
  aspectRatio?: number // e.g., 1 for square, 16/9 for landscape, etc.
  cropShape?: 'rect' | 'round'
  maxSizeMB?: number
  accept?: string
  label?: string
  existingImage?: Media
}

export function ImageUpload({
  onUploadComplete,
  aspectRatio = 1, // Default to square
  cropShape = 'rect',
  maxSizeMB = 5,
  accept = 'image/jpeg,image/png,image/webp',
  label = 'Upload Image',
  existingImage,
}: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        setError(`File size must be less than ${maxSizeMB}MB`)
        return
      }

      // Read the file
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [maxSizeMB]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const createCroppedImage = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error('No image to crop')
    }

    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = imageSrc

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Set canvas size to cropped area
        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        )

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.95
        )
      }

      image.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    })
  }

  const handleUpload = async () => {
    if (!croppedAreaPixels) {
      setError('Please select an area to crop')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Create cropped image blob
      const croppedBlob = await createCroppedImage()

      // Convert blob to file
      const file = new File([croppedBlob], 'image.jpg', { type: 'image/jpeg' })

      // Upload to Payload
      const uploadedMedia = await apiClient.upload(file)

      // Reset state
      setImageSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)

      // Notify parent
      onUploadComplete(uploadedMedia)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // If cropping, show cropper interface
  if (imageSrc) {
    return (
      <div className="space-y-4">
        <div className="relative h-96 w-full overflow-hidden rounded-lg bg-panelSoftGray">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex-1"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-primary flex-1"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, show upload interface
  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-panelWhite bg-panelSoftGray/50'
            : 'border-panelSoftGray hover:border-panelGray'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {existingImage ? (
          <div className="relative aspect-square w-full">
            <img
              src={existingImage.sizes?.card?.url || existingImage.url}
              alt={existingImage.alt || ''}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-panelBlack/60 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center py-12 text-center"
          >
            <svg
              className="mb-3 h-12 w-12 text-panelGray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-panelGray">
              Drag and drop or click to browse
            </p>
            <p className="mt-1 text-xs text-panelGray">
              Max {maxSizeMB}MB • JPG, PNG, WebP
            </p>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}
