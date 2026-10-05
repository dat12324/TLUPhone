import { useEffect, useRef, useState } from 'react'
import {
  FiCpu,
  FiMessageCircle,
  FiMinus,
  FiSend,
  FiX,
} from 'react-icons/fi'

const suggestedQuestions = [
  'Điện thoại dưới 10 triệu',
  'Điện thoại chơi game tốt',
  'Điện thoại chụp ảnh đẹp',
  'Điện thoại pin tốt',
  'So sánh điện thoại',
]

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Xin chào! 👋\nTôi là trợ lý AI của TLUPhone.\nTôi có thể giúp bạn tìm điện thoại phù hợp với nhu cầu và ngân sách.',
    timestamp: Date.now(),
  },
]

const MOCK_RESPONSE = 'Chức năng tư vấn AI đang được hoàn thiện.'
const GREETING_SEEN_KEY = 'tluphone_chat_greeting_seen'

const ChatAvatar = ({ small = false }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full bg-primary text-white ${small ? 'h-7 w-7' : 'h-9 w-9'}`}>
    <FiCpu className={small ? 'text-sm' : 'text-lg'} />
  </span>
)

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <ChatAvatar small />}
      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${isUser ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
        {message.content.split('\n').map((line, index) => (
          <span key={`${message.id}-${index}`}>
            {line}
            {index < message.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isGreetingVisible, setIsGreetingVisible] = useState(() => {
    try {
      return sessionStorage.getItem(GREETING_SEEN_KEY) !== '1'
    } catch {
      return true
    }
  })
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const responseTimersRef = useRef([])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, messages, isTyping])

  useEffect(() => () => {
    responseTimersRef.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const markGreetingSeen = () => {
    try {
      sessionStorage.setItem(GREETING_SEEN_KEY, '1')
    } catch {
      // Không ảnh hưởng UI nếu trình duyệt chặn sessionStorage.
    }
    setIsGreetingVisible(false)
  }

  const closeGreeting = markGreetingSeen

  const openChat = () => {
    markGreetingSeen()
    setIsOpen(true)
  }

  const handleSend = (event, presetContent = '') => {
    event?.preventDefault()
    const content = (presetContent || input).trim()
    if (!content) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setIsTyping(true)

    // Điểm kết nối dự kiến sau này: POST /api/chat với danh sách messages.
    const responseTimer = window.setTimeout(() => {
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: MOCK_RESPONSE,
        timestamp: Date.now(),
      }])
      setIsTyping(false)
      responseTimersRef.current = responseTimersRef.current.filter((timer) => timer !== responseTimer)
    }, 500)
    responseTimersRef.current.push(responseTimer)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {!isOpen && isGreetingVisible && (
        <div className="absolute bottom-16 right-0 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/30 sm:w-80">
          <button
            type="button"
            onClick={closeGreeting}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng lời chào"
          >
            <FiX />
          </button>
          <div className="flex items-start gap-3 pr-4">
            <ChatAvatar />
            <p className="text-sm leading-5 text-slate-700">
              Xin chào 👋<br />
              Bạn cần tư vấn chọn điện thoại?
            </p>
          </div>
          <span className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-b border-r border-slate-200 bg-white" />
        </div>
      )}

      {isOpen && (
        <section className="absolute bottom-16 right-0 flex h-[min(600px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/30 sm:bottom-16 sm:h-[min(600px,calc(100vh-8rem))]" aria-label="Trợ lý AI TLUPhone">
          <header className="flex shrink-0 items-center justify-between bg-secondary px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                <FiCpu className="text-lg" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">Trợ lý TLUPhone</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Thu nhỏ chatbot">
                <FiMinus />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Đóng chatbot">
                <FiX />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-white p-3.5 sm:p-4">
            {messages.map((message) => <ChatMessage key={message.id} message={message} />)}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-xs font-semibold text-slate-400">Bạn có thể hỏi:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => handleSend(null, question)}
                      className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-left text-xs text-primary transition hover:border-primary hover:bg-rose-100"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex items-end gap-2">
                <ChatAvatar small />
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-xs text-slate-400">Đang soạn tin...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              aria-label="Nhập câu hỏi cho trợ lý AI"
            />
            <button type="submit" disabled={!input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi tin nhắn">
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <div className="group relative">
        <button
          type="button"
          onClick={openChat}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-rose-300/50 transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/20"
          aria-label="Trợ lý AI TLUPhone"
          aria-expanded={isOpen}
        >
          {isOpen ? <FiMessageCircle className="text-2xl" /> : <FiCpu className="text-2xl" />}
        </button>
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-secondary px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100">
          Trợ lý AI TLUPhone
        </span>
      </div>
    </div>
  )
}

export default ChatbotWidget
