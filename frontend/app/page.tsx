import NetWorthChart from '@/components/NetWorthChart'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Wealth Dashboard</h1>
        </div>

        {/* Net Worth Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Net Worth Over Time</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <NetWorthChart />
          </div>
        </div>

        {/* Document Management */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <DocumentUpload />
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <DocumentList />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
