import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

const ADMIN_PASSWORD = "yourSecret123"; // change this

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordTry, setPasswordTry] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const [activeTab, setActiveTab] = useState("questions");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [defaultCode, setDefaultCode] = useState({
    python: "",
    java: "",
    cpp: "",
    c: "",
  });
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "" },
  ]);
  const [questions, setQuestions] = useState([]);
  const [editId, setEditId] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [submission,setSubmission] = useState([]);
  const theme = darkMode
    ? {
        bg: "#1A1A1A",
        panel: "#272A35",
        text: "#E1E3E8",
        accent: "#FF9800",
        border: "#3D3D3D",
        inputBg: "#232634",
        placeholder: "#9FA1A6",
      }
    : {
        bg: "#FAFAFA",
        panel: "#FFFFFF",
        text: "#333",
        accent: "#1976D2",
        border: "#CCC",
        inputBg: "#F0F0F0",
        placeholder: "#666",
      };

  useEffect(() => {
    if (authenticated) {
      (async () => {
        const qSnap = await getDocs(collection(db, "questions"));
        setQuestions(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const leaderboardQuery = query(
          collection(db, "leaderboard"),
          orderBy("score", "desc")
        );
        const lSnap = await getDocs(leaderboardQuery);
        setLeaderboard(lSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })();
    }
  }, [authenticated]);

  const handleAuthenticate = () => {
    if (passwordTry === ADMIN_PASSWORD) setAuthenticated(true);
    else alert("Wrong password");
  };

  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", expectedOutput: "" }]);
  };

  const handleChangeTestCase = (i, field, val) => {
    const updated = [...testCases];
    updated[i][field] = val;
    setTestCases(updated);
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setDefaultCode({ python: "", java: "", cpp: "", c: "" });
    setTestCases([{ input: "", expectedOutput: "" }]);
  };

  const handleSubmit = async () => {
    const payload = { title, description, defaultCode, testCases };
    try {
      if (editId) await updateDoc(doc(db, "questions", editId), payload);
      else await addDoc(collection(db, "questions"), payload);
      resetForm();
      window.location.reload();
    } catch {
      alert("Save failed");
    }
  };

  const handleEdit = (q) => {
    setEditId(q.id);
    setTitle(q.title);
    setDescription(q.description);
    setDefaultCode(q.defaultCode);
    setTestCases(q.testCases);
    setActiveTab("questions");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } catch {
        alert("Delete failed");
      }
    }
  };

  const handleDeleteLeaderboardEntry = async (id) => {
    if (window.confirm("Delete this entry?")) {
      try {
        await deleteDoc(doc(db, "leaderboard", id));
        setLeaderboard((prev) => prev.filter((l) => l.id !== id));
      } catch {
        alert("Delete failed");
      }
    }
  };

  const handleClearLeaderboard = async () => {
    if (window.confirm("Clear all leaderboard data?")) {
      try {
        const snap = await getDocs(collection(db, "leaderboard"));
        snap.forEach(async (d) => await deleteDoc(doc(db, "leaderboard", d.id)));
        setLeaderboard([]);
      } catch {
        alert("Clear failed");
      }
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: theme.bg,
          color: theme.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: theme.panel,
            padding: "2rem",
            borderRadius: "8px",
            width: "320px",
            textAlign: "center",
            boxShadow: `0 0 10px ${theme.border}`,
          }}
        >
          <h3>Admin Login</h3>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordTry}
            onChange={(e) => setPasswordTry(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              margin: "1rem 0",
              background: theme.inputBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "4px",
              color: theme.text,
              fontSize: "1rem",
            }}
          />
          <button
            onClick={handleAuthenticate}
            style={{
              width: "100%",
              padding: "0.7rem",
              background: theme.accent,
              border: "none",
              borderRadius: "4px",
              color: theme.text,
              cursor: "pointer",
            }}
          >
            Enter
          </button>
          <button
            onClick={() => setDarkMode((dm) => !dm)}
            style={{
              marginTop: "1rem",
              background: "transparent",
              border: "none",
              color: theme.accent,
              cursor: "pointer",
            }}
          >
            {darkMode ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        width: "100vw",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: theme.panel,
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: `0 2px 8px ${theme.border}`,
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: `2px solid ${theme.border}`,
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setActiveTab("questions")}
              style={{
                padding: "0.6rem 1.2rem",
                background:
                  activeTab === "questions" ? theme.accent : "transparent",
                border: "none",
                borderRadius: "4px",
                color: activeTab === "questions" ? theme.text : theme.accent,
                cursor: "pointer",
              }}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              style={{
                padding: "0.6rem 1.2rem",
                background:
                  activeTab === "leaderboard" ? theme.accent : "transparent",
                border: "none",
                borderRadius: "4px",
                color: activeTab === "leaderboard" ? theme.text : theme.accent,
                cursor: "pointer",
              }}
            >
              Leaderboard
            </button>
          </div>
          <button
            onClick={() => setDarkMode((dm) => !dm)}
            style={{
              background: theme.accent,
              color: theme.text,
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div>
            <h2>{editId ? "Edit Question" : "Add New Question"}</h2>
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                margin: "0.5rem 0",
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "4px",
                color: theme.text,
              }}
            />

            <label>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                margin: "0.5rem 0",
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "4px",
                color: theme.text,
              }}
            />

            <h4>Default Code</h4>
            {["python", "java", "cpp", "c"].map((lang) => (
              <div key={lang} style={{ marginBottom: "1rem" }}>
                <label>{lang.toUpperCase()}</label>
                <textarea
                  value={defaultCode[lang]}
                  onChange={(e) => {
                    setDefaultCode((prev) => ({
                      ...prev,
                      [lang]: e.target.value,
                    }));
                  }}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    margin: "0.4rem 0",
                    background: theme.inputBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "4px",
                    color: theme.text,
                  }}
                />
              </div>
            ))}

            <h4>Test Cases</h4>
            {testCases.map((tc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) =>
                    handleChangeTestCase(i, "input", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    background: theme.inputBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "4px",
                  }}
                />
                <input
                  placeholder="Expected output"
                  value={tc.expectedOutput}
                  onChange={(e) =>
                    handleChangeTestCase(i, "expectedOutput", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    background: theme.inputBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "4px",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleAddTestCase}
              style={{
                background: theme.accent,
                color: theme.text,
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Add Test Case
            </button>

            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={handleSubmit}
                style={{
                  background: theme.accent,
                  color: theme.text,
                  border: "none",
                  padding: "0.8rem 1.4rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {editId ? "📝 Update Question" : "✅ Submit Question"}
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginTop: "2rem" }}>
              <h3>Existing Questions</h3>
              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  <div>{q.title}</div>
                  <div>
                    <button
                      onClick={() => handleEdit(q)}
                      style={{
                        background: theme.accent,
                        color: theme.text,
                        border: "none",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      style={{
                        background: "transparent",
                        color: theme.accent,
                        border: "none",
                        marginLeft: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {/* Leaderboard Tab */}
{activeTab === 'leaderboard' && (
  <div>
    <h3>Leaderboard</h3>
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      background: theme.panel,
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <thead>
        <tr style={{ background: theme.accent, color: theme.text }}>
          <th style={{ padding: '0.8rem', textAlign: 'left' }}>#</th>
          <th style={{ padding: '0.8rem', textAlign: 'left' }}>Username</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Score</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Total</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Time Taken (sec)</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Submitted At</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Malpractice</th>
          <th style={{ padding: '0.8rem', textAlign: 'center' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((entry, index) => (
          <tr
            key={entry.id}
            style={{
              background: entry.malpractice ? '#ffcccc' : theme.bg,
              color: theme.text,
              borderBottom: `1px solid ${theme.border}`
            }}
          >
            <td style={{ padding: '0.8rem' }}>#{index + 1}</td>
            <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{entry.username}</td>
            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{entry.score}</td>
            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{entry.total}</td>
            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{entry.timeTaken}</td>
            <td style={{ padding: '0.8rem', textAlign: 'center' }}>
              {new Date(entry.submittedAt.seconds * 1000).toLocaleString()}
            </td>
            <td style={{
              padding: '0.8rem',
              textAlign: 'center',
              fontWeight: 'bold',
              color: entry.malpractice ? 'red' : 'green'
            }}>
              {entry.malpractice ? 'Yes' : 'No'}
            </td>
            <td style={{ padding: '0.8rem', textAlign: 'center' }}>
              <button
                onClick={() => handleDeleteScore(entry.id)}
                style={{
                  background: 'transparent',
                  color: theme.accent,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <button
      onClick={handleClearLeaderboard}
      style={{
        marginTop: '1rem',
        background: theme.accent,
        color: theme.text,
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Clear Leaderboard
    </button>
  </div>
)}
      </div>
    </div>
  );
}
