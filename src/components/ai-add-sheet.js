"use client";

import { useEffect, useRef, useState } from "react";
import { IconMic } from "@/components/icons";
import { Modal } from "@/components/modal";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function AiAddSheet({ onClose, onCreated }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  function stopListening() {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  }

  function startListening() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSupported(false);
      setError("Bu tarayıcıda bas-konuş yok. Klavyedeki mikrofonu kullan.");
      return;
    }

    setError("");
    const recognition = new Recognition();
    recognition.lang = "tr-TR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let next = "";
      for (let i = 0; i < event.results.length; i += 1) {
        next += event.results[i][0].transcript;
      }
      setText(next.trim());
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);
  }

  async function handleAdd() {
    const payload = text.trim();
    if (payload.length < 3) {
      setError("Önce konuş veya kısa bir cümle yaz.");
      return;
    }

    stopListening();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/events/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Eklenemedi");
      }
      onCreated(result.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Bas ekle" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          className={`mic-button ${listening ? "is-on" : ""}`}
          onClick={listening ? stopListening : startListening}
        >
          <IconMic className="h-10 w-10" />
          <span>{listening ? "Dinleniyor..." : "Bas konuş"}</span>
        </button>
        <p className="muted">
          {supported
            ? "Telefon veya tarayıcının kendi dikte özelliği kullanılır. Ses OpenAI’ye gitmez."
            : "iOS klavyesindeki mikrofona basıp buraya yazdırabilirsin."}
        </p>
        <textarea
          className="w-full"
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Yarın saat 14’te Ali ile toplantı"
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button
          type="button"
          className="btn-primary w-full"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? "Ekleniyor..." : "Ekle"}
        </button>
      </div>
    </Modal>
  );
}
