import React from "react";

function ChatList({ consumers, onSelect }) {
  return (
    <div className="chat-list">
      <h3>Consumers</h3>
      {consumers.map((c) => (
        <div
          key={c.id}
          className="chat-user"
          onClick={() => onSelect(c)}
        >
          {c.username}
        </div>
      ))}
    </div>
  );
}

export default ChatList;
