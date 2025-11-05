import { useEffect, useRef, useState } from "react";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { FiShare } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/VideoPlayer.css";

const VideoPlayer = ({ stream, roomId, remoteStream }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const recorderRef = useRef(null);
  const navigate = useNavigate();

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [showShareBox, setShowShareBox] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
    stream?.getTracks().forEach((track) => track.stop());
    navigate("/");
  };

  const startRecording = () => {
    if (!localVideoRef.current || !remoteVideoRef.current) {
      alert("Both video elements must be available to record.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    const drawFrame = () => {
      ctx.drawImage(remoteVideoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(localVideoRef.current, canvas.width - 320, canvas.height - 240, 320, 240);
      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const canvasStream = canvas.captureStream(30);
    const audioTracks = [
      ...stream?.getAudioTracks() || [],
      ...remoteStream?.getAudioTracks() || []
    ];
    audioTracks.forEach(track => canvasStream.addTrack(track));

    const recorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
    recorderRef.current = recorder;

    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting-${roomId}.webm`;
      a.click();
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
        <button onClick={toggleMic} style={iconButtonStyle}>
          {micEnabled ? <MdMic /> : <MdMicOff />}
        </button>

        <button onClick={toggleCam} style={iconButtonStyle}>
          {camEnabled ? <MdVideocam /> : <MdVideocamOff />}
        </button>

        <button onClick={handleLeave} style={leaveButtonStyle}>
          Leave
        </button>

        {!isRecording && (
          <button onClick={startRecording} style={recordButtonStyle}>
            Record
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording} style={stopButtonStyle}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FaCircle color="red" /> Stop Recording
            </span>
          </button>
        )}

        <button onClick={() => setShowShareBox(true)} style={iconButtonStyle}>
          <FiShare />
        </button>
      </div>

      {showShareBox && (
        <div style={shareBoxStyle}>
          <button onClick={() => setShowShareBox(false)} style={closeButtonStyle}>
            ✕
          </button>
          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Share this link:</p>
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/room/${roomId}`}
            style={shareInputStyle}
            onClick={(e) => e.target.select()}
          />
        </div>
      )}
    </div>
  );
};

const iconButtonStyle = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "24px",
};

const leaveButtonStyle = {
  backgroundColor: "#e53935",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "14px",
  marginLeft: "12px",
};

const recordButtonStyle = {
  backgroundColor: "#43a047",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "14px",
};

const stopButtonStyle = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "14px",
};

const shareBoxStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  zIndex: 1000,
  width: "300px",
  textAlign: "center",
};

const closeButtonStyle = {
  position: "absolute",
  top: "8px",
  right: "12px",
  background: "none",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
};

const shareInputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

export default VideoPlayer;
