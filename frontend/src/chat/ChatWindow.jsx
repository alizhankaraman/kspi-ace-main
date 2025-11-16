import React, { useState, useEffect, useRef } from "react";
import { getChatHistory, sendMessage } from "../api/chat";

function ChatWindow({ token, consumer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const wsRef = useRef(null);

  useEffect(() => {
    if (!consumer) return;

    loadHistory();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [consumer]);

  const loadHistory = async () => {
    const res = await getChatHistory(token, consumer.id);

    // Normalize backend history to match WebSocket format
    const normalized = res.data.map(m => ({
      content: m.content ?? m.message,
      sender: m.sender,
    }));

    setMessages(normalized);
  };

  const connectWebSocket = () => {
    const salesmanId = parseInt(localStorage.getItem("user_id"));
    if (!salesmanId) {
      console.log("❌ salesmanId missing");
      return;
    }

    const url = `ws://192.168.10.10:8000/ws/chat/user_${consumer.id}_sales_${salesmanId}/`;

    console.log("Connecting WS →", url);

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => console.log("WS connected!");
    wsRef.current.onerror = (e) => console.log("WS error:", e);
    wsRef.current.onclose = () => console.log("WS closed");

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages(prev => [
        ...prev,
        {
          content: data.message,
          sender: data.sender,
        },
      ]);
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const senderId = Number(localStorage.getItem("user_id"));

    // 1️⃣ Add instantly to UI
    setMessages(prev => [
      ...prev,
      { content: input, sender: senderId },
    ]);

    // 2️⃣ Send via WebSocket (real-time)
    wsRef.current.send(
      JSON.stringify({
        message: input,
        sender: senderId,
      })
    );

    // 3️⃣ Save to backend DB
    await sendMessage(token, consumer.id, input);

    setInput("");
  };

  return (
    <div className="chat-window">
      <h3>Chat with {consumer.username}</h3>

      <div className="messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={m.sender === consumer.id ? "msg consumer" : "msg me"}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
