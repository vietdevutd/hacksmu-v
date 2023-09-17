import { useState } from "react";
//import { sendMessageToOpenAI } from "./axios";
import axios from 'axios';

function ChatTab() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleMessageSubmit = async () => {
    const query = {
      "query" : input
    }
    console.log(query)
    axios.post('http://localhost:5000/api/query', query, {headers: {
      'Content-Type': 'application/json',
    }})
      .then((response) => {
        console.log(response.data);
        setMessages([
          ...messages,
          { text: input, isUser: true },
          { text: response.data.answer, isUser: false },
        ]);
        setInput("");
      })
      .catch((error) => {
        console.error(error);
      })

  };

  return (
    <div className="ChatTab">
      <div className="chat">
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.isUser ? "user-message" : "bot-message"}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button id="sendButton" onClick={handleMessageSubmit}>Send</button>
      </div>
    </div>
  );
}

export default ChatTab;