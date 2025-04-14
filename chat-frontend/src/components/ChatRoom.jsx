import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import axios from "axios";

function ChatRoom({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const stompClientRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasJoinedRef = useRef(false);
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/chat/history`)
      .then((response) => {
        setMessages(response.data);
        scrollToBottom();
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Chat-Historie:", error);
      });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat",
          body: JSON.stringify({
            sender: "System",
            content: `${username} left the chat`,
          }),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username]);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: `${import.meta.env.VITE_BACKEND_WS_URL}`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[STOMP DEBUG] onConnect");
        setIsConnected(true);

        stompClient.subscribe("/topic/messages", (message) => {
          const body = JSON.parse(message.body);
          setMessages((prev) => [...prev, body]);
        });

        if (!hasJoinedRef.current) {
          stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify({
              sender: "System",
              content: `${username} joined the chat`,
            }),
          });
          hasJoinedRef.current = true;
        }
      },
      onStompError: (frame) => {
        console.error("[STOMP DEBUG] onStompError", frame);
      },

      // Falls schon beim WebSocket-Handshake etwas schiefläuft
      onWebSocketError: (event) => {
        console.error("[STOMP DEBUG] onWebSocketError", event);
      },

      // Falls die Verbindung getrennt wird
      onDisconnect: () => {
        console.warn("[STOMP DEBUG] onDisconnect");
        setIsConnected(false);
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!isConnected) {
      console.warn("Noch nicht verbunden!");
      return;
    }

    if (newMessage.trim() && stompClientRef.current) {
      stompClientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify({
          sender: username,
          content: newMessage,
        }),
      });
      setNewMessage("");
    }
  };

  useEffect(() => {
    const chat = document.getElementById("chat-scroll");
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white">
      <header className="relative p-4 text-center shadow-md bg-white dark:bg-neutral-800">
        <h2 className="text-xl font-semibold">Chatroom</h2>
        <button
          onClick={onLogout}
          className="absolute right-4 top-4 text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          Logout
        </button>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Logged in as: <span className="font-bold">{username}</span>
        </p>
      </header>

      <main
        className="flex-1 flex flex-col gap-2 overflow-y-auto p-4"
        id="chat-scroll"
      >
        {messages.map((msg, index) => {
          const isOwn = msg.sender === username;
          const isSystem = msg.sender === "System";

          if (isSystem) {
            return (
              <div
                key={index}
                className="self-center text-sm text-gray-500 dark:text-gray-400 italic"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`max-w-fit px-3 py-2 rounded shadow ${
                isOwn
                  ? "self-end bg-blue-500 text-white"
                  : "self-start bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white"
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                {isOwn ? "You" : msg.sender}
              </div>
              <div>{msg.content}</div>
              <div className="text-xs text-gray-200 mt-1 text-right">
                {new Date(msg.timestamp + "Z").toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div ref={chatEndRef}></div>
            </div>
          );
        })}
      </main>

      <form
        onSubmit={sendMessage}
        className="flex p-4 border-t border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
      >
        <input
          type="text"
          placeholder="Enter message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 rounded-l border border-gray-300 dark:border-neutral-700 dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-inset placeholder:text-gray-400 dark:placeholder:text-neutral-400"
        />
        <button
          type="submit"
          className="bg-neutral-300 hover:bg-neutral-400 text-gray-900 px-4 py-2 rounded-r dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
