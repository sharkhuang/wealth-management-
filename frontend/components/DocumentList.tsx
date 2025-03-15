'use client'

import { useState, useEffect } from 'react'
import { DocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import api from '@/app/api'
import toast from 'react-hot-toast'

interface Document {
  name: string;
  date: string;
  type: string;
  size: string;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/list')
      const formattedDocs = response.data.map((doc: any) => ({
        name: doc.name,
        date: new Date(doc.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        type: doc.name.split('.').pop()?.toUpperCase() || 'Unknown',
        size: formatFileSize(doc.size)
      }))
      setDocuments(formattedDocs)
    } catch (err) {
      console.error('Error fetching documents:', err)
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Documents</h2>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <div className="flex items-center justify-center">
            <div className="text-sm text-slate-400">Loading documents...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-200">
          Documents
        </h2>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-400">Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={i} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors cursor-pointer">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-200">{doc.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">{doc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 