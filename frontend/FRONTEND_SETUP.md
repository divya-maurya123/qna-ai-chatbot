# QnA AI Chatbot - Frontend

A React + Vite frontend for the QnA AI Chatbot project.

## Technology

- React
- Vite
- React Router
- Axios
- CSS
- JWT Authentication

## Project Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── ChatBox.jsx
│   │   ├── Message.jsx
│   │   ├── Sidebar.jsx
│   │   ├── FileUpload.jsx
│   │   └── Navbar.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Chat.jsx
│   │   └── Profile.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── .env
├── .env.example
├── index.html
├── package.json
└── vite.config.js