import React, { useState } from "react";
import { createComplaint } from "../api/complaints";

export default function CreateComplaint() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    await createComplaint(subject, message);
    alert("Complaint submitted");
  };

  return (
    <div>
      <h2>Create Complaint</h2>
      <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
