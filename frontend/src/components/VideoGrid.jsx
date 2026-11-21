/**
 * Responsive video tiles: local camera plus one tile per remote MediaStream.
 */
export default function VideoGrid({
  localVideoRef,
  localName,
  participants,
  remoteStreams,
  selfId,
}) {
  const remotes = Object.entries(remoteStreams);
  const count = remotes.length + 1;
  const nameOf = (id) =>
    participants.find((p) => p.userId === id)?.name || "Guest";

  return (
    <div className={`video-grid count-${Math.min(count, 5)}`}>
      <article className="tile">
        <video ref={localVideoRef} autoPlay playsInline muted />
        <span className="tile-label">{localName} (you)</span>
      </article>
      {remotes.map(([peerId, stream]) => (
        <RemoteTile
          key={peerId}
          stream={stream}
          label={peerId === selfId ? "You" : nameOf(peerId)}
        />
      ))}
    </div>
  );
}

function RemoteTile({ stream, label }) {
  return (
    <article className="tile">
      <video
        autoPlay
        playsInline
        ref={(el) => {
          if (el && el.srcObject !== stream) {
            el.srcObject = stream;
          }
        }}
      />
      <span className="tile-label">{label}</span>
    </article>
  );
}
