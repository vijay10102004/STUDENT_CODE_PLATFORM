import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function SubmitCode({ code, language, questionId, testCases }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');

  useEffect(() => {
    if (results.length > 0) {
      console.log("✅ Updated results:", results);
    }
  }, [results]);

  const runCode = async () => {
    await executeTests(testCases.slice(0, 2), false);
  };

  const handleSubmit = async () => {
    if (!user) return alert("Login required!");
    await executeTests(testCases, true);
  };

  const executeTests = async (cases, shouldSave) => {
    setLoading(true);
    setResults([]);
    setConsoleOutput('');
    setError(null);

    const allResults = [];

    for (const test of cases) {
      try {
        const { data } = await axios.post(
          'https://emkc.org/api/v2/piston/execute',
          {
            language: languageAlias(language),
            version: '*',
            stdin: test.input,
            files: [{ content: code }],
          }
        );

        const run = data.run || {};
        const output = (run.stdout || run.stderr || '').trim();
        const expected = test.expectedOutput.trim();
        const passed = output === expected;

        allResults.push({
          input: test.input.trim(),
          expected,
          output,
          passed,
        });

        setConsoleOutput(prev => prev + `\nTest Case ${allResults.length}:\n${output || 'No output'}\n`);

      } catch (err) {
        console.error("❌ Piston error:", err);
        allResults.push({
          input: test.input.trim(),
          expected: test.expectedOutput.trim(),
          output: '⚠️ Execution error',
          passed: false,
        });
      }
    }

    setResults(allResults);

    if (shouldSave) {
      const passedCount = allResults.filter(r => r.passed).length;
      try {
        await addDoc(collection(db, 'submissions'), {
          userId: user.uid,
          questionId,
          language,
          code,
          testCasesPassed: passedCount,
          totalTestCases: testCases.length,
          submittedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('❌ Firestore save failed', e);
        setError('❌ Failed to save submission to database');
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={runCode} disabled={loading}>
          {loading ? "⏳ Running..." : "▶️ Run Code"}
        </button>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ Submitting..." : "🚀 Submit Code"}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          {results.map((res, i) => (
            <div
              key={i}
              style={{
                marginBottom: '1.5rem',
                width:'100vw',
                padding: '1.2rem 1.5rem',
                borderLeft: `6px solid ${res.passed ? '#28a745' : '#dc3545'}`,
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow:'hidden',
                fontFamily: 'Inter, Roboto, sans-serif',
                color: '#333',
              }}
            >
              <h4 style={{
                marginBottom: '0.5rem',
                color: res.passed ? '#28a745' : '#dc3545',
              }}>
                Test Case {i + 1}: {res.passed ? '✅ Passed' : '❌ Failed'}
              </h4>

              <div style={{ marginBottom: '0.75rem' }}>
                <b style={{ display: 'block', marginBottom: '0.25rem' }}>Input:</b>
                <pre style={{
                  background: '#f1f1f1',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Fira Code, monospace',
                  fontSize: '0.95rem'
                }}>{res.input}</pre>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <b style={{ display: 'block', marginBottom: '0.25rem' }}>Expected Output:</b>
                <pre style={{
                  background: '#f1f1f1',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Fira Code, monospace',
                  fontSize: '0.95rem'
                }}>{res.expected}</pre>
              </div>

              <div>
                <b style={{ display: 'block', marginBottom: '0.25rem' }}>Your Output:</b>
                <pre style={{
                  background: res.passed ? '#e6ffee' : '#ffe6e6',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Fira Code, monospace',
                  fontSize: '0.95rem',
                  color: '#222'
                }}>{res.output}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Console Output */}
      {consoleOutput && (
        <div style={{
          marginTop: '2rem',
          background: '#1e1e1e',
          color: '#ccc',
          padding: '1rem',
          borderRadius: '6px',
          fontFamily: 'Fira Code, monospace',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#4fc3f7' }}>🖥 Console Output</h4>
          {consoleOutput}
        </div>
      )}
    </div>
  );
}

// Helper: Match your language naming with Piston’s expected values
function languageAlias(lang) {
  switch (lang.toLowerCase()) {
    case 'c': return 'c';
    case 'cpp': return 'cpp';
    case 'java': return 'java';
    case 'python': return 'python3';
    default: return 'python3';
  }
}
