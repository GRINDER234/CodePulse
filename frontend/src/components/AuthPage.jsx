import { useState } from "react"
import { auth, googleProvider } from '../firebase'

import{
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
} from 'firebase/auth'

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleEmailAuth = async () => {
        setLoading(true)
        setError(null)
        setMessage(null)
        try{
            if(isLogin) {
                await signInWithEmailAndPassword(auth, email, password)
            } else{
                await createUserWithEmailAndPassword(auth, email, password)
            }
        }catch(err){
            setError(err.message)
        }
        setLoading(false)
    }


    const handleGoogle = async () => {
        setLoading(true)
        setError(null)
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    const handlePasswordReset = async () => {
        if(!email){
            setError('Enter your email above first.')
            return
        }try{
            await sendPasswordResetEmail(auth, email)
            setMessage('Password reset email sent! Check your inbox.')
        }catch(err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">CodePulse</h1>
                <p className="text-gray-400 text-center mb-8 text-sm">Your personal CP companion</p>

                <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isLogin ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isLogin ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                    >
                        Register
                    </button>
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 mb-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-indigo-500"
                />

                 <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                    className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-indigo-500"
                />

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                {message && <p className="text-green-400 text-sm mb-3">{message}</p>}

                <button
                    onClick={handleEmailAuth}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors mb-3"
                >
                    {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                </button>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-600 mb-4"
                >
                    Continue with Google
                </button>

                {isLogin && (
                    <p
                        onClick={handlePasswordReset}
                        className="text-center text-indigo-400 text-sm cursor-pointer hover:underline"
                    >
                        Forgot password?
                    </p>
                )}
            </div>
        </div>
    )
}

export default AuthPage