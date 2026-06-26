import { useState, useEffect } from "react"

function useCountdown(startTime) {
    const [remaining, setRemaining] = useState(new Date(startTime) - Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(new Date(startTime) - Date.now())
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    if (remaining <= 0) return 'Contest Started'

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    return `${minutes}m ${seconds}s`
}

export default useCountdown