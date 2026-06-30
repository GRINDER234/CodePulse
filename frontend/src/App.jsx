import { useState, useEffect } from "react"
import ContestCard from "./components/contestCard"
import FilterBar from "./components/FilterBar"
import StatsFooter from "./components/StatsFooter"

function App() {
  const [contests, setcontests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [platform, setPlatform] = useState('All')
  const [status, setStatus] = useState('All')
  const [darkMode, setDarkMode] = useState(true)
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    fetch('https://codepulse-backend-971g.onrender.com/api/contests')
      .then(r => r.json())
      .then(d => {
        setcontests(d.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = contests.filter(c => {
    const platformMatch = platform === 'All' || c.platform === platform
    const statusMatch = status === 'All'
     || (status === 'Live' && c.phase === 'CODING')
     || (status === 'Upcoming' && c.phase === 'BEFORE')
    const searchMatch = c.title.toLowerCase().includes(search.toLowerCase())
    return platformMatch && statusMatch && searchMatch
  })

  if(loading) return <p className="text-white p-8">Loading contests...</p>
  if(error) return <p className="text-red-400 p-8">Error: {error}</p>

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'} p-8`}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">CodePulse</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        {contests.length} upcoming contests
      </p>

      <input 
        type="text"
        placeholder="Search contests..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 mb-6 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-indigo-500"
      />

      <FilterBar
       platform = {platform} setPlatform = {setPlatform}
       status = {status} setStatus = {setStatus}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <ContestCard key={c.id} contest={c} />
        ))}
      </div>

      <StatsFooter />
    </div>
  )
}

export default App