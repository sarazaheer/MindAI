import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppContext } from "../../context/AppContext";
import { assets } from "../assets/assets";

/* ==========================================================================
   Design tokens (kept as Tailwind utility constants so the palette only
   has to change in one place). Calm, clinical-but-warm teal/slate system —
   deliberately not the generic indigo/zinc SaaS look.
   ========================================================================== */
const ACCENT = "teal"; // teal-600 / teal-50 etc. used throughout

/* ==========================================================================
   Reusable UI Icons (Optimized Inline SVGs)
   ========================================================================== */
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4.5 h-4.5"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  </svg>
);

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

/* ==========================================================================
   Utility Helpers
   ========================================================================== */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/* ==========================================================================
   Main ChatBot Component
   ========================================================================== */
export default function ChatBot() {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const renameInputRef = useRef(null);

  /* -------- State Management -------- */
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  /* -------- Conversation menu / rename / delete state -------- */
  const [openMenuId, setOpenMenuId] = useState(null); // which chat's ⋮ menu is open
  const [editingId, setEditingId] = useState(null); // which chat is being renamed inline
  const [editingValue, setEditingValue] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null); // confirm-delete dialog
  const [isDeleting, setIsDeleting] = useState(false);

  /* -------- Viewport Sidebar Synchronization -------- */
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handleChange = (e) => setShowSidebar(e.matches);
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  /* -------- Authentication Guard -------- */
  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to continue");
      navigate("/login");
    }
  }, [token, navigate]);

  /* -------- Fetch Data Invocations -------- */
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/chat/conversations`, {
        headers: { token },
      });
      if (data.success) setConversations(data.conversations);
    } catch (error) {
      console.error("Critical API: Failed to sync conversations stream", error);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, fetchConversations]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setIsHistoryLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/chat/${activeChatId}`,
          {
            headers: { token },
          },
        );
        if (data.success) {
          setMessages(
            data.messages.map((msg) => ({
              id: msg._id,
              text: msg.content,
              sender: msg.role === "model" ? "bot" : "user",
            })),
          );
        }
      } catch {
        toast.error("Unable to load chat history.");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchMessages();
  }, [activeChatId, backendUrl, token]);

  /* -------- Close the ⋮ dropdown on any outside click -------- */
  useEffect(() => {
    if (!openMenuId) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  /* -------- Autofocus the rename input when it appears -------- */
  useEffect(() => {
    if (editingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingId]);

  /* -------- Scroll behavior: auto-follow unless user has scrolled up -------- */
  const isNearBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages]);

  const handleScroll = () => {
    setShowScrollToBottom(!isNearBottom());
  };

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const handleInputResize = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  /* -------- Message Mutation Handling -------- */
  const handleSend = useCallback(
    async (textOverride = null) => {
      const textToSend = textOverride || inputValue.trim();
      if (!textToSend || isLoading) return;

      const userMessage = { id: Date.now(), text: textToSend, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setTimeout(() => {
        bottomAnchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);
      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsLoading(true);

      try {
        const { data } = await axios.post(
          `${backendUrl}/api/chat`,
          { message: userMessage.text, conversationId: activeChatId },
          { headers: { token } },
        );

        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: data.reply, sender: "bot" },
        ]);
        setTimeout(() => {
          bottomAnchorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 50);

        if (data.isNew) {
          setActiveChatId(data.conversationId);
          fetchConversations();
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "I couldn't reach the server just now. Please check your connection and try again.",
            sender: "bot",
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      inputValue,
      isLoading,
      backendUrl,
      token,
      activeChatId,
      fetchConversations,
    ],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    if (window.innerWidth < 768) setShowSidebar(false);
    textareaRef.current?.focus();
  };

  const activeChatTitle = useMemo(
    () => conversations.find((c) => c._id === activeChatId)?.title,
    [conversations, activeChatId],
  );

  /* -------- Conversation menu handlers (rename / delete) -------- */
  const startRename = (chat) => {
    setOpenMenuId(null);
    setEditingId(chat._id);
    setEditingValue(chat.title || "");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveRename = async (chatId) => {
    const newTitle = editingValue.trim();
    if (!newTitle) {
      cancelRename();
      return;
    }
    // Optimistic update — reflects instantly, corrected if the request fails.
    const previous = conversations;
    setConversations((prev) =>
      prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c)),
    );
    setEditingId(null);

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/chat/conversation/${chatId}`,
        { title: newTitle },
        { headers: { token } },
      );
      if (!data.success) {
        toast.error(data.message);
        setConversations(previous); // revert on failure
      }
    } catch (error) {
      toast.error(error.message);
      setConversations(previous);
    }
  };

  const confirmDeleteConversation = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/chat/conversation/${pendingDeleteId}`,
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        setConversations((prev) =>
          prev.filter((c) => c._id !== pendingDeleteId),
        );
        if (activeChatId === pendingDeleteId) {
          setActiveChatId(null);
          setMessages([]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  /* ==========================================================================
     Sub-Components
     ========================================================================== */
  const TypingIndicator = () => (
    <div className="flex justify-start w-full">
      <div className="flex items-start gap-3 max-w-[85%] md:max-w-[70%]">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-teal-50 border border-blue-100 flex items-center justify-center p-1.5 shadow-sm shrink-0">
          <img
            src={assets.logo}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
          <div className="flex gap-1.5 items-center justify-center h-4">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );

  const SuggestionCard = ({ text, emoji }) => (
    <button
      onClick={() => handleSend(text)}
      className="text-left p-4 bg-white border border-zinc-200 hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(15,118,110,0.08)] rounded-2xl transition-all duration-200 group active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
    >
      <span
        className="text-xl mb-2 block group-hover:scale-110 transition-transform duration-200"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <p className="text-sm font-medium text-blue-700 group-hover:text-blue-700 transition-colors leading-snug">
        {text}
      </p>
    </button>
  );

  /* ==========================================================================
     Layout Render Pattern
     ========================================================================== */
  return (
    <div className="flex h-[100dvh] w-full bg-zinc-50 text-zinc-800 font-sans overflow-hidden antialiased">
      {/* Mobile Sidebar Backdrop Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-zinc-900/50 z-40 md:hidden backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Structural Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-full bg-zinc-950 text-zinc-200 transition-transform duration-300 ease-in-out flex flex-col border-r border-zinc-800/60 shadow-2xl shrink-0 w-[280px]
        ${showSidebar ? "translate-x-0" : "-translate-x-full md:-translate-x-full md:w-0 md:border-r-0 md:pointer-events-none"}
        `}
        aria-label="Conversation history"
      >
        <div className="p-4 flex-shrink-0 border-b border-zinc-900 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => navigate("/")}
          >
            <img
              src={assets.logo}
              alt="MindAI"
              className="h-7 w-7 shrink-0 object-contain rounded-md"
            />
            <span className="font-bold tracking-tight text-white text-base truncate">
              MindAI
            </span>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden p-1.5 -mr-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
          >
            <PlusIcon />
            <span>New session</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          <div>
            <span className="px-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest block mb-2">
              Recent
            </span>
            {conversations.length === 0 ? (
              <p className="px-2 text-xs text-zinc-600 leading-relaxed">
                Your conversations will show up here once you start chatting.
              </p>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      if (editingId === chat._id) return; // don't navigate while renaming
                      setActiveChatId(chat._id);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border border-transparent flex items-center justify-between
                      ${
                        activeChatId === chat._id
                          ? "bg-zinc-800/90 text-white border-zinc-700/60 shadow-sm"
                          : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      {editingId === chat._id ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            ref={renameInputRef}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(chat._id);
                              if (e.key === "Escape") cancelRename();
                            }}
                            className="min-w-0 flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <button
                            onClick={() => saveRename(chat._id)}
                            className="p-1 text-teal-400 hover:text-teal-300 flex-shrink-0"
                            aria-label="Save name"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            onClick={cancelRename}
                            className="p-1 text-zinc-500 hover:text-zinc-300 flex-shrink-0"
                            aria-label="Cancel rename"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate text-sm font-medium tracking-wide">
                            {chat.title || "Untitled conversation"}
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* ⋮ menu trigger — not shown while this row is being renamed */}
                    {editingId !== chat._id && (
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === chat._id ? null : chat._id,
                            );
                          }}
                          className={`p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all
                            opacity-70 md:opacity-0 md:group-hover:opacity-100 ${
                              openMenuId === chat._id
                                ? "!opacity-100 bg-zinc-800 text-white"
                                : ""
                            }`}
                          aria-label="Conversation options"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === chat._id}
                        >
                          <MoreIcon />
                        </button>

                        {openMenuId === chat._id && (
                          <div
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-36 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
                          >
                            <button
                              role="menuitem"
                              onClick={() => startRename(chat)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              <PencilIcon />
                              Rename
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                setPendingDeleteId(chat._id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
                            >
                              <TrashIcon />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-zinc-900 bg-zinc-950/60">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-full p-2 rounded-xl hover:bg-zinc-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200 border border-zinc-700/50">
              U
            </div>
            <span className="text-xs font-semibold text-zinc-300 truncate">
              Back to dashboard
            </span>
          </button>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main className="flex-1 flex flex-col h-full relative w-full min-w-0 bg-white overflow-hidden">
        {/* Topbar */}
        <header className="h-14 md:h-16 px-3 md:px-6 bg-white/85 backdrop-blur-md border-b border-zinc-200/70 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 shrink-0"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <h2 className="font-semibold text-zinc-800 text-sm md:text-base tracking-tight truncate">
                {activeChatId ? activeChatTitle || "Conversation" : "MindAI"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                <span className="text-[10px] md:text-[11px] text-zinc-500 font-medium tracking-wide">
                  Private &amp; end-to-end secured
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 space-y-6 bg-zinc-50/60 scroll-smooth"
        >
          {isHistoryLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
              </div>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center px-2 py-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-5 md:mb-6 shadow-[0_8px_30px_rgba(15,118,110,0.08)] border border-teal-100/70 p-3">
                <img
                  src={assets.logo}
                  alt="MindAI"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-zinc-900 tracking-tight text-center mb-2">
                Welcome to your safe space
              </h3>
              <p className="text-sm text-zinc-500 text-center mb-7 md:mb-8 max-w-md leading-relaxed">
                Talk through what's on your mind — study stress, sleep, focus,
                or anything else. This space is private and judgment-free.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <SuggestionCard
                  emoji="🧘"
                  text="Guide me through a breathing exercise"
                />
                <SuggestionCard emoji="🎯" text="Help me focus on my studies" />
                <SuggestionCard emoji="💤" text="I'm having trouble sleeping" />
                <SuggestionCard
                  emoji="😰"
                  text="I'm feeling very anxious today"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[90%] sm:max-w-[85%] md:max-w-[75%] gap-2.5 md:gap-3.5 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[11px] md:text-xs select-none border
                        ${
                          msg.sender === "user"
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-teal-50 border-teal-100 p-1.5"
                        }`}
                    >
                      {msg.sender === "user" ? (
                        "U"
                      ) : (
                        <img
                          src={assets.logo}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    <div
                      className={`px-3.5 py-2.5 md:px-4 md:py-3 shadow-sm text-[13.5px] md:text-[15px] leading-relaxed overflow-hidden break-words
                        ${
                          msg.sender === "user"
                            ? "bg-teal-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm"
                        } ${msg.isError ? "!bg-rose-50 !text-rose-700 !border-rose-200" : ""}`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc list-outside ml-4 mb-2 space-y-1"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal list-outside ml-4 mb-2 space-y-1"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-0.5" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <span
                              className={`font-bold ${msg.sender === "user" ? "text-white" : "text-zinc-900"}`}
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className={`underline font-medium ${msg.sender === "user" ? "text-teal-100 hover:text-white" : "text-teal-700 hover:text-teal-600"}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) =>
                            inline ? (
                              <code
                                className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <div className="bg-zinc-900 text-zinc-100 p-3 rounded-xl overflow-x-auto text-xs font-mono my-2 shadow-inner">
                                {children}
                              </div>
                            ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomAnchorRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 shadow-md rounded-full p-2 text-zinc-600 hover:text-teal-600 hover:border-teal-200 transition-all z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
            aria-label="Scroll to latest message"
          >
            <ChevronDownIcon />
          </button>
        )}

        {/* Input Console */}
        <div
          className="p-3 md:p-4 bg-white border-t border-zinc-200/60 md:px-8 shrink-0"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-400 transition-all duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                className="w-full py-2.5 px-3 bg-transparent border-0 focus:ring-0 outline-none resize-none max-h-36 text-sm text-zinc-800 placeholder-zinc-400 font-normal leading-relaxed"
                placeholder="Message MindAI..."
                value={inputValue}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                aria-label="Message MindAI"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-500 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all flex-shrink-0 active:scale-95 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-center text-[10.5px] md:text-[11px] text-zinc-400 mt-2 md:mt-2.5 font-medium tracking-normal select-none">
              MindAI can make mistakes. Please double-check important
              information.
            </p>
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION DIALOG — same pattern used elsewhere in the app
          (appointment cancellation, user removal): destructive actions
          always get a deliberate confirm step, never a single click. */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 004.18 21h15.64a2 2 0 001.87-3l-8.18-14.14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete this conversation?
            </h3>
            <p className="text-sm text-gray-500">
              This will permanently delete the conversation and all its
              messages. This can't be undone.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteId(null)}
                className="flex-1 py-2.5 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteConversation}
                className="flex-1 py-2.5 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
