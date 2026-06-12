import { Eye, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IlluminaReviewer</h1>
            <p className="text-xs text-gray-400">AI-Powered Code Review</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Powered by Qwen 2.5 Coder</span>
        </div>
      </div>
    </header>
  );
}
