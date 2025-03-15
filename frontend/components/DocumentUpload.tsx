'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadProgress(0)

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        await axios.post('http://localhost:8000/api/v1/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(progress)
            }
          },
        })
      } catch (error) {
        console.error('Error uploading file:', error)
        // Handle error (show notification, etc.)
      }
    }

    setUploading(false)
    setUploadProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      
      {uploading ? (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Uploading... {uploadProgress}%</p>
        </div>
      ) : isDragActive ? (
        <p className="mt-2 text-sm text-gray-600">Drop the files here...</p>
      ) : (
        <div>
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop files here, or click to select files
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: PDF, Word documents, and images
          </p>
        </div>
      )}
    </div>
  )
} 