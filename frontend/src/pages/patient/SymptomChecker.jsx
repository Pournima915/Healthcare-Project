
import React, { useState } from "react";
import axios from "axios";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const symptoms = input.split(",").map((s) => s.trim());
      const res = await axios.post("http://localhost:5000/api/ai/check", { symptoms });
      setResult(res.data.result);
    } catch (error) {
      setResult("Error: Could not connect to the server.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center justify-center gap-2">
          🤖 AI Symptom Checker
        </h2>

        <div className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder=" fever, cough, headache"
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={check}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition active:scale-95 disabled:bg-blue-300"
          >
            {loading ? "Checking..." : "Check Symptoms"}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-800 uppercase tracking-wide">Result:</p>
            <p className="mt-2 text-gray-700 text-lg leading-relaxed">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
