/**
 * Mute/unmute microphone and camera on/off for the local MediaStream.
 */
export default function Controls({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeave,
}) {
  return (
    <div className="controls">
      <button className={`ctrl ${audioEnabled ? "" : "off"}`} onClick={onToggleAudio}>
        {audioEnabled ? "Mute" : "Unmute"}
      </button>
      <button className={`ctrl ${videoEnabled ? "" : "off"}`} onClick={onToggleVideo}>
        {videoEnabled ? "Camera off" : "Camera on"}
      </button>
      <button className="ctrl leave" onClick={onLeave}>
        Leave
      </button>
    </div>
  );
}
