import { useState, useEffect } from 'react';
import SubmitCode from '../components/SubmitCode';
import Editor from '@monaco-editor/react';

export default function EditorBox({ question }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(() =>
  question?.defaultCode?.[language] || ''
);


  useEffect(() => {
  if (question?.defaultCode?.[language]) {
    setCode(question.defaultCode[language]);
  } else {
    setCode('');
  }
}, [language, question]);


  const getMonacoLang = (lang) => {
    switch (lang) {
      case 'c': return 'c';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'python': return 'python';
      default: return 'plaintext';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '0.8rem' }}>
        <label>Language:&nbsp;</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>
      </div>
      <Editor
      height="40vh" // or 70vh if you want more space
  theme="vs-dark"
  language={getMonacoLang(language)}
  value={code}
  onChange={(value) => setCode(value)}
  options={{
    fontSize: 14,
    minimap: { enabled: false },
    fontFamily: 'Fira Code, monospace',
    automaticLayout: true,
    scrollBeyondLastLine: false, // 👈 this avoids blank space below
  }}
/>

      <SubmitCode
        code={code}
        language={language}
        questionId={question.id}
        testCases={question.testCases}
      />
    </div>
  );
}
