import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react';

const severityConfig = {
  error: {
    icon: AlertCircle,
    bg: 'bg-red-950/50',
    border: 'border-red-800',
    badge: 'bg-red-600',
    text: 'text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-950/50',
    border: 'border-yellow-800',
    badge: 'bg-yellow-600',
    text: 'text-yellow-300',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-950/50',
    border: 'border-blue-800',
    badge: 'bg-blue-600',
    text: 'text-blue-300',
  },
};

function CommentCard({ comment }) {
  const config = severityConfig[comment.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${config.badge}`}>
              {comment.severity}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
              {comment.category}
            </span>
            <span className="text-xs text-gray-500">Line {comment.line}</span>
          </div>
          <p className="text-sm text-gray-200 mt-1">{comment.comment}</p>
          {comment.suggestion && (
            <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Suggestion</span>
              </div>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                {comment.suggestion}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewComments({ comments, summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Analyzing your code...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
        <Eye className="w-12 h-12 opacity-30" />
        <p className="text-sm">Submit code to see review comments</p>
      </div>
    );
  }

  const errorCount = comments.filter((c) => c.severity === 'error').length;
  const warningCount = comments.filter((c) => c.severity === 'warning').length;
  const infoCount = comments.filter((c) => c.severity === 'info').length;

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="p-3 bg-gray-800/50 rounded-lg mb-3 border border-gray-700">
        <p className="text-sm text-gray-300 mb-2">{summary}</p>
        <div className="flex gap-3">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" /> {errorCount} errors
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <AlertTriangle className="w-3 h-3" /> {warningCount} warnings
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <Info className="w-3 h-3" /> {infoCount} suggestions
            </span>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {comments.map((comment, index) => (
          <CommentCard key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function Eye({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
