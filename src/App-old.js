import React, { useEffect, useState } from "react";
import socketIo from "socket.io-client";

const ENDPOINT = "http://localhost:4400/";
let socket;

const App = () => {
  const [partnerId, setPartnerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatEnded, setChatEnded] = useState(false);

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    // Listen for chat start
    socket.on("chat_start", ({ partnerId }) => {
      setPartnerId(partnerId);
      setMessages([]);
      setChatEnded(false);
    });

    // Listen for incoming messages
    socket.on("message", ({ senderId, text }) => {
      setMessages((prev) => [...prev, { senderId, text }]);
    });

    // Listen for chat end
    socket.on("chat_end", () => {
      setChatEnded(true);
      setPartnerId(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && partnerId) {
      socket.emit("message", { partnerId, text: message });
      setMessages((prev) => [...prev, { senderId: "me", text: message }]);
      setMessage("");
    }
  };

  if (chatEnded) {
    return <h2>The chat has ended. Refresh the page to join a new chat.</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Two-Person Chat</h2>
      {partnerId ? (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "300px",
              overflowY: "scroll",
              marginBottom: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{ textAlign: msg.senderId === "me" ? "right" : "left" }}
              >
                <strong>{msg.senderId === "me" ? "You" : "Partner"}:</strong>{" "}
                {msg.text}
              </div>
            ))}
          </div>
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              style={{ width: "80%" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
            </button>
          </div>
        </>
      ) : (
        <h3>Waiting for a partner...</h3>
      )}
    </div>
  );
};

export default App;
