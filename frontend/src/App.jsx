import { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ReviewComments from './components/ReviewComments';
import { submitReview, getSamples } from './api/review';
import { Play, FileCode, Loader2, Code2 } from 'lucide-react';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
];

const DEFAULT_CODE = `// Paste your code here or select a sample
`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('python');
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    getSamples()
      .then(setSamples)
      .catch(() => {});
  }, []);

  async function handleReview() {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setComments([]);
    setSummary('');

    try {
      const result = await submitReview(code, language);
      setComments(result.comments);
      setSummary(result.summary);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to connect to the review service';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSampleSelect(sample) {
    setCode(sample.code);
    setLanguage(sample.language || 'python');
    setComments([]);
    setSummary('');
    setError(null);
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <Header />

      {/* Toolbar */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={handleReview}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isLoading ? 'Reviewing...' : 'Review Code'}
        </button>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        <span className="text-xs text-gray-500">Samples:</span>
        {samples.map((sample, i) => (
          <button
            key={i}
            onClick={() => handleSampleSelect(sample)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors border border-gray-700"
          >
            <FileCode className="w-3 h-3" />
            {sample.name}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-950/50 border border-red-800 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel */}
        <div className="w-1/2 p-4 flex flex-col">
          <h2 className="text-sm font-medium text-gray-400 mb-2">
            {LANGUAGES.find((l) => l.value === language)?.label || language} Code
          </h2>
          <div className="flex-1">
            <CodeEditor
              code={code}
              language={language}
              onChange={(value) => setCode(value || '')}
              highlights={comments}
            />
          </div>
        </div>

        {/* Review Panel */}
        <div className="w-1/2 p-4 flex flex-col border-l border-gray-800">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Review Comments</h2>
          <div className="flex-1 overflow-hidden">
            <ReviewComments
              comments={comments}
              summary={summary}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
