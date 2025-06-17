import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

function Match() {
    const [socket, setSocket] = useState(null)
    const [currentRound, setCurrentRound] = useState(3)
    const [totalRounds] = useState(15)
    const [timeLeft, setTimeLeft] = useState(60)
    const [participants, setParticipants] = useState(65)
    const [answered, setAnswered] = useState(28)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showResults, setShowResults] = useState(false)
    const [pointsEarned, setPointsEarned] = useState(0)
    const [showConfetti, setShowConfetti] = useState(false)
    const [currentUser] = useState({ name: 'Alice Johnson', isAdmin: false })
    const [nextRoundTimer, setNextRoundTimer] = useState(6)
    const [isTransitioning, setIsTransitioning] = useState(false)
    
    const timerRef = useRef(null)
    const nextRoundRef = useRef(null)

    // Mock question data
    const [questionData] = useState({
        photo: 'https://api.dicebear.com/7.x/adventurer/svg?seed=child1&backgroundColor=b6e3f4',
        options: [
            { id: 1, name: 'Alice Johnson', votes: 15 },
            { id: 2, name: 'Bob Smith', votes: 8 },
            { id: 3, name: 'Carol Wilson', votes: 12 },
            { id: 4, name: 'David Brown', votes: 18 },
            { id: 5, name: 'Emma Davis', votes: 12 }
        ],
        correctAnswer: 4 // David Brown
    })

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(null)
        setSocket(newSocket)

        // Socket event listeners
        newSocket.on('questionData', (data) => {
            // Handle new question data
        })

        newSocket.on('answerSelected', (data) => {
            setAnswered(data.totalAnswered)
        })

        newSocket.on('roundResults', (data) => {
            setShowResults(true)
            calculatePoints(data)
        })

        newSocket.on('nextRound', () => {
            startNextRound()
        })

        return () => {
            clearInterval(timerRef.current)
            clearInterval(nextRoundRef.current)
            newSocket.close()
        }
    }, [])

    useEffect(() => {
        if (!showResults && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeUp()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => clearInterval(timerRef.current)
    }, [showResults, timeLeft])

    useEffect(() => {
        if (showResults) {
            nextRoundRef.current = setInterval(() => {
                setNextRoundTimer(prev => {
                    if (prev <= 1) {
                        startNextRound()
                        return 6
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => clearInterval(nextRoundRef.current)
    }, [showResults])

    const handleOptionSelect = (optionId) => {
        if (selectedOption || showResults) return
        
        setSelectedOption(optionId)
        setAnswered(prev => prev + 1)
        
        if (socket) {
            socket.emit('selectAnswer', {
                roundId: currentRound,
                optionId,
                timeLeft
            })
        }
    }

    const handleTimeUp = () => {
        setShowResults(true)
        calculatePoints()
    }

    const calculatePoints = () => {
        if (!selectedOption) {
            setPointsEarned(0)
            return
        }

        const isCorrect = selectedOption === questionData.correctAnswer
        if (isCorrect) {
            const points = timeLeft > 0 ? timeLeft : 1
            setPointsEarned(points)
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
        } else {
            setPointsEarned(-10)
        }
    }

    const startNextRound = () => {
        setIsTransitioning(true)
        setTimeout(() => {
            setCurrentRound(prev => prev + 1)
            setTimeLeft(60)
            setSelectedOption(null)
            setShowResults(false)
            setPointsEarned(0)
            setNextRoundTimer(6)
            setIsTransitioning(false)
            // Reset answered count for new round
            setAnswered(0)
        }, 500)
    }

    const handleForceNext = () => {
        if (socket && currentUser.isAdmin) {
            socket.emit('forceNextRound')
        }
    }

    const getOptionPercentage = (votes) => {
        const totalVotes = questionData.options.reduce((sum, opt) => sum + opt.votes, 0)
        return totalVotes > 0 ? (votes / totalVotes) * 100 : 0
    }

    const getOptionColor = (optionId) => {
        if (!showResults) return 'bg-gray-700 hover:bg-gray-600'
        
        if (optionId === questionData.correctAnswer) {
            return 'bg-green-600'
        } else if (optionId === selectedOption && optionId !== questionData.correctAnswer) {
            return 'bg-red-600'
        } else {
            return 'bg-gray-600'
        }
    }

    const Confetti = () => (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 animate-ping"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random()}s`
                    }}
                />
            ))}
        </div>
    )

    const ProgressBar = ({ current, total }) => (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(current / total) * 100}%` }}
            />
        </div>
    )

    const TimerCircle = ({ timeLeft, total = 60 }) => {
        const percentage = (timeLeft / total) * 100
        const circumference = 2 * Math.PI * 45
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        return (
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="rgb(55, 65, 81)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={timeLeft > 10 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${timeLeft > 10 ? 'text-green-400' : 'text-red-400'}`}>
                        {timeLeft}
                    </span>
                </div>
            </div>
        )
    }

    if (isTransitioning) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading next round...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {showConfetti && <Confetti />}
            
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                Round {currentRound} of {totalRounds}
                            </h1>
                            <ProgressBar current={currentRound - 1} total={totalRounds} />
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Answered</p>
                                <p className="text-lg font-bold">
                                    <span className="text-green-400">{answered}</span>
                                    <span className="text-gray-400"> / {participants}</span>
                                </p>
                            </div>
                            
                            <TimerCircle timeLeft={timeLeft} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Photo Section */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-300">
                        Who is this little one?
                    </h2>
                    <div className="relative inline-block">
                        <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
                            <img
                                src={questionData.photo}
                                alt="Childhood photo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {selectedOption && !showResults && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Submitted!
                            </div>
                        )}
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {questionData.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={selectedOption || showResults}
                            className={`relative w-full p-4 rounded-lg border-2 text-left font-medium transition-all duration-300 ${
                                selectedOption === option.id
                                    ? 'border-blue-500 bg-blue-600/20'
                                    : 'border-gray-600 hover:border-gray-500'
                            } ${getOptionColor(option.id)} ${
                                selectedOption || showResults ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg">{option.name}</span>
                                {selectedOption === option.id && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Results Bar */}
                            {showResults && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{option.votes} votes</span>
                                        <span>{getOptionPercentage(option.votes).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-white/30 transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${getOptionPercentage(option.votes)}%`,
                                                transitionDelay: '0.5s'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Results Section */}
                {showResults && (
                    <div className="text-center space-y-4">
                        <div className={`p-6 rounded-lg ${pointsEarned > 0 ? 'bg-green-900/50 border border-green-600/50' : pointsEarned < 0 ? 'bg-red-900/50 border border-red-600/50' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                            <h3 className="text-xl font-bold mb-2">
                                {pointsEarned > 0 ? '🎉 Correct!' : pointsEarned < 0 ? '❌ Wrong Answer' : '⏰ Time\'s Up!'}
                            </h3>
                            <p className="text-lg mb-2">
                                It's <span className="font-bold text-green-400">
                                    {questionData.options.find(opt => opt.id === questionData.correctAnswer)?.name}
                                </span>
                            </p>
                            <p className={`text-2xl font-bold ${pointsEarned > 0 ? 'text-green-400' : pointsEarned < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {pointsEarned > 0 ? '+' : ''}{pointsEarned} points
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <div className="text-gray-400">
                                Next round in: <span className="text-white font-bold">{nextRoundTimer}s</span>
                            </div>
                            {currentUser.isAdmin && (
                                <button
                                    onClick={handleForceNext}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Force Next
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Waiting Message */}
                {selectedOption && !showResults && (
                    <div className="text-center p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                        <p className="text-blue-300">
                            Answer submitted! Waiting for other players...
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Match