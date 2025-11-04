import { useEffect, useRef, useState } from "react";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const VideoPlayer = ({ stream, remoteStream }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const navigate = useNavigate();

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [stream, remoteStream]);

  const toggleMic = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
    }
  };

  const handleLeave = () => {
    // Stop all local tracks
    stream?.getTracks().forEach((track) => track.stop());

    // Navigate to home
    navigate("/");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Remote video full screen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          backgroundColor: "#000",
        }}
      />

      {/* Local video preview bottom-right */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "200px",
          height: "150px",
          borderRadius: "8px",
          border: "2px solid white",
          objectFit: "cover",
          backgroundColor: "#000",
        }}
      />

      {/* Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          display: "flex",
          gap: "12px",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        <button
          onClick={toggleMic}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "24px",
          }}
        >
          {micEnabled ? <MdMic /> : <MdMicOff />}
        </button>

        <button
          onClick={toggleCam}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "24px",
          }}
        >
          {camEnabled ? <MdVideocam /> : <MdVideocamOff />}
        </button>

        <button
          onClick={handleLeave}
          style={{
            backgroundColor: "#e53935",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "12px",
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
