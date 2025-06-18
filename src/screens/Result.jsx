import React, { useState, useEffect } from 'react'

function Result() {
    const [leaderboard, setLeaderboard] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showResults, setShowResults] = useState(false)

    // Mock data - replace with actual API call
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockData = [
                { id: 1, name: "Alex Johnson", score: 95, avatar: "🎯" },
                { id: 2, name: "Sarah Chen", score: 88, avatar: "🌟" },
                { id: 3, name: "Mike Rodriguez", score: 82, avatar: "🚀" },
                { id: 4, name: "Emma Wilson", score: 79, avatar: "💎" },
                { id: 5, name: "David Kim", score: 75, avatar: "🎪" },
                { id: 6, name: "Lisa Thompson", score: 71, avatar: "🎨" },
                { id: 7, name: "Ryan O'Connor", score: 68, avatar: "🎭" },
                { id: 8, name: "Maya Patel", score: 65, avatar: "🎪" },
            ]
            setLeaderboard(mockData)
            setIsLoading(false)
            setTimeout(() => setShowResults(true), 500)
        }, 1000)
    }, [])

    const topThree = leaderboard.slice(0, 3)
    const restOfPlayers = leaderboard.slice(3)

    const getMedalEmoji = (rank) => {
        switch (rank) {
            case 1: return "🥇"
            case 2: return "🥈"
            case 3: return "🥉"
            default: return ""
        }
    }

    const getPodiumHeight = (rank) => {
        switch (rank) {
            case 1: return "h-32"
            case 2: return "h-24"
            case 3: return "h-20"
            default: return "h-16"
        }
    }

    const getPodiumOrder = () => {
        if (topThree.length < 3) return topThree
        return [topThree[1], topThree[0], topThree[2]] // 2nd, 1st, 3rd for podium effect
    }

    const playAgain = () => {
        // Navigate to quiz start or reload
        window.location.reload()
    }

    const shareScore = () => {
        const shareText = `🎯 Guess Who Quiz Results!\n\n🥇 ${topThree[0]?.name}: ${topThree[0]?.score} points\n🥈 ${topThree[1]?.name}: ${topThree[1]?.score} points\n🥉 ${topThree[2]?.name}: ${topThree[2]?.score} points\n\nCan you beat these scores? 🤔`
        
        if (navigator.share) {
            navigator.share({
                title: 'Guess Who Quiz Results',
                text: shareText,
            })
        } else {
            navigator.clipboard.writeText(shareText)
            alert('Results copied to clipboard!')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white text-xl font-semibold">Calculating Results...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
            {/* Floating Sparkles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    >
                        ✨
                    </div>
                ))}
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className={`text-center mb-8 transition-all duration-1000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        🏆 FINAL LEADERBOARD 🏆
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100">Guess Who? Champions</p>
                </div>

                {/* Winner Announcement */}
                {topThree.length > 0 && (
                    <div className={`text-center mb-8 transition-all duration-1500 delay-500 ${showResults ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mx-auto max-w-2xl shadow-2xl animate-pulse">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                                🎉 {topThree[0].name} knows the batch better than anyone! 🎉
                            </h2>
                            <p className="text-lg md:text-xl text-yellow-100">
                                Scored an amazing {topThree[0].score} points!
                            </p>
                        </div>
                    </div>
                )}

                {/* Podium */}
                <div className={`mb-12 transition-all duration-2000 delay-1000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                    <div className="flex justify-center items-end space-x-4 md:space-x-8">
                        {getPodiumOrder().map((player, index) => {
                            const originalRank = topThree.findIndex(p => p.id === player.id) + 1
                            const isFirst = originalRank === 1
                            
                            return (
                                <div
                                    key={player.id}
                                    className={`text-center transition-all duration-1000 transform hover:scale-105`}
                                    style={{ animationDelay: `${index * 200}ms` }}
                                >
                                    {/* Player Info */}
                                    <div className={`mb-4 ${isFirst ? 'animate-bounce' : ''}`}>
                                        <div className={`text-4xl md:text-6xl mb-2 ${isFirst ? 'animate-pulse' : ''}`}>
                                            {player.avatar}
                                        </div>
                                        <div className={`text-2xl md:text-4xl mb-1 ${isFirst ? 'animate-pulse' : ''}`}>
                                            {getMedalEmoji(originalRank)}
                                        </div>
                                        <h3 className={`font-bold text-white mb-1 ${isFirst ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
                                            {player.name}
                                        </h3>
                                        <p className={`font-semibold ${isFirst ? 'text-yellow-300 text-lg md:text-xl' : 'text-blue-200 text-md md:text-lg'}`}>
                                            {player.score} pts
                                        </p>
                                    </div>

                                    {/* Podium Base */}
                                    <div className={`
                                        ${getPodiumHeight(originalRank)} 
                                        w-20 md:w-28 
                                        ${isFirst ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' : 
                                          originalRank === 2 ? 'bg-gradient-to-t from-gray-500 to-gray-300' : 
                                          'bg-gradient-to-t from-orange-700 to-orange-500'}
                                        rounded-t-lg 
                                        shadow-lg 
                                        flex items-center justify-center
                                        relative
                                        ${isFirst ? 'animate-pulse' : ''}
                                    `}>
                                        <span className="text-white font-bold text-xl md:text-2xl">
                                            {originalRank}
                                        </span>
                                        {isFirst && (
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                <div className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-300 opacity-75"></div>
                                                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Rest of Leaderboard */}
                {restOfPlayers.length > 0 && (
                    <div className={`mb-8 transition-all duration-1500 delay-1500 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
                            Other Champions
                        </h3>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-h-96 overflow-y-auto">
                            {restOfPlayers.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-4 mb-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl font-bold text-white bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center">
                                            {index + 4}
                                        </span>
                                        <span className="text-2xl">{player.avatar}</span>
                                        <div>
                                            <h4 className="font-semibold text-white text-lg">{player.name}</h4>
                                            <p className="text-blue-200 text-sm">Rank #{index + 4}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white">{player.score}</p>
                                        <p className="text-sm text-blue-200">points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={`text-center space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center transition-all duration-1500 delay-2000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <button
                        onClick={playAgain}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-green-600 hover:to-blue-600"
                    >
                        🎮 Play Again
                    </button>
                    <button
                        onClick={shareScore}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-pink-600 hover:to-purple-600"
                    >
                        📱 Share Results
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Result