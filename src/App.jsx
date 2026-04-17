import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NotesProvider } from './context/NotesContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import NoteEditorPage from './pages/NoteEditorPage'
import BookmarksPage from './pages/BookmarksPage'
import TrashPage from './pages/TrashPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <NotesProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
          <Route path="/note/new" element={<ErrorBoundary><NoteEditorPage /></ErrorBoundary>} />
          <Route path="/note/:id" element={<ErrorBoundary><NoteEditorPage /></ErrorBoundary>} />
          <Route path="/bookmarks" element={<ErrorBoundary><BookmarksPage /></ErrorBoundary>} />
          <Route path="/trash" element={<ErrorBoundary><TrashPage /></ErrorBoundary>} />
        </Routes>
      </NotesProvider>
    </BrowserRouter>
  )
}

export default App
