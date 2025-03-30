import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState("");
  const [respuesta, setRespuesta] = useState("");

  function llamadaApiOpenAI() {
    console.log("Llamada a la API de OpenAI");
  }

  console.log(prompt);
  return (
    <div className="App">
      <div>
        <textarea 
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Texto del prompt.'
          cols={50}
          rows={10}
        />
      </div>
      <div>
        <button onClick={llamadaApiOpenAI}>Enviar</button>
        {respuesta != "" ? <div><p>Respuesta:</p></div> : null}
      </div>
    </div>
  )
}

export default App