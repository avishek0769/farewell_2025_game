import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import RulesModal from '../components/RulesModal'
import { SERVER_URL } from '../../constants'
import { useLocation, useNavigate } from 'react-router'

function Room() {
    const [socket, setSocket] = useState(null)
    const [players, setPlayers] = useState([])
    const [admin, setAdmin] = useState()
    const [currentUser, setCurrentUser] = useState({})
    const [showRulesModal, setShowRulesModal] = useState(false)
    const [showStartingModal, setShowStartingModal] = useState(false)
    const [toasts, setToasts] = useState([])
    const toastIdRef = useRef(0)
    const isSocketConnectedRef = useRef(false)
    const navigate = useNavigate()
    const route = useLocation()
    const { fullname, isAdmin } = route.state

    useEffect(() => {
        if(isSocketConnectedRef.current) return;
        isSocketConnectedRef.current = true

        const newSocket = io(SERVER_URL)
        setSocket(newSocket)

        // Join the room
        newSocket.emit("joinRoom", { fullname, isAdmin })
        setCurrentUser({ id: newSocket.id, fullname, isAdmin })
        
        // Get all participants
        fetch(`${SERVER_URL}/api/room/getUsers`).then(res => res.json())
        .then(data => {
            setPlayers(data)
        })
        .catch(err => console.error('Error fetching players:', err))
        
        // Get admin details
        fetch(`${SERVER_URL}/api/room/getAdmin`).then(res => res.json())
        .then(data => {
            setAdmin(data)
        })
        .catch(err => console.error('Error fetching admin:', err))        
    }, [])

    useEffect(() => {
        // Socket event listeners
        if (socket) {
            console.log(socket.id)
            socket.on('playerJoined', (player) => {
                console.log(player)
                setPlayers(prev => [...prev, player])
                addToast(`${player.fullname} joined`, 'join')
            })

            socket.on('playerLeft', ({ playerId, playerName }) => {
                setPlayers(prev => prev.filter(p => p.id !== playerId))
                addToast(`${playerName} left`, 'leave')
            })

            socket.on('startingMatch', () => {
                setShowStartingModal(true)
                setTimeout(() => {
                    navigate("/match")
                }, 1500)
            })

            return () => {
                socket.close()
            }
        }
    }, [socket])


    const addToast = (message, type) => {
        const id = toastIdRef.current++
        const newToast = { id, message, type }
        setToasts(prev => [...prev, newToast])

        // Auto-remove toast after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    const handleStartMatch = () => {
        if (socket && currentUser.isAdmin) {
            socket.emit('startMatch')
        }
    }

    const getDiceBearAvatar = (seed, variant = 'adventurer') => {
        return `https://api.dicebear.com/7.x/${variant}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    }

    const isCurrentUser = (player) => {
        return player.id === currentUser.id
    }

    const PlayerCard = ({ player, isAdmin }) => (
        <div className={`relative flex items-center p-3 rounded-lg transition-all duration-200 ${isCurrentUser(player)
            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
            : isAdmin
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50'
            }`}>
            {/* Admin Badge */}
            {isAdmin && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    HOST
                </div>
            )}

            {/* Current User Badge */}
            {isCurrentUser(player) && !isAdmin && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    YOU
                </div>
            )}

            {/* Combined Badge for Admin + Current User */}
            {isCurrentUser(player) && isAdmin && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    YOU (HOST)
                </div>
            )}

            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0">
                <img
                    src={getDiceBearAvatar(player.fullname, player.avatar)}
                    alt={player.fullname}
                    className="w-full h-full"
                    onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                    }}
                />
                {/* <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center text-white text-sm font-bold">
                    {getInitials(player.fullname)}
                </div> */}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentUser(player)
                    ? 'text-blue-300'
                    : isAdmin ? 'text-purple-300' : 'text-white'
                    }`}>
                    {player.fullname}
                </p>
                <p className="text-xs text-gray-400">
                    {isAdmin ? 'Administrator' : 'Participant'}
                </p>
            </div>
        </div>
    )

    const StartingModal = () => (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
            <div className="text-center">
                <div className="relative mb-8 top-[-5rem] ">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute left-[46.7%] transform -translate-x-1/2 w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mt-2 ml-2 animate-reverse"></div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Match Starting...</h2>
                <p className="text-gray-300 text-lg">Only the sharpest eyes will win!</p>
                <div className="mt-6 flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    )

    const Toast = ({ toast }) => (
        <div className={`flex items-center p-3 rounded-lg shadow-lg border transition-all duration-300 ${toast.type === 'join'
            ? 'bg-green-900/80 border-green-600/50 text-green-200'
            : 'bg-red-900/80 border-red-600/50 text-red-200'
            }`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${toast.type === 'join' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
            <span className="text-sm font-medium">{toast.message}</span>
        </div>
    )


    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                                Guess Who? — Farewell Edition
                            </h1>
                            <p className="text-gray-400 mt-1">Sit tight while everyone joins. This one’s just for you, Batch '22.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-800/70 px-4 py-2 rounded-lg border border-gray-600/50">
                                <span className="text-2xl font-bold text-white">{players.length}</span>
                                <span className="text-gray-400 ml-2">Players</span>
                            </div>
                            <button
                                onClick={() => setShowRulesModal(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
                            >
                                Rules
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Players List */}
                    <div className="lg:col-span-3">
                        {/* Admin Section */}
                        {admin && Object.keys(admin).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-purple-300 mb-3">Administrator</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <PlayerCard player={admin} isAdmin />
                                </div>
                            </div>
                        )}

                        {/* Regular Players */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">
                                Participants ({players.length})
                            </h3>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 pt-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {players.map(player => (
                                        <PlayerCard key={player.id} player={player} isAdmin={false} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-6">
                            <h3 className="text-lg font-semibold mb-4">Room Actions</h3>

                            {currentUser.isAdmin && (
                                <button
                                    onClick={handleStartMatch}
                                    disabled={players.length < 2}
                                    className={`w-full px-6 py-3 font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-xl mb-4 ${players.length >= 2
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {players.length >= 2 ? 'Start Match' : `Need ${2 - players.length} more player${2 - players.length > 1 ? 's' : ''}`}
                                </button>
                            )}

                            <div className="space-y-3 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Room Status:</span>
                                    <span className="text-green-400">Waiting</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Min Players:</span>
                                    <span>2</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Players:</span>
                                    <span>100</span>
                                </div>
                            </div>

                            {!currentUser.isAdmin && (
                                <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                    <p className="text-blue-300 text-sm text-center">
                                        Waiting for host to start the match...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-4 left-4 right-4 z-40 pointer-events-none">
                <div className="max-w-md mx-auto space-y-2">
                    {toasts.map(toast => (
                        <Toast key={toast.id} toast={toast} />
                    ))}
                </div>
            </div>

            {/* Rules Modal */}
            <RulesModal closeModals={() => setShowRulesModal(false)} showRulesModal={showRulesModal} />

            {/* Starting Match Modal */}
            {showStartingModal && <StartingModal />}
        </div>
    )
}

export default Room