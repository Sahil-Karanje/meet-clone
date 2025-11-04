import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import "../styles/ChatBox.css";

const ChatBox = ({ messages, sendMessage, username }) => {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const time = new Date().toLocaleTimeString();
    sendMessage({ message, time });
    setMessage("");
  };

  return (
    <Box className="chatbox-container">
      <Typography variant="h6" gutterBottom>
        Chat
      </Typography>

      <List className="chatbox-messages">
        {messages.map((msg, i) => (
          <ListItem
            key={i}
            className={msg.username === "System"
              ? "system-message"
              : msg.username === username
                ? "own-message"
                : "other-message"}
            alignItems="flex-start"
          >
            <ListItemText
              primary={`${msg.username}: ${msg.message}`}
              secondary={msg.time || ""}
            />
          </ListItem>
        ))}
      </List>

      <form onSubmit={handleSend} className="chatbox-form">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }}>
          Send
        </Button>
      </form>
    </Box>
  );
};

export default ChatBox;
