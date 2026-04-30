import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import { FlashcardsProvider } from './context/FlashcardsContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import HomePage from './pages/HomePage'
import NoteEditorPage from './pages/NoteEditorPage'
import BookmarksPage from './pages/BookmarksPage'
import TrashPage from './pages/TrashPage'
import FlashcardsPage from './pages/FlashcardsPage'
import FlashcardStudyPage from './pages/FlashcardStudyPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <NotesProvider>
                <FlashcardsProvider>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                    <Route path="/note/new" element={<ErrorBoundary><NoteEditorPage /></ErrorBoundary>} />
                    <Route path="/note/:id" element={<ErrorBoundary><NoteEditorPage /></ErrorBoundary>} />
                    <Route path="/bookmarks" element={<ErrorBoundary><BookmarksPage /></ErrorBoundary>} />
                    <Route path="/trash" element={<ErrorBoundary><TrashPage /></ErrorBoundary>} />
                    <Route path="/flashcards" element={<ErrorBoundary><FlashcardsPage /></ErrorBoundary>} />
                    <Route path="/flashcards/:id" element={<ErrorBoundary><FlashcardStudyPage /></ErrorBoundary>} />
                  </Routes>
                </FlashcardsProvider>
              </NotesProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
