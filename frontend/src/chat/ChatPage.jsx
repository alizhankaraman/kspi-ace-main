import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { getLinkedConsumers } from "../api/chat";

function ChatPage({ token }) {
  const [consumers, setConsumers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadConsumers();
  }, []);

  const loadConsumers = async () => {
    const res = await getLinkedConsumers(token);
    setConsumers(res.data);
  };

  return (
    <div className="chat-page">
      <ChatList consumers={consumers} onSelect={setSelected} />
      {selected ? (
        <ChatWindow token={token} consumer={selected} />
      ) : (
        <div>Select a consumer to begin chat</div>
      )}
    </div>
  );
}

export default ChatPage;
