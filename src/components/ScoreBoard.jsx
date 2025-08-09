import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ScoreBoard() {
  const { user } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchScore = async () => {
      if (!user) return;

      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      let totalPassed = 0;
      snapshot.forEach((doc) => {
        totalPassed += doc.data().testCasesPassed;
      });

      setScore(totalPassed);
    };

    fetchScore();
  }, [user]);

  return (
    <div style={{ padding: '1rem', background: '#fgghh' }}>
      <h3>Your Score</h3>
      {score !== null ? <p>{score} test cases passed</p> : <p>Loading...</p>}
    </div>
  );
}
