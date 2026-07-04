import { useState, useEffect } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import ContestCard from "./components/contestCard"
import FilterBar from "./components/FilterBar"
import StatsFooter from "./components/StatsFooter"
import Dashboard from "./components/Dashboard"
import AuthPage from "./components/AuthPage"

function App() {
  const [contests, setcontests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [platform, setPlatform] = useState('All')
  const [status, setStatus] = useState('All')
  const [darkMode, setDarkMode] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cfHandle, setcfHandle] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])
  
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

  if(authLoading) return <div className="min-h-screen bg-gray-950"></div>

  if(!user) return <AuthPage />

  if(loading) return <p className="text-white p-8">Loading contests...</p>
  if(error) return <p className="text-red-400 p-8">Error: {error}</p>

return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'} p-8`}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">CodePulse</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{cfHandle ? `Hey, ${cfHandle}!` : `Hey!`}</span>
          <button
            onClick={() => signOut(auth)}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        {contests.length} upcoming contests
      </p>

      <Dashboard onHandleLoad={setcfHandle} />

      <input
        type="text"
        placeholder="Search contests..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 mb-6 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-indigo-500"
      />

      <FilterBar
        platform={platform} setPlatform={setPlatform}
        status={status} setStatus={setStatus}
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