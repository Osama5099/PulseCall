/**
 * Live roster of people the signaling server currently has in this room.
 */
export default function ParticipantList({ participants, selfId }) {
  return (
    <section className="panel">
      <h2>In this room ({participants.length})</h2>
      <ul className="people">
        {participants.map((p) => (
          <li key={p.userId}>
            <span className="avatar">{(p.name || "?").slice(0, 1).toUpperCase()}</span>
            <span>
              {p.name}
              {p.userId === selfId ? " (you)" : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
