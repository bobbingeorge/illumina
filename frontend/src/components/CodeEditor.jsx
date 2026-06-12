import Editor from '@monaco-editor/react';

const LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  sql: 'sql',
};

export default function CodeEditor({ code, language, onChange, highlights }) {
  function handleEditorDidMount(editor, monaco) {
    if (highlights && highlights.length > 0) {
      const decorations = highlights.map((h) => {
        let className = 'line-highlight-info';
        if (h.severity === 'error') className = 'line-highlight-error';
        else if (h.severity === 'warning') className = 'line-highlight-warning';

        return {
          range: new monaco.Range(h.line, 1, h.line, 1),
          options: {
            isWholeLine: true,
            className: className,
            glyphMarginClassName: `glyph-${h.severity}`,
          },
        };
      });
      editor.deltaDecorations([], decorations);
    }
  }

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || 'plaintext'}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
