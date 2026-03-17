import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import CollectionsPage from './pages/CollectionsPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
