import React, { useState } from "react";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const check = () => {
    if (input.includes("fever")) setResult("Possible infection");
    else if (input.includes("headache")) setResult("Migraine/stress");
    else setResult("Consult doctor");
  };

  return (
    <div>
      <h2>🤖 Symptom Checker</h2>
      <input onChange={(e) => setInput(e.target.value)} />
      <button onClick={check}>Check</button>
      <p>{result}</p>
    </div>
  );
}