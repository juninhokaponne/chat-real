import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChatPanelProps {
  socket: any;
  roomId: string;
  username: string;
}

export default function ChatPanel({ socket, roomId, username }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: { sender: string; text: string }) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('chat-message', handleMessage);
    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMsg = { sender: username, text: message.trim() };
    socket.emit('chat-message', { ...newMsg, roomId });
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '10px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer'
        }}
        title="Open Chat"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100%',
              width: '300px',
              backgroundColor: '#1f2937',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px',
                borderBottom: '1px solid #374151',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h2 style={{ fontWeight: 600 }}>Chat</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === username ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === username ? '#3b82f6' : '#374151',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    maxWidth: '70%'
                  }}
                >
                  <p style={{ fontSize: '12px', fontWeight: 600 }}>{msg.sender}</p>
                  <p style={{ fontSize: '14px' }}>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                display: 'flex',
                borderTop: '1px solid #374151',
                padding: '8px'
              }}
            >
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: '#111827',
                  color: 'white'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
