import React, { useState, useEffect, useRef } from "react";
import "./styles.css";

const themes = [
  "今ハマっていること／最近の推し",
  "子どものころの夢と、なぜ今の仕事を選んだか",
  "最近びっくりしたこと or 笑ったこと",
  "dXaメンバーにまだ知られていない意外な一面",
  "前職/学生時代の印象的な仕事エピソード",
  "働くうえで大事にしているマイルール",
  "理想のチームや働き方について思うこと",
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [finalIndex, setFinalIndex] = useState(null);
  const [round, setRound] = useState(0);
  const [slowingDown, setSlowingDown] = useState(false);
  const [spinSequence, setSpinSequence] = useState([]);
  const [history, setHistory] = useState([]);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spinning && !slowingDown) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % themes.length);
      }, 100);
    }
    return () => clearInterval(intervalRef.current);
  }, [spinning, slowingDown]);

  useEffect(() => {
    if (slowingDown && spinSequence.length > 0) {
      const [nextDelay, ...rest] = spinSequence;
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % themes.length);
        setSpinSequence(rest);
        if (rest.length === 0) {
          const final = (currentIndex + 1) % themes.length;
          setFinalIndex(final);
          setSlowingDown(false);
          setHistory((prev) => [...prev, themes[final]]);
          if (audioRef.current) {
            audioRef.current.play();
          }
        }
      }, nextDelay);
      return () => clearTimeout(timer);
    }
  }, [spinSequence, slowingDown, currentIndex]);

  const startSpin = () => {
    setSpinning(true);
    setSlowingDown(false);
    setFinalIndex(null);
    clearInterval(intervalRef.current);
  };

  const stopSpin = () => {
    setSpinning(false);
    setSlowingDown(true);
    clearInterval(intervalRef.current);
    const slowSequence = Array.from({ length: 10 }, (_, i) => 100 + i * 80);
    setSpinSequence(slowSequence);
  };

  const nextPerson = () => {
    setFinalIndex(null);
    setCurrentIndex(0);
    setSpinning(false);
    setSlowingDown(false);
    setSpinSequence([]);
    setRound((r) => r + 1);
  };

  const resetAll = () => {
    setFinalIndex(null);
    setCurrentIndex(0);
    setSpinning(false);
    setSlowingDown(false);
    setSpinSequence([]);
    setHistory([]);
    setRound(0);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="App">
      <h1>トークテーマルーレット</h1>
      <audio
        ref={audioRef}
        src="https://www.soundjay.com/buttons/sounds/button-3.mp3"
        preload="auto"
      />
      <div className="theme-list">
        {themes.map((theme, index) => (
          <div
            key={index}
            className={`theme-item ${
              finalIndex === index ? "selected animate-pulse" : ""
            } ${
              index === currentIndex && (spinning || slowingDown)
                ? "highlight"
                : ""
            }`}
          >
            {theme}
          </div>
        ))}
      </div>
      <div className="buttons">
        {!spinning && finalIndex === null && (
          <button onClick={startSpin}>▶ スタート</button>
        )}
        {spinning && <button onClick={stopSpin}>⏹ ストップ</button>}
        {finalIndex !== null && (
          <button onClick={nextPerson}>➡ 次の人へ</button>
        )}
        <button onClick={resetAll}>🔄 リセット</button>
      </div>
      <p>第 {round + 1} ラウンド</p>

      {history.length > 0 && (
        <div className="history">
          <h3>🎯 過去のテーマ履歴</h3>
          <ul>
            {history.map((item, idx) => (
              <li key={idx}>
                第{idx + 1}回: {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
