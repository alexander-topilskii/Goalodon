import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { IndexOverlayProvider } from './lib/overlay-context.tsx'
import { SettingsProvider } from './lib/settings-context.tsx'
import { CalendarPage } from './pages/CalendarPage.tsx'
import { DayPage } from './pages/DayPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <SettingsProvider>
      <IndexOverlayProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/day/:date" element={<DayPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </IndexOverlayProvider>
    </SettingsProvider>
  )
}
