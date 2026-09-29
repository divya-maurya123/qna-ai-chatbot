import { useState } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          message: input
        }
      );

      console.log("Backend response:", response.data);

      setAnswer(response.data.answer);

    } catch (error) {
      console.error("Chat error:", error);

      setAnswer(
        "Sorry, something went wrong while connecting to the chatbot."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      
      <h1>QnA AI Chatbot 🤖</h1>

      <p>Ask me anything!</p>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        style={{
          width: "70%",
          padding: "12px",
          marginRight: "10px"
        }}
      />

      {/* Chat Button */}
      <button onClick={sendMessage}>
        {loading ? "Sending..." : "Send"}
      </button>

      {/* Answer */}
      {answer && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px"
          }}
        >
          <strong>AI:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;