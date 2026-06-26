function FilterBar({ platform, setPlatform, status, setStatus }) {
    const platforms = ['All', 'Codeforces', 'LeetCode']
    const statuses = ['All', 'Upcoming', 'Live']

    return (
        <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex gap-2">
                {platforms.map(p => (
                    <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
                            ${platform === p
                                ? 'bg-indigo-600 text-white'
                               : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                {statuses.map(s => (
                     <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
                            ${status === s
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                     >
                        {s}
                     </button>
                ))}
            </div>
        </div>
    )
}

export default FilterBar