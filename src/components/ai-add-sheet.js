"use client";

import { useEffect, useRef, useState } from "react";
import { IconMic } from "@/components/icons";
import { Modal } from "@/components/modal";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function joinTranscript(...parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function AiAddSheet({ onClose, onCreated }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const recordingRef = useRef(false);
  const finalsRef = useRef("");
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      recordingRef.current = false;
      clearTimeout(restartTimerRef.current);
      clearInterval(elapsedTimerRef.current);
      recognitionRef.current?.stop?.();
    };
  }, []);

  function clearTimers() {
    clearTimeout(restartTimerRef.current);
    clearInterval(elapsedTimerRef.current);
    restartTimerRef.current = null;
    elapsedTimerRef.current = null;
  }

  function startEngine() {
    const Recognition = getSpeechRecognition();
    if (!Recognition || !recordingRef.current) return;

    const recognition = new Recognition();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = "";
      let newlyFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          newlyFinal = joinTranscript(newlyFinal, piece);
        } else {
          interim = joinTranscript(interim, piece);
        }
      }

      if (newlyFinal) {
        finalsRef.current = joinTranscript(finalsRef.current, newlyFinal);
      }

      setText(joinTranscript(finalsRef.current, interim));
    };

    recognition.onerror = (event) => {
      if (
        event.error === "no-speech" ||
        event.error === "aborted" ||
        event.error === "canceled"
      ) {
        return;
      }

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        finishRecording();
        setError("Mikrofon izni verilmedi. Tarayıcı ayarından sese izin ver.");
        return;
      }

      if (event.error === "audio-capture") {
        finishRecording();
        setError("Mikrofon bulunamadı.");
      }
    };

    recognition.onend = () => {
      if (!recordingRef.current) {
        return;
      }

      restartTimerRef.current = setTimeout(() => {
        if (!recordingRef.current) return;
        startEngine();
      }, 120);
    };

    try {
      recognition.start();
    } catch {
      restartTimerRef.current = setTimeout(() => {
        if (!recordingRef.current) return;
        startEngine();
      }, 250);
    }
  }

  function beginRecording() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSupported(false);
      setError("Bu tarayıcıda kayıt yok. Klavyedeki mikrofona basıp yazdır.");
      return;
    }

    setError("");
    finalsRef.current = text.trim();
    recordingRef.current = true;
    setRecording(true);
    setElapsed(0);
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    startEngine();
  }

  function finishRecording() {
    recordingRef.current = false;
    clearTimers();

    try {
      recognitionRef.current?.stop?.();
    } catch {
      // yoksay
    }

    recognitionRef.current = null;
    setRecording(false);
  }

  function toggleRecording() {
    if (recordingRef.current) {
      finishRecording();
      return;
    }
    beginRecording();
  }

  async function handleAdd() {
    if (recordingRef.current) {
      finishRecording();
    }

    const payload = text.trim();
    if (payload.length < 3) {
      setError("Önce kaydı bitir veya kısa bir cümle yaz.");
      return;
    }

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

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <Modal title="Bas ekle" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          className={`mic-button ${recording ? "is-on" : ""}`}
          onClick={toggleRecording}
        >
          <IconMic className="h-10 w-10" />
          <span>{recording ? "Kaydı bitir" : "Bas konuş"}</span>
          {recording ? (
            <small className="rec-time">
              {minutes}:{seconds}
            </small>
          ) : null}
        </button>
        <p className="muted">
          {supported
            ? recording
              ? "Kayıt açık. Bitirmek için butona tekrar bas."
              : "Bir kez bas, konuş. Tekrar basınca metin kutuya yazılır, sonra düzenleyip ekleyebilirsin."
            : "iOS klavyesindeki mikrofona basıp buraya yazdırabilirsin."}
        </p>
        <textarea
          className="w-full"
          rows={4}
          value={text}
          readOnly={recording}
          onChange={(event) => setText(event.target.value)}
          placeholder="Yarın saat 14’te Ali ile toplantı"
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button
          type="button"
          className="btn-primary w-full"
          onClick={handleAdd}
          disabled={saving || recording}
        >
          {saving ? "Ekleniyor..." : "Ekle"}
        </button>
      </div>
    </Modal>
  );
}
