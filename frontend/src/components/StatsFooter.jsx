import { useState, useEffect } from "react"

function StatsFooter() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        fetch('http://localhost:3000/api/stats')
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => {})
    }, [])

    if(!stats) return null;

    return (
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>
                Cache hits: <span className="text-indigo-400">{stats.hits}</span>
                &nbsp;|&nbsp;
                Misses: <span className="text-indigo-400">{stats.misses}</span>
                &nbsp;|&nbsp;
                Hit rate: <span className="text-gray-400">{stats.hit_rate}%</span>
                &nbsp;|&nbsp;
                Last fetch: <span className="text-gray-400">
                    {stats.lastfetch ? new Date(stats.lastfetch).toLocaleTimeString() : 'N/A'}
                </span>
            </p>
        </div>
    )
}

export default StatsFooter