import React, { useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [message, setMessage] = useState('');  // Estado para el mensaje del usuario
  const [chatHistory, setChatHistory] = useState([]); // Historial de mensajes

  // Función para manejar el cambio en el campo de texto
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Función para manejar el envío de mensajes
  const sendMessage = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    if (!message.trim()) return; // No enviar si el campo está vacío

    // Agregar el mensaje del usuario al historial
    setChatHistory([...chatHistory, { sender: 'user', text: message }]);
    setMessage(''); // Limpiar el campo de entrada

    try {
      // Enviar la solicitud a tu servidor backend
      const response = await axios.post("http://localhost:5000/chat", {
        message: message,
      });

      const aiMessage = response.data.message;
      // Agregar la respuesta de la IA al historial
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: aiMessage },
      ]);
    } catch (error) {
      console.error("Error al obtener la respuesta:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: 'Hubo un error al obtener la respuesta.' },
      ]);
    }
  };

  return (
    <div>
      <div className="chat-container" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <p
              style={{
                background: msg.sender === 'user' ? '#d1f7d6' : '#f1f0f0',
                padding: '10px',
                borderRadius: '10px',
                maxWidth: '70%',
                margin: '5px',
              }}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="Escribe un mensaje..."
          style={{
            width: '80%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Chat;