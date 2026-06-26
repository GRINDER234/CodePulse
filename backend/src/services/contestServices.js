const axios = require('axios');

const mock_memory_store = {};
const status_cache = {hits : 0, misses : 0, lastfetch : null};
let falldata = null;

const redis_client = {
    isOpen: false,

    connect : async function() {
        this.isOpen = true;
        console.log("[MOCK REDIS] Connected to local memory store!");
    },


    get: async function(key) {
        const item = mock_memory_store[key];
        if(!item) return null;

        if(Date.now() > item.expiresAt){
            delete mock_memory_store[key];
            return null;
        }

        status_cache.hits++;
        return item.value;
    },

    setEx: async function(key, seconds, value) {
        mock_memory_store[key] = {
            value: value,
            expiresAt: Date.now() + (seconds * 1000)
        };
    }
};




//connect to redis memory store
async function connect_redis() {
    if(!redis_client.isOpen){
        await redis_client.connect();
        console.log("Connected to RedisCache successfully!");
    }
}

const fetchCodeforces = async () => {
    try{
        const result = await axios.get('https://codeforces.com/api/contest.list?gym=false');
        if(result.data.status !== "OK") return [];

        const raw = result.data.result;
        const active = raw.filter(c => c.phase === "BEFORE" || c.phase === "CODING");

        return active.map(c => ({
            id : `cf-${c.id}` ,
            title: c.name,
            url: `https://codeforces.com/contests/${c.id}`,
            startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
            duration: c.durationSeconds,
            platform: "Codeforces",
            phase: c.phase
        }));
    } catch(err) {
        console.error("Codeforces fetch failed:", err.message);
        return [];
    }
};

const fetchLeetCode = async () => {
    try {
        const response = await axios.get('https://alfa-leetcode-api.onrender.com/contests', {
            timeout: 8000
        });

        const rawctsts = response.data?.allContests;
        if (!rawctsts || !Array.isArray(rawctsts)) return [];

        const now = Math.floor(Date.now() / 1000);
        return rawctsts
            .filter(c => c.startTime + c.duration > now)
            .map(c => ({
                id: `lc-${c.titleSlug}`,
                title: c.title,
                url: `https://leetcode.com/contest/${c.titleSlug}`,
                startTime: new Date(c.startTime * 1000).toISOString(),
                duration: c.duration,
                platform: 'LeetCode',
                phase: now >= c.startTime ? 'CODING' : 'BEFORE'
            }));
    } catch (error) {
        console.error("Leetcode fetch failed:", error.message);
        return [];
    }
};

//fetching the contests data
const fetchAllctsts = async () => {
    try {
        //estabilishing redis caching layer
        await connect_redis();
        const cache_key = 'contests:active';
        const cache_data = await redis_client.get(cache_key);

        if(cache_data) {
            console.log("Cache hit! Serving from Redis...");
            return JSON.parse(cache_data);
        }

        //redis miss
        console.log("Cache Miss! Fetching concurrent streams from platforms....");
        status_cache.misses++;
        status_cache.lastfetch = new Date().toISOString();
        
        const [cfRes, leetRes] = await Promise.allSettled([
            fetchCodeforces(),
            fetchLeetCode()
        ]);

        const cfData = cfRes.status == "fulfilled" ? cfRes.value : [];
        const leetdata = leetRes.status == "fulfilled" ? leetRes.value : [];

        const consolidated = [...cfData, ...leetdata];
        if(consolidated.length === 0 && falldata){
            console.log("Both APIs failed - serving fallback Data");
            return falldata;
        }
        consolidated.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        falldata = consolidated;
        await redis_client.setEx(cache_key, 600, JSON.stringify(consolidated));
        return consolidated;

    } catch (error) {
        console.error("Error inside aggregatectstService:", error.message);
        throw new Error("Failed to comply multi-platform contest data service stream.");
    }
};

module.exports = {
    fetchAllctsts,
    getCacheStats : () => ({
        ...status_cache,
        hit_rate : status_cache.hits + status_cache.misses === 0
             ? 0
             : Math.round((status_cache.hits / (status_cache.hits + status_cache.misses)) * 100)
    })
};