import React, { useEffect, useState } from "react";
import socketIo from "socket.io-client";
import ReactScrollToBottom from "react-scroll-to-bottom";
import "./App.css";

const ENDPOINT = "https://alokgautam99-chat-app-backend.onrender.com/";
let socket;

const App = () => {
  const [partnerId, setPartnerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [userGender, setUserGender] = useState(""); // Store the user's gender

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    socket.on("connect", () => {
      alert(
        "Hi, I am Alok Gautam the creator of this game. Please share someone else this link to play this game. Follow the instructions. Enjoy the game!"
      );
      console.log("Connected to server with socket ID:", socket.id);
    });

    // Listen for chat start and assign gender
    socket.on("chat_start", ({ partnerId, gender }) => {
      console.log("Chat started with partner:", partnerId);
      setPartnerId(partnerId);
      setUserGender(gender); // Set gender of the current user
      setMessages([]);
      setChatEnded(false);
    });

    // Listen for incoming messages
    socket.on("message", ({ senderId, text, gender }) => {
      console.log("Message received:", senderId, text);
      setMessages((prev) => [
        ...prev,
        { senderId, text, gender }, // Store gender for the sender
      ]);
    });

    // Listen for chat end
    socket.on("chat_end", () => {
      console.log("Chat ended.");
      setChatEnded(true);
      setPartnerId(null);
    });

    return () => {
      socket.off("connect");
      socket.off("chat_start");
      socket.off("message");
      socket.off("chat_end");
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && partnerId) {
      console.log("Sending message:", message);
      socket.emit("message", { partnerId, text: message });
      setMessages((prev) => [
        ...prev,
        { senderId: "me", text: message, gender: userGender }, // Include gender for the user
      ]);
      setMessage("");
    }
  };

  if (chatEnded) {
    return <h2>The chat has ended. Refresh the page to join a new chat.</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Two-Person Chat</h2>
      {partnerId && (
        <>
          <h3>Your task is to</h3>
          <h3>
            pretend like {userGender === "male" ? "boyfriend" : "girlfriend"}
          </h3>
          <h3>
            your partner is your{" "}
            {userGender === "male" ? "girlfriend" : "boyfriend"}
          </h3>
        </>
      )}
      {partnerId ? (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "350px",
              overflowY: "scroll",
              marginBottom: "10px",
            }}
          >
            <ReactScrollToBottom className="chatBox">
              {messages
                .filter(
                  (msg) => msg.senderId === "me" || msg.senderId === partnerId
                )
                .map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: msg.senderId === "me" ? "right" : "left",
                    }}
                  >
                    {/* <strong>
                      {msg.senderId === "me"
                        ? `You (${userGender})`
                        : `Partner (${msg.gender})`}
                      :
                    </strong> */}
                    <strong>
                      {msg.senderId === "me" ? `You` : `Partner`}:
                    </strong>
                    {msg.text}
                  </div>
                ))}
            </ReactScrollToBottom>
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
