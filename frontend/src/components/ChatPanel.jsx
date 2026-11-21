import { useEffect, useRef, useState } from "react";

/**
 * Room chat sidebar. Messages arrive on the same STOMP connection as signaling.
 */
export default function ChatPanel({ messages, selfId, onSend }) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit(event) {
    event.preventDefault();
    onSend(draft);
    setDraft("");
  }

  return (
    <section className="panel chat-panel">
      <h2>Chat</h2>
      <div className="chat-log">
        {messages.length === 0 ? (
          <p className="muted">No messages yet. Say hello.</p>
        ) : (
          messages.map((m, index) => (
            <div
              key={`${m.timestamp}-${index}`}
              className={`bubble ${m.senderId === selfId ? "mine" : ""}`}
            >
              <strong>{m.senderName}</strong>
              <p>{m.content}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message"
        />
        <button className="btn primary" type="submit">
          Send
        </button>
      </form>
    </section>
  );
}
