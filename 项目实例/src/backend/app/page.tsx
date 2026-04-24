// 默认页面
import React from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-green-400">
          PGP Vanity Key Miner
        </h1>
        <p className="text-xl mb-8">
          Backend API for mining PGP keys with special fingerprints
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">API Endpoints</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="bg-green-500 text-black px-2 py-1 rounded font-mono">POST</span>
                <span className="font-mono">/api/miner/start</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-red-500 text-black px-2 py-1 rounded font-mono">POST</span>
                <span className="font-mono">/api/miner/stop/[taskId]</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-500 text-black px-2 py-1 rounded font-mono">GET</span>
                <span className="font-mono">/api/miner/stream/[taskId]</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-500 text-black px-2 py-1 rounded font-mono">GET</span>
                <span className="font-mono">/api/keys</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">About</h2>
            <p className="mb-4">
              This backend API provides functionality for generating PGP key pairs with special
              fingerprints patterns using parallel processing and real-time progress updates.
            </p>
            <p>
              Use the frontend application to interact with this API and start mining for
              vanity PGP keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}