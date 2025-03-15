'use client'

import { useState } from 'react'
import NetWorthChart from '@/components/NetWorthChart'
import DocumentList from '@/components/DocumentList'
import DocumentUpload from '@/components/DocumentUpload';

interface Highlights {
  current: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
}

export default function Home() {
  const [highlights, setHighlights] = useState<Highlights | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-200">
          Financial Overview
        </h1>
      </div>

      {/* Net Worth Section */}
      <div className="relative flex justify-center mb-12">
        <div className="h-[600px] w-full flex justify-center">
          <NetWorthChart onHighlightsChange={setHighlights} />
        </div>
      </div>

      {/* Recent Transactions and Documents Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr,350px] gap-8">
        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200">
              Recent Transactions
            </h2>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-6 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-slate-400">Description</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-slate-400">Category</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Mar 1, 2024', desc: 'Salary Deposit', category: 'Income', amount: 5000, type: 'credit' },
                  { date: 'Feb 28, 2024', desc: 'Rent Payment', category: 'Housing', amount: 2000, type: 'debit' },
                  { date: 'Feb 28, 2024', desc: 'Investment Dividend', category: 'Investment', amount: 300, type: 'credit' },
                  { date: 'Feb 27, 2024', desc: 'Grocery Shopping', category: 'Food', amount: 150, type: 'debit' },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-4 px-6 text-sm text-slate-300">{tx.date}</td>
                    <td className="py-4 px-6 text-sm text-slate-300">{tx.desc}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-sm font-medium text-right ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <DocumentList />

        <DocumentUpload />
      </div>
    </div>
  )
}
