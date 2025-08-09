// imports stay the same
import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import EditorBox from "../editor/EditorBox";

export default function MainLayout() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [malpractice, setMalpractice] = useState(false);
  const [username, setUsername] = useState("");
  const [completed, setCompleted] = useState(false);

  const timerRef = useRef();

  // Editor states
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [passedCases, setPassedCases] = useState(0);
  const [descHeight, setDescHeight] = useState(window.innerHeight * 0.35);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch questions
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "questions"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setQuestions(list);
      if (list.length) setSelected(list[0]);
    })();
  }, []);

  // Malpractice detection
  const blurHandler = () => {
    setMalpractice(true);
    clearInterval(timerRef.current);
  };

  // Timer & Fullscreen logic
  useEffect(() => {
    if (!started || completed) return;

    document.documentElement.requestFullscreen().catch(() => {});

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleComplete(); // Auto submit when time ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    window.addEventListener("blur", blurHandler);

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener("blur", blurHandler);
    };
  }, [started, completed]);

  // Resizing split view
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setDescHeight(
        Math.max(150, Math.min(window.innerHeight - 150, e.clientY - 110))
      );
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const formatTime = (secs) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, "0");
    const ss = (secs % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleComplete = async () => {
    try {
      clearInterval(timerRef.current);
      window.removeEventListener("blur", blurHandler);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      const totalCases = selected.testCases?.length || 0;

      const submissionData = {
        username,
        questionId: selected.id,
        code: userCode,
        language,
        testCasesPassed: passedCases,
        totalTestCases: totalCases,
        submittedAt: new Date(),
        malpractice,
        timeTaken: 3600 - timeLeft, // seconds
      };

      // Save submission
      await addDoc(collection(db, "submissions"), submissionData);

      // Save leaderboard entry
      await addDoc(collection(db, "leaderboard"), {
        username,
        score: passedCases,
        total: totalCases,
        timeTaken: 3600 - timeLeft,
        malpractice,
        submittedAt: new Date(),
      });

      setCompleted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Submission failed. Try again.");
    }
  };

  const theme = {
    bg: darkMode ? "#1E1E2E" : "#FAFAFA",
    panel: darkMode ? "#2A2D3E" : "#FFFFFF",
    sidebar: darkMode ? "#232634" : "#F5F5F5",
    text: darkMode ? "#E1E3E8" : "#333",
    muted: darkMode ? "#9FA1A6" : "#666",
    accent: darkMode ? "#FF9800" : "#1976d2",
    border: darkMode ? "#3d3d3d" : "#ccc",
  };

  // Welcome Screen
  if (!started) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: darkMode
            ? "linear-gradient(135deg, #1F1F1F, #2D2D2D)"
            : "linear-gradient(135deg, #E3F2FD, #F8FAFC)",
          fontFamily: "Segoe UI, Roboto, sans-serif",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: darkMode ? "#1E1E1E" : "#FFFFFF",
            padding: "2rem 2.5rem",
            borderRadius: "12px",
            boxShadow: darkMode
              ? "0 8px 20px rgba(0,0,0,0.6)"
              : "0 8px 20px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            width: "100%",
            animation: "fadeIn 0.5s ease-in-out",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "1.2rem",
              color: darkMode ? "#E1E3E8" : "#1F2937",
            }}
          >
            Ready to Begin Your Assessment?
          </h1>

          <div
            style={{
              background: darkMode ? "#2C2C2C" : "#F9FAFB",
              padding: "1.2rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: darkMode ? "1px solid #3D3D3D" : "1px solid #E5E7EB",
              textAlign: "left",
            }}
          >
            <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              Instructions:
            </p>
            <ul
              style={{
                paddingLeft: "1.2rem",
                margin: 0,
                lineHeight: 1.6,
                color: darkMode ? "#D1D5DB" : "#374151",
              }}
            >
              <li>
                Duration: <strong>1 hour</strong>
              </li>
              <li>
                Use <strong>Fullscreen Mode</strong> during the test.
              </li>
              <li>
                Avoid switching tabs — <strong>Malpractice</strong> ⛔
              </li>
              <li>Write code in the built-in editor only.</li>
              <li>Ensure a stable internet connection.</li>
            </ul>
          </div>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              outline: "none",
              fontSize: "0.95rem",
              background: darkMode ? "#333" : "#FFF",
              color: darkMode ? "#E1E3E8" : "#111",
            }}
          />
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "0.75rem 1.5rem",
              width: "100%",
              fontSize: "1rem",
              background: username ? "#4FC3F7" : "#B0BEC5",
              color: "#111",
              border: "none",
              borderRadius: "6px",
              marginBottom: "1rem",
              cursor: username ? "pointer" : "not-allowed",
              transition: "background 0.3s ease",
            }}
          >
            Start Assessment
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "0.6rem 1.5rem",
              width: "100%",
              borderRadius: "6px",
              border: "none",
              background: darkMode ? "#FF9800" : "#1976D2",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
          >
            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (completed) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: theme.bg,
          color: theme.text,
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h1>🎉 Thank you, {username}!</h1>
        <p>Your assessment has been submitted successfully.</p>
      </div>
    );
  }

  // Main Assessment Layout
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        background: theme.bg,
        color: theme.text,
        display: "flex",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          gap: "0.5rem",
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: darkMode ? "#2E3440" : "#e3f2fd",
            color: darkMode ? "#FFEB3B" : "#0d47a1",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: `1px solid ${theme.border}`,
            fontWeight: "bold",
          }}
        >
          ⏳ {formatTime(timeLeft)}
        </div>
        <button
          onClick={handleComplete}
          disabled={malpractice || timeLeft === 0}
          style={{
            backgroundColor: theme.accent,
            color: darkMode ? "#111" : "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            opacity: malpractice || timeLeft === 0 ? 0.6 : 1,
          }}
        >
          ✅ Complete
        </button>
      </div>

      {/* Malpractice Overlay */}
      {malpractice && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,0,0,0.85)",
            zIndex: 999,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          🚨 Malpractice Detected. Assessment Terminated.
        </div>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: theme.sidebar,
          padding: "1rem",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <h3 style={{ color: theme.accent }}>Questions</h3>
        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => setSelected(q)}
            style={{
              padding: "0.75rem",
              margin: "0.5rem 0",
              borderRadius: "6px",
              background: selected?.id === q.id ? theme.accent : theme.panel,
              color: selected?.id === q.id ? "#111" : theme.text,
              cursor: "pointer",
            }}
          >
            {q.title}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "1rem",
            borderBottom: `1px solid ${theme.border}`,
            flexShrink: 0,
          }}
        >
          <h2>{selected.title}</h2>
        </div>

        {/* Question Description */}
        <div
          style={{
            height: descHeight,
            overflowY: "auto",
            padding: "1rem",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.panel,
          }}
        >
          <p>{selected.description}</p>
          {selected.testCases?.map((tc, i) => (
            <div key={i} style={{ marginBottom: "0.5rem" }}>
              <strong>Case {i + 1} Input:</strong> {tc.input}
              <br />
              <strong>Expected:</strong> {tc.expectedOutput}
            </div>
          ))}
        </div>

        {/* Drag Divider */}
        <div
          style={{
            height: "6px",
            background: theme.border,
            cursor: "row-resize",
          }}
          onMouseDown={() => {
            setIsDragging(true);
            document.body.style.cursor = "row-resize";
          }}
        ></div>

        {/* Editor */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: theme.panel,
            padding: "1rem",
          }}
        >
          <EditorBox
            question={selected}
            theme={theme}
            disabled={malpractice || timeLeft === 0}
            onCodeChange={(code) => setUserCode(code)}
            onLanguageChange={(lang) => setLanguage(lang)}
            onTestResult={(passed) => setPassedCases(passed)}
          />
        </div>
      </div>
    </div>
  );
}
