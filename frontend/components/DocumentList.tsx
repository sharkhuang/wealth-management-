'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DocumentIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Document {
  id: string
  name: string
  uploadDate: string
  size: number
  type: string
  url: string
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      // Use sample data for demonstration
      setDocuments(generateSampleDocuments())
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      const response = await axios.get(document.url, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = window.document.createElement('a')
      link.href = url
      link.setAttribute('download', document.name)
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/documents/${documentId}`)
      setDocuments(documents.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading documents...</div>
  }

  return (
    <div className="overflow-hidden">
      <ul role="list" className="divide-y divide-gray-200">
        {documents.map((document) => (
          <li key={document.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center min-w-0 gap-x-4">
              <DocumentIcon className="h-8 w-8 text-gray-400" />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900 truncate">
                  {document.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {new Date(document.uploadDate).toLocaleDateString()} • {formatFileSize(document.size)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(document)}
                className="rounded-full p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(document.id)}
                className="rounded-full p-2 text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function generateSampleDocuments(): Document[] {
  return [
    {
      id: '1',
      name: 'tax_return_2023.pdf',
      uploadDate: '2024-01-15T10:30:00Z',
      size: 2457600,
      type: 'application/pdf',
      url: '#',
    },
    {
      id: '2',
      name: 'investment_statement_q4.docx',
      uploadDate: '2024-02-01T15:45:00Z',
      size: 1048576,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '#',
    },
    {
      id: '3',
      name: 'property_deed.pdf',
      uploadDate: '2024-02-15T09:20:00Z',
      size: 3145728,
      type: 'application/pdf',
      url: '#',
    },
  ]
} 