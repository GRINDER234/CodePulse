import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {LineChart, Line , XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'




function Dashboard() {
    const [handle, setHandle] = useState('')
    const [userInfo, setUserInfo] = useState(null)
    const [ratingHistory, setRatingHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [savedHandle, setSavedHandle] = useState('')

    useEffect(() => {
        const loadHandle = async () => {
            const user = auth.currentUser
            if(!user) return
            try {
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)
                if(docSnap.exists() && docSnap.data().cfHandle){
                    const saved = docSnap.data().cfHandle
                    setSavedHandle(saved)
                    setHandle(saved)
                    fetchUserData(saved)
                }
            } catch (err) {
                console.error('Error loading handle:', err)
            }
        }
        loadHandle()
    }, [])

    const saveHandle = async () => {
        const user = auth.currentUser
        if(!user || !handle.trim()) return
        setSaving(true)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                cfHandle: handle.trim(),
                email: user.email,
                updatedAt: new Date().toISOString()
            }, {merge: true})
            setSavedHandle(handle.trim())
            alert('Handle saved!')
        }catch (err) {
            console.error('Error saving handle:', err)
        }
        setSaving(false)
    }

    const fetchUserData = async (h) => {
        const targetHandle = h || handle
        if(!targetHandle.trim()) return
        setLoading(true)
        setError(null)
        setUserInfo(null)
        setRatingHistory([])

        try {
            const [infoRes, ratingRes] = await Promise.allSettled([
                fetch(`https://codeforces.com/api/user.info?handles=${targetHandle}`).then(r => r.json()),
                fetch(`https://codeforces.com/api/user.rating?handle=${targetHandle}`).then(r => r.json())
            ])

            if(infoRes.status === 'fulfilled' && infoRes.value.status === 'OK'){
                setUserInfo(infoRes.value.result[0])
            }else{
                setError('Handle not found. Check your Codeforces username.')
            }

            if(ratingRes.status === 'fulfilled' && ratingRes.value.status === 'OK'){
                const history = ratingRes.value.result.map(r => ({
                    contest: r.contestName.replace('Codeforces ', '').replace('Round ', 'R'),
                    rating: r.newRating,
                    date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-IN', {month: 'short', year: '2-digit'})
                }))
                setRatingHistory(history)
            }
        } catch (err) {
            setError('Failed to fetch data. Try again.')
        }

        setLoading(false)
    }

    const getRankColor = (rank) => {
        if(!rank) return 'text-gray-400'
        if(rank.includes('legendary')) return 'text-red-400'
        if(rank.includes('international')) return 'text-orange-400'
        if(rank.includes('grandmaster')) return 'text-red-500'
        if(rank.includes('master')) return 'text-orange-300'
        if(rank.includes('candidate')) return 'text-violet-400'
        if(rank.includes('expert')) return 'text-blue-400'
        if(rank.includes('specialist')) return 'text-cyan-400'
        if(rank.includes('pupil')) return 'text-green-400'
        return 'text-gray-400'
    }

return (
        <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">My CP Dashboard</h2>

            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Enter Codeforces handle..."
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchUserData()}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-indigo-500 w-64"
                />
                <button
                    onClick={() => fetchUserData()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {loading ? 'Loading...' : 'Fetch Stats'}
                </button>
                <button
                    onClick={saveHandle}
                    className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Handle'}
                </button>
            </div>

            {savedHandle && (
                <p className="text-gray-500 text-xs mb-4">
                    Saved handle: <span className="text-green-400">{savedHandle}</span> — auto-loads on next login
                </p>
            )}

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {userInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-xs mb-1">Handle</p>
                        <p className="text-white font-bold">{userInfo.handle}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-xs mb-1">Current Rating</p>
                        <p className="text-indigo-400 font-bold text-lg">{userInfo.rating ?? 'Unrated'}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-xs mb-1">Max Rating</p>
                        <p className="text-yellow-400 font-bold text-lg">{userInfo.maxRating ?? '-'}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-xs mb-1">Rank</p>
                        <p className={`font-bold capitalize ${getRankColor(userInfo.rank)}`}>{userInfo.rank ?? 'Unrated'}</p>
                    </div>
                </div>
            )}

            {ratingHistory.length > 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <p className="text-gray-400 text-sm mb-4">Rating History ({ratingHistory.length} contests)</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={ratingHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Line type="monotone" dataKey="rating" stroke="#818cf8" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

export default Dashboard