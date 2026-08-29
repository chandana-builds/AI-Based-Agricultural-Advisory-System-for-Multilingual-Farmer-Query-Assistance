"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Menu,
  Mic,
  Moon,
  MoreVertical,
  Pause,
  Pencil,
  Pin,
  Play,
  Plus,
  Send,
  Settings,
  Square,
  Sun,
  Trash2,
  User,
  Volume2,
  X,
} from "lucide-react";

type LanguageCode = "en-IN" | "hi-IN" | "te-IN";

interface SourceItem {
  title: string;
  url?: string | null;
}

interface Message {
  id: string | number;
  sender: "user" | "bot";
  content: string;
  sources?: SourceItem[];
  language_code?: string;
}

interface ChatSessionItem {
  session_id: number;
  title: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
}

const USER_ID = 1;

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "te-IN", label: "తెలుగు" },
];

const UI_TEXT: Record<LanguageCode, Record<string, string>> = {
  "en-IN": {
    subtitle: "Agricultural Advisor",
    newChat: "New Chat",
    recentChats: "Recent Chats",
    dashboard: "Dashboard",
    title: "Agricultural AI Advisor",
    greeting: "How can I help you today? 🌱",
    greetingSub: "Ask me about crops, soil, fertilizers, irrigation, pests, or farming.",
    thinking: "AgriAI is thinking...",
    transcribing: "Converting your speech to text...",
    recording: "Recording voice...",
    listen: "Listen",
    pause: "Pause",
    resume: "Resume",
    resources: "Resources",
    sources: "Sources & References",
    placeholder: "Ask in English, Hindi, or Telugu...",
    pin: "Pin",
    unpin: "Unpin",
    archive: "Archive",
    rename: "Rename",
    renameTitle: "Rename conversation",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    profileModalTitle: "User Profile & Chat Management",
    usernameLabel: "Username",
    emailLabel: "Email",
    allSessions: "All Chat Sessions",
  },
  "hi-IN": {
    subtitle: "कृषि सलाहकार",
    newChat: "नया चैट",
    recentChats: "हाल की चैट्स",
    dashboard: "डैशबोर्ड",
    title: "कृषि एआई सलाहकार",
    greeting: "आज मैं आपकी किस प्रकार सहायता कर सकता हूँ? 🌱",
    greetingSub: "फसलों, मिट्टी, उर्वरकों, सिंचाई और कीटों के बारे में पूछें।",
    thinking: "एग्री-एआई सोच रहा है...",
    transcribing: "आपकी आवाज़ को टेक्स्ट में बदला जा रहा है...",
    recording: "आवाज़ रिकॉर्ड हो रही है...",
    listen: "सुनें",
    pause: "रोकें",
    resume: "जारी रखें",
    resources: "संसाधन",
    sources: "स्रोत और संदर्भ",
    placeholder: "अंग्रेजी, हिंदी या तेलुगु में पूछें...",
    pin: "पिन करें",
    unpin: "अनपिन करें",
    archive: "संग्रह",
    rename: "नाम बदलें",
    renameTitle: "चैट का नाम बदलें",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    profileModalTitle: "प्रोफ़ाइल और चैट प्रबंधन",
    usernameLabel: "उपयोगकर्ता नाम",
    emailLabel: "ईमेल",
    allSessions: "सभी चैट सत्र",
  },
  "te-IN": {
    subtitle: "వ్యవసాయ సలహాదారు",
    newChat: "కొత్త చాట్",
    recentChats: "ఇటీవలి చాట్‌లు",
    dashboard: "డాష్‌బోర్డ్",
    title: "వ్యవసాయ AI సలహాదారు",
    greeting: "ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను? 🌱",
    greetingSub: "పంటలు, నేల, ఎరువులు, నీటిపారుదల మరియు పురుగుల గురించి అడగండి.",
    thinking: "అగ్రి-ఏఐ ఆలోచిస్తోంది...",
    transcribing: "మీ మాటలను టెక్స్ట్‌గా మారుస్తోంది...",
    recording: "వాయిస్ రికార్డ్ అవుతోంది...",
    listen: "వినండి",
    pause: "విరామం",
    resume: "కొనసాగించు",
    resources: "వనరులు",
    sources: "మూలాలు & సూచనలు",
    placeholder: "ఆంగ్లం, హిందీ లేదా తెలుగులో అడగండి...",
    pin: "పిన్ చేయండి",
    unpin: "అన్‌పిన్ చేయండి",
    archive: "ఆర్కైవ్",
    rename: "పేరు మార్చండి",
    renameTitle: "చాట్ పేరు మార్చండి",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    delete: "తొలగించు",
    profileModalTitle: "ప్రొఫైల్ & చాట్ సెషన్‌లు",
    usernameLabel: "యూజర్ పేరు",
    emailLabel: "ఇమెయిల్",
    allSessions: "అన్ని చాట్ సెషన్‌లు",
  },
};

function apiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "detail" in data && typeof (data as any).detail === "string") {
    return (data as any).detail;
  }
  if (data && typeof data === "object" && "message" in data && typeof (data as any).message === "string") {
    return (data as any).message;
  }
  return fallback;
}

function encodeWAV(samples: Float32Array, sampleRate: number = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sampleRate * 2 bytes)
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

interface ChatInterfaceProps {
  lang?: string;
  setLang?: (lang: any) => void;
  initialLanguage?: LanguageCode;
  onBack?: () => void;
}

export default function ChatbotPage({ lang, setLang, initialLanguage, onBack }: ChatInterfaceProps = {}) {
  const router = useRouter();

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard");
    }
  };

  // UI STATE
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const resolveInitialLanguage = (): LanguageCode => {
    if (lang === "telugu" || lang === "te-IN") return "te-IN";
    if (lang === "hindi" || lang === "hi-IN") return "hi-IN";
    if (lang === "english" || lang === "en-IN") return "en-IN";
    if (initialLanguage) return initialLanguage;
    return "en-IN";
  };

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(resolveInitialLanguage);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // User Profile Real State
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("user@example.com");

  // CHAT STATE
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RECORDING STATE
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");

  // SOURCES & TTS & RENAME
  const [openSourcesMessageId, setOpenSourcesMessageId] = useState<string | number | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [ttsPaused, setTtsPaused] = useState(false);
  const [ttsLoadingMessageId, setTtsLoadingMessageId] = useState<string | number | null>(null);
  const [renameSession, setRenameSession] = useState<ChatSessionItem | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  // REFS
  const liveTranscriptRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);

  const t = UI_TEXT[selectedLanguage];
  const activeLanguage = LANGUAGES.find((item) => item.code === selectedLanguage) || LANGUAGES[0];
  const darkMode = theme === "dark";

  const stopMicrophone = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeakingMessageId(null);
    setTtsPaused(false);
    setTtsLoadingMessageId(null);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/user/${USER_ID}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data) {
        setUserName(data.username || data.first_name || "User");
        setUserEmail(data.email || "user@example.com");
      }
    } catch (err) {
      console.error("Unable to load user profile:", err);
      setUserName("User");
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/chat/sessions?user_id=${USER_ID}&include_archived=false`);
      if (!response.ok) return;
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Unable to load sessions:", fetchError);
    }
  };

  useEffect(() => {
    void fetchUserProfile();
    void fetchSessions();
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setLanguageOpen(false);
      }
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(target)) {
        setActiveMenuSessionId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      stopMicrophone();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTranscribing]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
  }, [input]);

  const startNewChat = () => {
    stopTts();
    setMessages([]);
    setInput("");
    setError(null);
    setCurrentSessionId(null);
    setOpenSourcesMessageId(null);
    setActiveMenuSessionId(null);
  };

  const loadSessionHistory = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);
      setActiveMenuSessionId(null);
      stopTts();

      const response = await fetch(
        `/chat/history?session_id=${sessionId}&user_id=${USER_ID}&language_code=${selectedLanguage}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(apiErrorMessage(data, "Unable to load chat history."));
      }

      setCurrentSessionId(data.session_id);
      setMessages(
        Array.isArray(data.messages)
          ? data.messages.map((msg: any) => ({
              id: msg.id || `msg-${Math.random()}`,
              sender: msg.sender,
              content: msg.content,
              sources: msg.sources || [],
              language_code: msg.language_code || selectedLanguage,
            }))
          : []
      );
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Unable to load chat history.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    textOverride?: string,
    languageOverride?: string,
    allowDuringTranscription = false
  ) => {
    const messageText = (textOverride ?? input).trim();
    const language = (languageOverride || selectedLanguage) as LanguageCode;

    if (!messageText || loading || (isTranscribing && !allowDuringTranscription)) return;

    setError(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, sender: "user", content: messageText, language_code: language },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          message: messageText,
          session_id: currentSessionId,
          language_code: language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(apiErrorMessage(data, "Unable to get chatbot response."));
      }

      if (data.session_id) setCurrentSessionId(data.session_id);

      if (data.language_code && LANGUAGES.some((item) => item.code === data.language_code)) {
        setSelectedLanguage(data.language_code as LanguageCode);
        setLang?.(data.language_code);
      }

      setMessages((previous) => [
        ...previous,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          content: data.reply || "I could not create a response.",
          sources: Array.isArray(data.sources) ? data.sources : [],
          language_code: data.language_code || language,
        },
      ]);

      void fetchSessions();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to get chatbot response.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const openRenameModal = (session: ChatSessionItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenuSessionId(null);
    setRenameSession(session);
    setRenameTitle(session.title);
  };

  const saveRename = async () => {
    if (!renameSession) return;
    const cleanTitle = renameTitle.trim();
    if (!cleanTitle) {
      setError("Chat title cannot be empty.");
      return;
    }

    try {
      setSavingRename(true);
      setError(null);
      const response = await fetch(`/chat/session/${renameSession.session_id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID, title: cleanTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "Unable to rename this chat."));

      setSessions((previous) =>
        previous.map((item) =>
          item.session_id === renameSession.session_id ? { ...item, title: data.title || cleanTitle } : item
        )
      );
      setRenameSession(null);
      setRenameTitle("");
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : "Unable to rename this chat.");
    } finally {
      setSavingRename(false);
    }
  };

  const handleSessionAction = async (
    sessionId: number,
    action: "pin" | "archive" | "delete",
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setActiveMenuSessionId(null);

    try {
      let endpoint = `/chat/session/${sessionId}/${action}`;
      let options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID }),
      };

      if (action === "delete") {
        endpoint = `/chat/session/${sessionId}?user_id=${USER_ID}`;
        options = { method: "DELETE" };
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, `Unable to ${action} this chat.`));

      if (action === "delete") {
        setSessions((previous) => previous.filter((item) => item.session_id !== sessionId));
        if (currentSessionId === sessionId) startNewChat();
        return;
      }

      if (action === "archive" && currentSessionId === sessionId) {
        startNewChat();
      }

      void fetchSessions();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Unable to ${action} this chat.`);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      liveTranscriptRef.current = "";
      mediaChunksRef.current = [];
      audioBuffersRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 1. AudioContext capturing 16kHz PCM
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      let audioCtx: AudioContext | null = null;
      try {
        audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      } catch {
        audioCtx = new AudioCtxClass();
      }
      
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const recordedSamples: Float32Array[] = [];
      audioBuffersRef.current = recordedSamples;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        recordedSamples.push(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 2. MediaRecorder fallback
      try {
        let mimeType = "audio/webm";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
          else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
          else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
          
          const recorder = new MediaRecorder(stream, { mimeType });
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
          };
          recorder.start();
          mediaRecorderRef.current = recorder;
        }
      } catch (recErr) {
        console.warn("MediaRecorder fallback init:", recErr);
      }

      setRecordingState("recording");
    } catch (recordingError) {
      stopMicrophone();
      setError(recordingError instanceof Error ? recordingError.message : "Microphone permission denied.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      void audioContextRef.current.suspend();
    }
    setRecordingState("paused");
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
    setRecordingState("recording");
  };

  const stopRecording = async () => {
    if (recordingState === "idle") return;
    setRecordingState("idle");

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        const recorder = mediaRecorderRef.current;
        await new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
          try {
            recorder.stop();
          } catch {
            resolve();
          }
        });
      }

      // Extract recorded PCM buffers
      const buffers = [...audioBuffersRef.current];
      const audioCtx = audioContextRef.current;
      const actualSampleRate = audioCtx ? audioCtx.sampleRate : 16000;

      stopMicrophone();

      if (audioCtx && audioCtx.state !== "closed") {
        try {
          void audioCtx.close();
        } catch {}
        audioContextRef.current = null;
      }

      let audioBlob: Blob | null = null;
      let filename = "recording.wav";

      if (buffers.length > 0) {
        const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
        if (totalLength > 1600) {
          const merged = new Float32Array(totalLength);
          let offset = 0;
          for (const b of buffers) {
            merged.set(b, offset);
            offset += b.length;
          }

          let finalSamples = merged;
          let targetRate = actualSampleRate;
          if (actualSampleRate !== 16000 && actualSampleRate > 0) {
            const ratio = actualSampleRate / 16000;
            const newLength = Math.round(totalLength / ratio);
            finalSamples = new Float32Array(newLength);
            for (let i = 0; i < newLength; i++) {
              const srcIdx = i * ratio;
              const idx0 = Math.floor(srcIdx);
              const idx1 = Math.min(idx0 + 1, totalLength - 1);
              const frac = srcIdx - idx0;
              finalSamples[i] = merged[idx0] * (1 - frac) + merged[idx1] * frac;
            }
            targetRate = 16000;
          }

          audioBlob = encodeWAV(finalSamples, targetRate);
          filename = "recording.wav";
        }
      }

      if (!audioBlob && mediaChunksRef.current.length > 0) {
        const firstChunkType = mediaChunksRef.current[0].type || "audio/webm";
        const ext = firstChunkType.includes("mp4") ? "mp4" : "webm";
        audioBlob = new Blob(mediaChunksRef.current, { type: firstChunkType });
        filename = `recording.${ext}`;
      }

      if (audioBlob && audioBlob.size > 200) {
        await sendRecordedAudio(audioBlob, filename);
      } else {
        setError("Recording was too short. Please speak clearly for at least 1-2 seconds.");
      }
    } catch (err) {
      console.error("Stop recording error:", err);
      setError(err instanceof Error ? err.message : "Audio processing failed.");
    }
  };

  const sendRecordedAudio = async (audioBlob: Blob, fileName: string) => {
    setIsTranscribing(true);
    setError(null);
    try {
      if (!audioBlob.size) throw new Error("Recording is empty.");
      
      const formData = new FormData();
      formData.append("file", audioBlob, fileName);
      formData.append("language_code", "unknown");

      const response = await fetch("/chat/stt", { method: "POST", body: formData });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Speech-to-text failed. Please try speaking again.");
      }

      const transcript = typeof data.transcript === "string" ? data.transcript.trim() : "";
      if (transcript) {
        setInput(transcript);
        liveTranscriptRef.current = transcript;

        // Auto-switch language and UI when spoken language is detected
        const detectedLang = data.language_code || data.language;
        if (detectedLang && LANGUAGES.some((item) => item.code === detectedLang)) {
          setSelectedLanguage(detectedLang as LanguageCode);
          setLang?.(detectedLang);
        }

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
          }
        }, 50);
      } else {
        setError("Could not detect speech in audio. Please speak clearly and try again.");
      }
    } catch (sttError) {
      console.error("STT Frontend Catch:", sttError);
      setError(sttError instanceof Error ? sttError.message : "Could not detect clear speech. Please speak closer to your microphone.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const playSarvamTts = async (message: Message) => {
    if (speakingMessageId === message.id && audioRef.current) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setTtsPaused(false);
      } else {
        audioRef.current.pause();
        setTtsPaused(true);
      }
      return;
    }

    stopTts();
    setError(null);
    setTtsLoadingMessageId(message.id);

    try {
      const response = await fetch("/chat/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message.content,
          language_code: message.language_code || selectedLanguage,
          speaker: "shubh",
          pace: 1.0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data, "Unable to generate speech."));

      const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
      audio.onended = () => {
        setSpeakingMessageId(null);
        setTtsPaused(false);
        setTtsLoadingMessageId(null);
        audioRef.current = null;
      };
      audioRef.current = audio;
      setSpeakingMessageId(message.id);
      await audio.play();
    } catch (ttsError) {
      setSpeakingMessageId(null);
      setError(ttsError instanceof Error ? ttsError.message : "TTS failed.");
    } finally {
      setTtsLoadingMessageId(null);
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-[#0b1120] text-white" : "bg-gray-50 text-gray-900"}`}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen overflow-hidden border-r transition-all duration-300 md:relative ${
          sidebarOpen ? "w-72" : "w-0 md:w-16"
        } ${darkMode ? "border-gray-800 bg-[#111827]" : "border-gray-200 bg-white"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-inherit px-4">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold leading-none">AgriAI</h1>
                  <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.subtitle}</p>
                </div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/20">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-3">
            <button
              onClick={startNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
            >
              <Plus size={18} />
              {sidebarOpen && t.newChat}
            </button>
          </div>

          {sidebarOpen && (
            <div className="mt-2 flex-1 overflow-y-auto px-3">
              <p className={`mb-2 px-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {t.recentChats}
              </p>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => void loadSessionHistory(session.session_id)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition ${
                      currentSessionId === session.session_id
                        ? darkMode
                          ? "bg-gray-800 text-green-400"
                          : "bg-gray-200 text-green-700"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3 pr-8">
                      <Bot size={17} className="shrink-0 text-green-500" />
                      <p className="truncate text-sm font-medium">{session.title}</p>
                    </div>

                    <div ref={activeMenuSessionId === session.session_id ? sessionMenuRef : null} className="absolute right-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveMenuSessionId((previous) => (previous === session.session_id ? null : session.session_id));
                        }}
                        className="rounded-lg p-1 text-gray-400 opacity-0 transition hover:bg-gray-700/40 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuSessionId === session.session_id && (
                        <div className={`absolute right-0 top-8 z-50 w-40 rounded-xl border py-1 shadow-xl ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
                          <button onClick={(event) => openRenameModal(session, event)} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700/20">
                            <Pencil size={13} /> {t.rename}
                          </button>
                          <button onClick={(event) => void handleSessionAction(session.session_id, "pin", event)} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700/20">
                            <Pin size={13} /> {session.is_pinned ? t.unpin : t.pin}
                          </button>
                          <button onClick={(event) => void handleSessionAction(session.session_id, "archive", event)} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700/20">
                            <Archive size={13} /> {t.archive}
                          </button>
                          <button onClick={(event) => void handleSessionAction(session.session_id, "delete", event)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
                            <Trash2 size={13} /> {t.delete}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-auto border-t p-3 ${darkMode ? "border-gray-800 bg-[#0f172a]" : "border-gray-200 bg-gray-50"}`}>
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setProfileModalOpen(true)}
                  className="flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl p-1.5 transition hover:bg-gray-700/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{userName || "User"}</p>
                    <p className={`truncate text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className={`rounded-xl p-2 transition ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"}`}
                  title="Settings & Profile"
                >
                  <Settings size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 font-bold text-white"
                  title={userName}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className={`rounded-xl p-2 ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"}`}
                >
                  <Settings size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 ${darkMode ? "border-gray-800 bg-[#0f172a]" : "border-gray-200 bg-white"}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackNavigation}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${
                darkMode ? "border-gray-700 bg-gray-800 text-gray-200" : "border-gray-300 bg-gray-100 text-gray-700"
              }`}
            >
              <ArrowLeft size={14} />
              <span>{t.dashboard}</span>
            </button>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2">
                <Menu size={20} />
              </button>
            )}
            <h2 className="text-sm font-semibold sm:text-base">{t.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.newChat}</span>
            </button>

            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageOpen((previous) => !previous)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}
              >
                {activeLanguage.label}
                <ChevronDown size={15} />
              </button>
              {languageOpen && (
                <div className={`absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border shadow-xl ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setLanguageOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm ${selectedLanguage === language.code ? "bg-green-600 text-white" : "hover:bg-gray-700/20"}`}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setTheme((previous) => (previous === "dark" ? "light" : "dark"))}
              className={`rounded-xl p-2.5 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        {/* CHAT MESSAGES DISPLAY */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
            {messages.length === 0 && !loading && !isTranscribing && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-600/15">
                  <Bot size={42} className="text-green-500" />
                </div>
                <h1 className="mb-3 text-2xl font-bold md:text-3xl">{t.greeting}</h1>
                <p className={`max-w-xl text-sm md:text-base ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t.greetingSub}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {message.sender === "bot" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-600">
                      <Bot size={19} className="text-white" />
                    </div>
                  )}
                  <div className="max-w-[85%] md:max-w-[75%]">
                    <div className={`rounded-2xl px-4 py-3 ${message.sender === "user" ? "rounded-br-md bg-green-600 text-white" : darkMode ? "rounded-bl-md bg-gray-800 text-gray-100" : "rounded-bl-md border border-gray-200 bg-white"}`}>
                      <p className="whitespace-pre-wrap text-sm leading-7 md:text-[15px]">{message.content}</p>
                    </div>

                    {message.sender === "bot" && (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void playSarvamTts(message)}
                            disabled={ttsLoadingMessageId === message.id}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${darkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100"}`}
                          >
                            {ttsLoadingMessageId === message.id ? (
                              <>
                                <Loader2 size={13} className="animate-spin" /> Loading...
                              </>
                            ) : speakingMessageId === message.id ? (
                              ttsPaused ? (
                                <>
                                  <Play size={13} /> {t.resume}
                                </>
                              ) : (
                                <>
                                  <Pause size={13} /> {t.pause}
                                </>
                              )
                            ) : (
                              <>
                                <Volume2 size={13} /> {t.listen}
                              </>
                            )}
                          </button>

                          {!!message.sources?.length && (
                            <button
                              onClick={() => setOpenSourcesMessageId((previous) => (previous === message.id ? null : message.id))}
                              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${darkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                              <BookOpen size={13} /> {t.resources} ({message.sources.length})
                              {openSourcesMessageId === message.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>

                        {!!message.sources?.length && openSourcesMessageId === message.id && (
                          <div className={`rounded-xl border p-3 text-xs ${darkMode ? "border-gray-800 bg-gray-900/80 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{t.sources}</p>
                            <ul className="list-inside list-disc space-y-1">
                              {message.sources.map((source, index) => (
                                <li key={`${message.id}-${index}`}>
                                  {source.url ? (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words underline hover:text-green-500">
                                      {source.title}
                                    </a>
                                  ) : (
                                    source.title
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {(loading || isTranscribing) && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-600">
                    <Bot size={19} className="text-white" />
                  </div>
                  <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${darkMode ? "bg-gray-800" : "border border-gray-200 bg-white"}`}>
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-green-500" />
                      <span className="text-sm">{isTranscribing ? t.transcribing : t.thinking}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* INPUT FOOTER */}
        <div className={`shrink-0 border-t ${darkMode ? "border-gray-800 bg-[#0f172a]" : "border-gray-200 bg-white"}`}>
          <div className="mx-auto max-w-4xl p-4">
            <div className={`flex items-end gap-2 rounded-2xl border p-2 ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}`}>
              {recordingState === "idle" ? (
                <button
                  onClick={() => void startRecording()}
                  disabled={loading || isTranscribing}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${loading || isTranscribing ? "cursor-not-allowed opacity-40" : darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Mic size={20} />
                </button>
              ) : (
                <div className="flex gap-1">
                  {recordingState === "recording" ? (
                    <button onClick={pauseRecording} className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-600 text-white hover:bg-yellow-700">
                      <Pause size={18} />
                    </button>
                  ) : (
                    <button onClick={resumeRecording} className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700">
                      <Play size={18} />
                    </button>
                  )}
                  <button onClick={stopRecording} className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700">
                    <Square size={16} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading || isTranscribing || recordingState !== "idle"}
                placeholder={recordingState !== "idle" ? t.recording : isTranscribing ? t.transcribing : t.placeholder}
                className={`max-h-32 flex-1 resize-none border-none bg-transparent p-2 text-sm outline-none md:text-base ${darkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />

              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || loading || isTranscribing || recordingState !== "idle"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white ${!input.trim() || loading || isTranscribing || recordingState !== "idle" ? "cursor-not-allowed opacity-40" : "hover:bg-green-700"}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* PROFILE & SETTINGS MODAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className={`flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl border shadow-2xl ${darkMode ? "border-gray-700 bg-[#111827] text-white" : "border-gray-200 bg-white text-gray-900"}`}>
            <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600 font-bold text-white">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t.profileModalTitle}</h3>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
                </div>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="rounded-xl p-2 hover:bg-gray-700/20">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t.usernameLabel}</p>
                  <p className="mt-1 text-base font-medium">{userName || "User"}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t.emailLabel}</p>
                  <p className="mt-1 text-base font-medium">{userEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">{t.allSessions} ({sessions.length})</h4>
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No chat sessions found.</p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.session_id}
                        onClick={() => {
                          void loadSessionHistory(session.session_id);
                          setProfileModalOpen(false);
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          darkMode ? "border-gray-800 bg-gray-900/40 hover:bg-gray-800" : "border-gray-200 bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Bot size={18} className="shrink-0 text-green-500" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{session.title}</p>
                            <p className="text-xs text-gray-400">{new Date(session.updated_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.is_pinned && <Pin size={14} className="text-green-500" />}
                          {session.is_archived && <Archive size={14} className="text-yellow-500" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-inherit px-6 py-4 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${darkMode ? "border-gray-700 bg-[#111827] text-white" : "border-gray-200 bg-white text-gray-900"}`}>
            <h3 className="mb-4 text-lg font-semibold">{t.renameTitle}</h3>
            <input
              autoFocus
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveRename();
                if (event.key === "Escape") setRenameSession(null);
              }}
              maxLength={100}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-green-500 ${darkMode ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"}`}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setRenameSession(null)} disabled={savingRename} className={`rounded-xl px-4 py-2 text-sm ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
                {t.cancel}
              </button>
              <button
                onClick={() => void saveRename()}
                disabled={savingRename || !renameTitle.trim()}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingRename ? "Saving..." : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}