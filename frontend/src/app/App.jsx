import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Shared layout components
import Navbar from '../shared/components/Navbar'
import Footer from '../shared/components/Footer'

// Feature pages
import ArenaPage from '../features/arena/ArenaPage'
import BattlePage from '../features/battle/BattlePage'
import SetupPage from '../features/setup/SetupPage'
import LeaderboardPage from '../features/leaderboard/LeaderboardPage'


const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky top navigation */}
      <Navbar />

      {/* Page content — grows to fill available space */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<ArenaPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App