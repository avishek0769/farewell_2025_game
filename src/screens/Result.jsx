import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'


function Result() {
    const [leaderboard, setLeaderboard] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showResults, setShowResults] = useState(false)
    const [stopConfetti, setStopConfetti] = useState(false)
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth - 17,
        height: window.innerHeight + 400,
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Stop confetti after 5 seconds
        const timer = setTimeout(() => {
            setStopConfetti(true)
        }, 7000)
        return () => clearTimeout(timer) // Cleanup timer on unmount
    }, [])

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
            case 1: return "h-40 md:h-48"
            case 2: return "h-32 md:h-40"
            case 3: return "h-24 md:h-32"
            default: return "h-16"
        }
    }

    const getPodiumOrder = () => {
        if (topThree.length < 3) return topThree
        return [topThree[1], topThree[0], topThree[2]] // 2nd, 1st, 3rd for podium effect
    }

    const getDicebearAvatar = (name, size = 80) => {
        const seed = name.toLowerCase().replace(/\s+/g, '');
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=${size}`;
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white text-xl font-semibold">Calculating Results...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <Confetti
                recycle={!stopConfetti}
                width={dimensions.width}
                height={dimensions.height}
            />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className={`text-center mb-8 transition-all duration-1000 pt-4 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        🏆 FINAL LEADERBOARD 🏆
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-blue-100">Guess Who? Champions</p>
                </div>

                {/* Winner Announcement */}
                {topThree.length > 0 && (
                    <div className={`text-center mb-8 transition-all duration-1500 delay-500 ${showResults ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 md:p-6 mx-auto max-w-2xl shadow-2xl">
                            <p className="text-lg md:text-3xl lg:text-4xl font-bold text-white mb-2">
                                <span className='text-black text-[1.5rem] sm:text-4xl'>🎉 {topThree[0].name}</span> knows the batch better than anyone!
                            </p>
                            <p className="text-base md:text-lg lg:text-xl text-yellow-100">
                                Scored an amazing {topThree[0].score} points!
                            </p>
                        </div>
                    </div>
                )}

                {/* Enhanced Podium */}
                <div className={`mb-12 transition-all duration-2000 delay-1000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                    {/* Podium Base Background */}
                    <div className="relative px-4">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md md:max-w-lg bg-gradient-to-t from-gray-800 to-gray-700 h-8 rounded-t-lg opacity-50"></div>

                        <div className="flex justify-center items-end space-x-2 md:space-x-4 lg:space-x-8 relative">
                            {getPodiumOrder().map((player, index) => {
                                const originalRank = topThree.findIndex(p => p.id === player.id) + 1
                                const isFirst = originalRank === 1
                                const isSecond = originalRank === 2
                                const isThird = originalRank === 3

                                return (
                                    <div
                                        key={player.id}
                                        className={`text-center transition-all duration-1000 transform hover:scale-105 flex-1 max-w-[120px] md:max-w-[140px]`}
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        {/* Player Info Above Podium */}
                                        <div className={`mb-4 ${isFirst ? 'animate-bounce' : ''} transform transition-all duration-300`}>
                                            {/* Avatar */}
                                            <div className={`mb-3 relative`}>
                                                <div className={`
                                                    ${isFirst ? 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24' :
                                                        'w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20'} 
                                                    mx-auto rounded-full bg-white p-1 shadow-lg border-2
                                                    ${isFirst ? 'border-yellow-400' :
                                                        isSecond ? 'border-gray-400' : 'border-orange-400'}
                                                `}>
                                                    <img
                                                        src={getDicebearAvatar(player.name, isFirst ? 100 : 80)}
                                                        alt={`${player.name} avatar`}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                                {/* Crown for first place */}
                                                {isFirst && (
                                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xl md:text-2xl animate-bounce">
                                                        👑
                                                    </div>
                                                )}
                                            </div>

                                            {/* Medal */}
                                            <div className={`text-xl md:text-2xl lg:text-3xl mb-2`}>
                                                {getMedalEmoji(originalRank)}
                                            </div>

                                            {/* Name */}
                                            <h3 className={`font-bold text-white mb-1 break-words px-1 ${isFirst ? 'text-sm md:text-base lg:text-lg' :
                                                'text-xs md:text-sm lg:text-base'
                                                }`}>
                                                {player.name.split(' ')[0]}
                                            </h3>

                                            {/* Score */}
                                            <p className={`font-semibold ${isFirst ? 'text-yellow-300 text-sm md:text-base lg:text-lg' :
                                                'text-blue-200 text-xs md:text-sm lg:text-base'
                                                }`}>
                                                {player.score} pts
                                            </p>
                                        </div>

                                        {/* Enhanced Podium Base */}
                                        <div className={`
                                            ${getPodiumHeight(originalRank)} 
                                            w-full
                                            ${isFirst ? 'bg-gradient-to-t from-yellow-700 via-yellow-500 to-yellow-400 shadow-yellow-500/50' :
                                                isSecond ? 'bg-gradient-to-t from-gray-600 via-gray-400 to-gray-300 shadow-gray-400/50' :
                                                    'bg-gradient-to-t from-orange-800 via-orange-600 to-orange-500 shadow-orange-500/50'}
                                            rounded-t-xl
                                            shadow-lg shadow-black/30
                                            flex flex-col items-center justify-center
                                            relative
                                            border-t-2 border-white/20
                                        `}>
                                            {/* Rank Number */}
                                            <span className="text-white font-bold text-lg md:text-xl lg:text-2xl drop-shadow-lg">
                                                {originalRank}
                                            </span>

                                            {/* Decorative Elements */}
                                            <div className="absolute top-2 left-2 right-2 h-1 bg-white/20 rounded-full"></div>
                                            <div className="absolute top-4 left-3 right-3 h-0.5 bg-white/10 rounded-full"></div>

                                            {/* Special effects for first place */}
                                            {isFirst && (
                                                <>
                                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                                                        <div className="animate-ping absolute h-2 w-2 rounded-full bg-yellow-300 opacity-75"></div>
                                                        <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-400/10 to-yellow-300/20 rounded-t-xl"></div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Rest of Leaderboard */}
                {restOfPlayers.length > 0 && (
                    <div className={`mb-8 transition-all duration-1500 delay-1500 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center mb-6">
                            Other Champions
                        </h3>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 max-h-80 md:max-h-96 overflow-y-auto">
                            {restOfPlayers.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-3 md:p-4 mb-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
                                >
                                    <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                                        <span className="text-lg md:text-xl font-bold text-white bg-purple-500 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
                                            {index + 4}
                                        </span>
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white p-0.5 flex-shrink-0">
                                            <img
                                                src={getDicebearAvatar(player.name, 40)}
                                                alt={`${player.name} avatar`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-white text-sm md:text-lg truncate">{player.name}</h4>
                                            <p className="text-blue-200 text-xs md:text-sm">Rank #{index + 4}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg md:text-xl font-bold text-white">{player.score}</p>
                                        <p className="text-xs md:text-sm text-blue-200">points</p>
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
                        className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-green-600 hover:to-blue-600"
                    >
                        🎮 Play Again
                    </button>
                    <button
                        onClick={shareScore}
                        className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-pink-600 hover:to-purple-600"
                    >
                        📱 Share Results
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Result