import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import ScrollToTop from './components/common/ScrollToTop'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AppRoutes from './routes/AppRoutes'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import ChatbotWidget from './components/common/ChatbotWidget'

const authPaths = ['/login', '/register', '/forgot-password']

const AppLayout = () => {
  const { pathname } = useLocation()
  const isAuthPage = authPaths.includes(pathname)

  return (
    <div className={isAuthPage ? 'min-h-screen' : 'min-h-screen flex flex-col'}>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? 'min-h-screen' : 'flex-1'}>
        <AppRoutes />
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatbotWidget />}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AuthProvider>
    </CartProvider>
  )
}

export default App
