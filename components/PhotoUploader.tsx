'use client'

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react'
import { compressImage } from '@/lib/compressImage'

const MAX_FILES = 5
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoFile {
  base64: string
  preview: string
  name: string
}

interface Props {
  onGenerate: (images: string[]) => void
  loading: boolean
  error: string | null
}

export default function PhotoUploader({ onGenerate, loading, error }: Props) {
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(async (files: File[]) => {
    setSizeError(null)
    const valid = files
      .filter((f) => ACCEPT.includes(f.type))
      .slice(0, MAX_FILES - photos.length)

    if (valid.length === 0) return

    setProcessing(true)
    const results: PhotoFile[] = []

    for (const file of valid) {
      const rawBytes = file.size
      if (rawBytes > 5 * 1024 * 1024) {
        setSizeError('Photo trop volumineuse (max 5MB par image)')
        continue
      }
      try {
        const base64 = await compressImage(file)
        const preview = URL.createObjectURL(file)
        results.push({ base64, preview, name: file.name })
      } catch {
        setSizeError('Erreur lors du traitement d\'une image')
      }
    }

    setPhotos((prev) => [...prev, ...results].slice(0, MAX_FILES))
    setProcessing(false)
  }, [photos.length])

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleGenerate = () => {
    if (photos.length === 0 || loading) return
    onGenerate(photos.map((p) => p.base64))
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-[#1D9E75] bg-[#1D9E75]/5 scale-[1.01]'
            : 'border-gray-300 hover:border-[#1D9E75] hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(',')}
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        <div className="text-4xl mb-3">📸</div>
        <p className="text-gray-600 font-medium">
          Glisse tes photos ici ou{' '}
          <span className="text-[#1D9E75] font-semibold">parcourir</span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          JPEG, PNG, WebP — max {MAX_FILES} photos
        </p>
      </div>

      {/* Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group aspect-square">
              <img
                src={photo.preview}
                alt={photo.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(idx) }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_FILES && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors text-2xl"
            >
              +
            </button>
          )}
        </div>
      )}

      {/* Errors */}
      {(error || sizeError) && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error || sizeError}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleGenerate}
        disabled={photos.length === 0 || loading || processing}
        className="w-full py-3 rounded-xl font-semibold text-white bg-[#1D9E75] hover:bg-[#178a64] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99]"
      >
        {processing ? 'Traitement des images...' : 'Générer l\'annonce'}
      </button>
    </div>
  )
}
