// src/app/components/ChatWindow.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';

const PRESETS = [
    { label: 'Asistente por defecto', value: '' },
    {
        label: 'Tutor universitario',
        value: 'Eres un profesor universitario que explica los conceptos con detalle y ejemplos.',
    },
    {
        label: 'Desarrollador experto',
        value: 'Eres un desarrollador senior experto en JavaScript y Next.js.',
    },
];

const MODELS = [
    { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
    { label: 'gpt-4',         value: 'gpt-4' },
    { label: 'gpt-4-32k',      value: 'gpt-4-32k' },
];

export default function ChatWindow({ conversationId, onMessageSent }) {
    const [systemPrompt, setSystemPrompt] = useState(PRESETS[0].value);
    const [modelId, setModelId] = useState(MODELS[0].value);
    const [input, setInput] = useState('');
    const [chat, setChat] = useState([]);    // { role, content, ts, streaming, type? }
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1) Carga historial
    useEffect(() => {
        async function fetchHistory() {
            const res = await fetch(`/api/chat?conversationId=${conversationId}`);
            if (!res.ok) return;
            const rows = await res.json();
            setChat(rows.map(m => ({
                role: m.role,
                content: m.content,
                ts: new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                }),
                streaming: false
            })));
        }
        fetchHistory();
    }, [conversationId]);

    // 2) Auto-scroll
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [chat]);

    // 3) Subida + OCR en cliente
    const handleFileChange = async e => {
        const files = e.target.files;
        if (!files.length) return;
        const tsUser = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });

        for (const file of files) {
            // 3.1) Sube la imagen para servirla
            const upForm = new FormData();
            upForm.append('file', file);
            const upRes = await fetch('/api/upload', { method: 'POST', body: upForm });
            if (!upRes.ok) {
                console.error('Subida fallida:', await upRes.text());
                continue;
            }
            const { url } = await upRes.json();

            // 3.2) OCR en cliente
            let ocrText = '';
            try {
                const { data: { text } } = await Tesseract.recognize(
                    file,
                    'eng',
                    { logger: m => console.log(m) }
                );
                ocrText = text.trim();
            } catch (err) {
                console.error('OCR cliente falló:', err);
            }

            // 3.3) Añade mensaje de usuario (imagen)
            setChat(prev => [
                ...prev,
                { role: 'user', content: url, ts: tsUser, streaming: false, type: 'file' }
            ]);

            // 3.4) Inyecta resultado OCR como mensaje system
            if (ocrText) {
                setChat(prev => [
                    ...prev,
                    { role: 'system', content: `OCR de la imagen: ${ocrText}`, ts: tsUser, streaming: false }
                ]);
            }

            // 3.5) Lanza la llamada al chat con el extraSystem
            await send({
                message: '',
                extraSystem: ocrText ? `OCR de la imagen: ${ocrText}` : ''
            });

            // 3.6) Refresca sidebar para ver títulos actualizados
            onMessageSent();
        }

        e.target.value = '';
    };

    // 4) Envío de texto + streaming
    const send = async ({ message = input, extraSystem = '' } = {}) => {
        if (!message.trim() && !extraSystem) return;
        setLoading(true);

        const tsUser = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });

        // añade user
        if (message) {
            setChat(prev => [
                ...prev,
                { role: 'user', content: message, ts: tsUser, streaming: false }
            ]);
        }
        // placeholder IA
        setChat(prev => [
            ...prev,
            { role: 'assistant', content: '', ts: '', streaming: true }
        ]);

        // POST al API
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({
                message,
                conversationId,
                systemPrompt,
                modelId,
                extraSystem
            }),
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false, assistantContent = '';

        while (!done) {
            const { value, done: rDone } = await reader.read();
            done = rDone;
            if (value) {
                const chunk = decoder.decode(value);
                for (const char of chunk) {
                    assistantContent += char;
                    setChat(prev => {
                        const copy = [...prev];
                        const last = copy.length - 1;
                        copy[last].content = assistantContent;
                        return copy;
                    });
                    // typewriter
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise(r => setTimeout(r, 25));
                }
            }
        }

        // marca fin
        const tsAI = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });
        setChat(prev => {
            const copy = [...prev];
            const last = copy.length - 1;
            copy[last].streaming = false;
            copy[last].ts = tsAI;
            return copy;
        });

        setLoading(false);
        onMessageSent();
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Menús de sistema + modelo */}
            <div className="bg-gray-800 p-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <label className="text-gray-200 text-sm">Modo IA:</label>
                    <select
                        className="bg-gray-700 text-gray-100 rounded px-2 py-1"
                        value={systemPrompt}
                        onChange={e => setSystemPrompt(e.target.value)}
                    >
                        {PRESETS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-gray-200 text-sm">Modelo:</label>
                    <select
                        className="bg-gray-700 text-gray-100 rounded px-2 py-1"
                        value={modelId}
                        onChange={e => setModelId(e.target.value)}
                    >
                        {MODELS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chat */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2
                           scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
                {chat.map((m,i) => {
                    const isUser = m.role === 'user';
                    return (
                        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                max-w-[75%] px-4 py-2 rounded-lg
                ${isUser
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-800 text-gray-200 rounded-bl-none shadow'}
              `}>
                                {m.type==='file' ? (
                                    /\.(jpe?g|png|gif)$/i.test(m.content) ? (
                                        <img src={m.content} className="max-w-xs rounded" alt="file"/>
                                    ) : (
                                        <a href={m.content} target="_blank" className="text-blue-400 underline">
                                            Descargar archivo
                                        </a>
                                    )
                                ) : (
                                    <p className="whitespace-pre-wrap inline">
                                        {m.content}
                                        {m.streaming && (
                                            <span className="inline-block w-[1ch] bg-gray-200 animate-blink ml-1">&nbsp;</span>
                                        )}
                                    </p>
                                )}
                                {!m.streaming && (
                                    <span className="block text-xs text-gray-400 mt-1 text-right">
                    {m.ts}
                  </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input + adjuntos */}
            <div className="bg-gray-800 p-3 flex items-center space-x-2">
                <button
                    onClick={()=>fileInputRef.current.click()}
                    className="p-2 text-gray-400 hover:text-gray-200"
                >📎</button>
                <input
                    type="file" multiple hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <button className="p-2 mr-2 text-gray-400 hover:text-gray-200">
                    {/* Emoji */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                </button>
                <input
                    type="text"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                    placeholder="Escribe un mensaje..."
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&send()}
                    disabled={loading}
                />
                <button
                    onClick={send}
                    disabled={loading}
                    className="ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90 text-white"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 10l9-4 9 4-9 4-9-4z"/>
                        <path d="M3 14l9 4 9-4"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
