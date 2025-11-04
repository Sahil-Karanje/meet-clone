import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import io from "socket.io-client";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import "../styles/Room.css";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://192.168.10.103:5000");

const Room = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const username = state?.username || JSON.parse(localStorage.getItem("user"))?.name || "Guest";

  const [messages, setMessages] = useState([]);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const candidateQueueRef = useRef({});

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera/mic access is not supported in this browser or insecure origin.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        localStreamRef.current = currentStream;
        socket.emit("join-room", { roomId, username });
      })
      .catch((err) => {
        console.error("getUserMedia error:", err);
        alert("Unable to access camera/mic. Please check permissions or use HTTPS/localhost.");
      });

    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [roomId, username]);

  useEffect(() => {
    socket.on("user-joined", ({ id: remoteId }) => {
      if (!peersRef.current[remoteId]) {
        const pc = createPeer(remoteId, true);
        peersRef.current[remoteId] = pc;
      }
    });

    socket.on("offer", async ({ offer, from }) => {
      if (!peersRef.current[from]) {
        const pc = createPeer(from, false);
        peersRef.current[from] = pc;
      }
      const pc = peersRef.current[from];
      if (pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId, to: from });
      }
    });

    socket.on("answer", async ({ answer, from }) => {
      const pc = peersRef.current[from];
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("candidate", async ({ candidate, from }) => {
      const pc = peersRef.current[from];

      if (!pc || !candidate) return;

      if (pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!candidateQueueRef.current[from]) candidateQueueRef.current[from] = [];
        candidateQueueRef.current[from].push(candidate);
      }
    });

    socket.on("user-left", ({ id, username }) => {
      if (peersRef.current[id]) {
        peersRef.current[id].close();
        delete peersRef.current[id];
      }

      setMessages((prev) => [
        ...prev,
        {
          username: "System",
          message: `${username} has left the room.`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });


    socket.on("receive-message", (data) => setMessages((prev) => [...prev, data]));
  }, []);

  const createPeer = (remoteId, initiator) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", {
          candidate: event.candidate,
          roomId,
          to: remoteId,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (initiator) {
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId, to: remoteId });
      };
    }

    return pc;
  };

  const handleSendMessage = ({ message, time }) => {
    socket.emit("send-message", { roomId, message, username, time });
  };

  return (
    <div className="room-wrapper">
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <p>Logged in as <strong>{username}</strong></p>
      </div>

      <div className="room-container">
        <div className="video-section">
          <VideoPlayer stream={stream} remoteStream={remoteStream} />
        </div>
        <div className="chat-section">
          <ChatBox
            socket={socket}
            messages={messages}
            sendMessage={handleSendMessage}
            username={username}
          />
        </div>
      </div>
    </div>
  );

};

export default Room;
