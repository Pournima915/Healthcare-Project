import React, { useState, useEffect, useRef } from "react";
import "./SymptomChecker.css";

export default function SymptomChecker() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Welcome. Please describe your symptoms and know the disease, remedies and precautions."
    }
  ]);

  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [lastPrediction, setLastPrediction] = useState(null);
  const [awaitingRemedy, setAwaitingRemedy] = useState(false);
  const [remediesShown, setRemediesShown] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const chatBoxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  const speak = (text, lang = selectedLanguage) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    const langMap = {
      mr: "hi-IN",
      hi: "hi-IN",
      en: "en-US"
    };

    speech.lang = langMap[lang] || "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    let voice = null;

    if (lang === "mr" || lang === "hi") {
      voice = voices.find((v) => v.lang.includes("IN"));
    } else {
      voice = voices.find((v) =>
        v.lang.startsWith("en")
      );
    }

    if (voice) {
      speech.voice = voice;
    }

    window.speechSynthesis.speak(speech);
  };

  const appendMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        text
      }
    ]);
  };

  const switchLanguage = async (newLang) => {
    if (isTranslating) return;

    setSelectedLanguage(newLang);

    let welcomeText =
      "Welcome. Please describe your symptoms.";

    if (newLang === "mr") {
      welcomeText =
        "स्वागत आहे. कृपया तुमच्या लक्षणांचे वर्णन करा.";
    } else if (newLang === "hi") {
      welcomeText =
        "स्वागत है। कृपया अपने लक्षणों का वर्णन करें।";
    }

    const updatedMessages = [...messages];

    if (updatedMessages.length > 0) {
      updatedMessages[0] = {
        ...updatedMessages[0],
        text: welcomeText
      };
    }

    setMessages(updatedMessages);

    const botTexts = updatedMessages
      .filter((m) => m.role === "bot")
      .map((m) => m.text);

    if (botTexts.length === 0) return;

    try {
      setIsTranslating(true);

      const response = await fetch(
        "http://127.0.0.1:5001/translate-all",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            texts: botTexts,
            language: newLang
          })
        }
      );

      const data = await response.json();

      if (data.translated_texts) {
        let index = 0;

        const translatedMessages =
          updatedMessages.map((msg) => {
            if (msg.role === "bot") {
              return {
                ...msg,
                text:
                  data.translated_texts[
                    index++
                  ]
              };
            }
            return msg;
          });

        setMessages(translatedMessages);

        if (
          data.translated_texts.length > 0
        ) {
          speak(
            data.translated_texts[
              data.translated_texts.length -
                1
            ],
            newLang
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const message = input.trim();

    if (!message) return;

    appendMessage("user", message);
    setInput("");

    if (awaitingRemedy && !remediesShown) {
      try {
        const response = await fetch(
          "http://127.0.0.1:5001/predict",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              symptoms: message,
              language: selectedLanguage,
              is_remedy_response: true
            })
          }
        );

        const data = await response.json();

        if (data.message === "remedy_request") {
          fetchRemedy();
          return;
        }

        appendMessage("bot", data.message);
        speak(data.message);

        setAwaitingRemedy(false);
        setLastPrediction(null);
        setRemediesShown(false);
      } catch (err) {
        console.error(err);
      }

      return;
    }

    setAwaitingRemedy(false);
    setRemediesShown(false);
    setLastPrediction(null);

    const loadingText =
      selectedLanguage === "mr"
        ? "लक्षणांचे विश्लेषण सुरू आहे..."
        : selectedLanguage === "hi"
        ? "लक्षणों का विश्लेषण किया जा रहा है..."
        : "Analyzing symptoms...";

    appendMessage("bot", loadingText);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            symptoms: message,
            language: selectedLanguage,
            is_remedy_response: false
          })
        }
      );

      const data = await response.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "bot",
          text: ""
        };

        if (data.is_general) {
          updated[updated.length - 1].text =
            data.message;
        } else if (!data.prediction) {
          updated[updated.length - 1].text =
            data.message ||
            "Please describe your symptoms.";
        } else {
          setLastPrediction(data.prediction);
          setAwaitingRemedy(true);

          updated[updated.length - 1].text =
            data.you_may_have +
            "\n\n" +
            data.would_you_like;
        }

        speak(updated[updated.length - 1].text);

        return updated;
      });
    } catch (error) {
      const msg =
        selectedLanguage === "mr"
          ? "सर्व्हर त्रुटी. कृपया पुन्हा प्रयत्न करा."
          : selectedLanguage === "hi"
          ? "सर्वर त्रुटि। कृपया फिर से प्रयास करें।"
          : "Server error. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "bot",
          text: msg
        };
        return updated;
      });

      speak(msg);

      setAwaitingRemedy(false);
      setLastPrediction(null);
      setRemediesShown(false);
    }
  };

  const fetchRemedy = async () => {
    if (!lastPrediction) return;

    const loadingText =
      selectedLanguage === "mr"
        ? "उपाय मिळवत आहे..."
        : selectedLanguage === "hi"
        ? "सुझाव प्राप्त किए जा रहे हैं..."
        : "Fetching suggestions...";

    appendMessage("bot", loadingText);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/remedy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: lastPrediction,
            language: selectedLanguage
          })
        }
      );

      const data = await response.json();

      const responseText =
        data.condition_label +
        ": " +
        lastPrediction +
        "\n\n" +
        data.remedy_label +
        ":\n" +
        data.remedy +
        "\n\n" +
        data.precaution_label +
        ":\n" +
        data.precaution +
        "\n\n" +
        data.doctor_label +
        ":\n" +
        data.doctor_advice;

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "bot",
          text: responseText
        };

        return updated;
      });

      speak(responseText);

      setAwaitingRemedy(false);
      setLastPrediction(null);
      setRemediesShown(true);
    } catch (error) {
      const msg =
        selectedLanguage === "mr"
          ? "उपाय मिळवताना त्रुटी."
          : selectedLanguage === "hi"
          ? "सुझाव प्राप्त करने में त्रुटि।"
          : "Error fetching remedies.";

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "bot",
          text: msg
        };

        return updated;
      });
    }
  };

  const toggleRecording = async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state ===
        "inactive"
    ) {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true
            }
          );

        mediaRecorderRef.current =
          new MediaRecorder(stream);

        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable =
          (e) => {
            audioChunksRef.current.push(e.data);
          };

        mediaRecorderRef.current.onstop =
          sendAudio;

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied.");
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (
        mediaRecorderRef.current.stream
      ) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    }
  };

  const sendAudio = async () => {
    const blob = new Blob(
      audioChunksRef.current,
      {
        type: "audio/webm"
      }
    );

    const formData = new FormData();

    formData.append(
      "audio",
      blob,
      "recording.webm"
    );

    formData.append(
      "language",
      selectedLanguage
    );

    const loadingText =
      selectedLanguage === "mr"
        ? "व्हॉइस ट्रान्सक्राइब होत आहे..."
        : selectedLanguage === "hi"
        ? "वॉइस ट्रांसक्राइब हो रहा है..."
        : "Transcribing voice...";

    appendMessage("bot", loadingText);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/transcribe",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (data.transcript) {
        setInput(data.transcript);

        setMessages((prev) =>
          prev.slice(0, -1)
        );

        setTimeout(() => {
          sendMessage();
        }, 200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle(
      "dark"
    );

    const dark =
      document.body.classList.contains(
        "dark"
      );

    setDarkMode(dark);

    localStorage.setItem(
      "theme",
      dark ? "dark" : "light"
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Symptom Checker</div>

      <div className="language-bar">
        <select
          value={selectedLanguage}
          onChange={(e) =>
            switchLanguage(e.target.value)
          }
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyPress}
          placeholder="Type your symptoms..."
        />

      
        <button
          className="mic-btn"
          onClick={toggleRecording}
        >
          {isRecording ? (
            "⏹️"
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          )}
        </button>

        
        <button
          className="send-btn"
          onClick={sendMessage}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <div className="theme-toggle">
        <label className="switch">
          <input
            type="checkbox"
            onChange={toggleDarkMode}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}