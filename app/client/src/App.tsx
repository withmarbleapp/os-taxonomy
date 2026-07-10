import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ChildPage } from './pages/ChildPage';
import { GeneratePage } from './pages/GeneratePage';
import { UploadPage } from './pages/UploadPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">Weekend Worksheets</span>
          <span className="brand-sub">Home learning, gently guided</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>
            Children
          </NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="main main-wide">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/children/:id" element={<ChildPage />} />
          <Route path="/children/:id/generate" element={<GeneratePage />} />
          <Route path="/children/:id/upload/:worksheetId" element={<UploadPage />} />
          <Route path="/children/:id/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
