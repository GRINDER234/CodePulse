import useCountdown from "../hooks/useCountdown"

function ContestCard({ contest }) {
    const platform_color = contest.platform === 'Codeforces'
      ? 'bg-blue-600'
      : 'bg-yellow-500'

    const is_live = contest.phase === 'CODING'

    const startDate = new Date(contest.startTime)
    const formatted_time = startDate.toLocaleString('en-IN',{
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })

    const hours = Math.floor(contest.duration / 3600)
    const minutes = Math.floor((contest.duration % 3600) / 60)
    const duration_string = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    const countdown = useCountdown(contest.startTime)

    const calendarUrl = () => {
        const start = new Date(contest.startTime)
        const end = new Date(start.getTime() + contest.duration * 1000)

        const fmt = d => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Platform: ' + contest.platform)}&location=${encodeURIComponent(contest.url)}`
    }

    return(
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
                <span className={`${platform_color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {contest.platform}
                </span>

                {is_live ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping inline-block"></span>
                        LIVE
                    </span>
                ) : (
                    <span className="text-gray-500 text-xs">UPCOMING</span>
                )}
            </div>

            <h2 className="text-white font-semibold text-base mb-3 leading-snug">
                {contest.title}
            </h2>

            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>🕐 {formatted_time}</span>
                <span>⏱ {duration_string}</span>
            </div>


            <div className="text-center text-sm font-mono mb-4">
                {contest.phase === 'CODING' ? (
                    <span className="text-green-400">Contest is Live Now!</span>
                ) : (
                    <span className="text-indigo-300">Starts in: {countdown}</span>
                )}
            </div>


            <a 
              href={calendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200 mb-2"
            >
                📅 Add to Google Calendar
            </a>
            
            <a href={contest.url} target = "_blank" rel="noopener noreferrer" className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200">Join Contest on Clicking here</a>
        </div>
    )
}

export default ContestCard