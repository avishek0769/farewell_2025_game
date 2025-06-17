import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import img2 from '../assets/images/img2.jpg'

function Match() {
    const [socket, setSocket] = useState(null)
    const [currentRound, setCurrentRound] = useState(3)
    const [totalRounds] = useState(15)
    const [timeLeft, setTimeLeft] = useState(60)
    const [participants, setParticipants] = useState(65)
    const [answered, setAnswered] = useState(28)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showResults, setShowResults] = useState(true) //lsl
    const [pointsEarned, setPointsEarned] = useState(0)
    const [totalPoints, setTotalPoints] = useState(142)
    const [showConfetti, setShowConfetti] = useState(false)
    const [currentUser] = useState({ name: 'Alice Johnson', isAdmin: false })
    const [nextRoundTimer, setNextRoundTimer] = useState(60)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isPortrait, setIsPortrait] = useState(false);

    const timerRef = useRef(null)
    const nextRoundRef = useRef(null)

    const handleImageLoad = (e) => {
        const img = e.target;
        const isPortraitImg = img.naturalHeight > img.naturalWidth;
        setIsPortrait(isPortraitImg);
    };

    // Mock question data
    const [questionData] = useState({
        photo: img2,
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
            setTotalPoints(prev => prev + points)
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
        } else {
            setPointsEarned(-10)
            setTotalPoints(prev => prev - 10)
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

    const getProgressBarColor = (optionId) => {
        if (optionId === questionData.correctAnswer) {
            return 'bg-green-500'
        } else if (optionId === selectedOption && optionId !== questionData.correctAnswer) {
            return 'bg-red-500'
        } else {
            return 'bg-blue-400'
        }
    }

    const Confetti = () => (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random()}s`
                    }}
                >
                    🎉
                </div>
            ))}
        </div>
    )

    const ProgressBar = ({ current, total }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(current / total) * 100}%` }}
            />
        </div>
    )

    const TimerCircle = ({ timeLeft, total = 60 }) => {
        const percentage = (timeLeft / total) * 100
        const circumference = 2 * Math.PI * 30
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        return (
            <div className={`relative ${currentUser.isAdmin ? 'w-20 h-20 lg:w-28 lg:h-28' : 'w-16 h-16'}`}>
                <svg className={`${currentUser.isAdmin ? 'w-20 h-20 lg:w-28 lg:h-28' : 'w-16 h-16'} transform -rotate-90`} viewBox="0 0 80 80">
                    <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="rgb(55, 65, 81)"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke={timeLeft > 10 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                        strokeWidth="6"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold ${currentUser.isAdmin ? 'text-lg lg:text-2xl' : 'text-lg'} ${timeLeft > 10 ? 'text-green-400' : 'text-red-400'}`}>
                        {timeLeft}
                    </span>
                </div>
            </div>
        )
    }

    const Header = () => (
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-3 sm:px-4 py-3">
            <div className="max-w-7xl mx-auto w-full">
                {/* Mobile Layout - Keep existing two-row layout */}
                <div className="flex flex-col gap-3 lg:hidden">
                    {/* Top Row - Round info and Timer */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className={`text-lg ${currentUser.isAdmin ? "sm:text-3xl" : "sm:text-xl"} font-bold text-white mb-1`}>
                                Round {currentRound} of {totalRounds}
                            </h1>
                            <ProgressBar current={currentRound - 1} total={totalRounds} />
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                            <TimerCircle timeLeft={timeLeft} />
                        </div>
                    </div>

                    {/* Bottom Row - Stats and Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className={`text-gray-400 ${currentUser.isAdmin ? 'text-xs lg:text-lg' : 'text-xs'}`}>People guessed</p>
                                <p className={`font-bold ${currentUser.isAdmin ? 'text-sm lg:text-2xl' : 'text-sm'}`}>
                                    <span className="text-green-400">{answered}</span>
                                    <span className="text-gray-400"> / {participants}</span>
                                </p>
                            </div>

                            {!currentUser.isAdmin && (
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Total Score</p>
                                    <p className="text-sm font-bold text-blue-400">
                                        {totalPoints} pts
                                    </p>
                                </div>
                            )}
                        </div>

                        {currentUser.isAdmin && (
                            <button
                                onClick={handleForceNext}
                                className={`bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors whitespace-nowrap ${currentUser.isAdmin ? 'px-3 py-1.5 lg:px-6 lg:py-3 text-sm lg:text-lg' : 'px-3 py-1.5 text-sm'}`}
                            >
                                Force Next
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Layout - Single Row */}
                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
                    {/* Left Section - Round info */}
                    <div className="flex-1 min-w-0">
                        <h1 className={`font-bold text-white mb-1 ${currentUser.isAdmin ? "text-3xl" : "text-xl"}`}>
                            Round {currentRound} of {totalRounds}
                        </h1>
                        <ProgressBar current={currentRound - 1} total={totalRounds} />
                    </div>

                    {/* Center Section - Stats */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className={`text-gray-400 ${currentUser.isAdmin ? 'text-lg' : 'text-xs'}`}>People guessed</p>
                            <p className={`font-bold ${currentUser.isAdmin ? 'text-2xl' : 'text-sm'}`}>
                                <span className="text-green-400">{answered}</span>
                                <span className="text-gray-400"> / {participants}</span>
                            </p>
                        </div>

                        {!currentUser.isAdmin && (
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Your Score</p>
                                <p className="text-sm font-bold text-blue-400">
                                    {totalPoints} pts
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Section - Timer and Actions */}
                    <div className="flex items-center gap-6">
                        <TimerCircle timeLeft={timeLeft} />

                        {currentUser.isAdmin && (
                            <button
                                onClick={handleForceNext}
                                className={`bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors whitespace-nowrap ${currentUser.isAdmin ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-sm'}`}
                            >
                                Force Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

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
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
            {showConfetti && <Confetti />}

            {/* Compact Header */}
            {!currentUser.isAdmin ? <Header /> : currentUser.isAdmin && !showResults ? <Header /> : null}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 w-full">
                {currentUser.isAdmin ? (
                    /* Admin Layout - Centered with Horizontal Options */
                    <div className="text-center space-y-4">
                        {showResults && (
                            <div className="space-y-6">
                                {/* Results Section */}
                                <div className={`flex justify-center gap-4 p-4 rounded-lg ${pointsEarned > 0 ? 'bg-green-900/50 border border-green-600/50' : pointsEarned < 0 ? 'bg-red-900/50 border border-red-600/50' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                                    <p className="text-4xl">
                                        It's <span className="font-bold text-green-400">
                                            {questionData.options.find(opt => opt.id === questionData.correctAnswer)?.name}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Photo Section - Centered */}
                        {showResults ? <p className="text-lg text-gray-400 mb-3">
                            Next round in: <span className="text-white font-bold text-xl">{nextRoundTimer}s</span>
                        </p> : null}

                        <div className={`transition-all duration-500 ${showResults ? 'opacity-50' : 'opacity-100'}`}>
                            <h2 className="block sm:hidden text-2xl font-bold mb-6 text-gray-300">
                                Who is this little one?
                            </h2>
                            <div className="relative inline-block">
                                <div className={`${showResults ? "w-[44.7rem] h-[25rem]" : "w-[53.2rem] h-[30rem]"} rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700`}>
                                    <img
                                        src={questionData.photo}
                                        alt="Childhood photo"
                                        onLoad={handleImageLoad}
                                        className={
                                            isPortrait
                                                ? "object-contain h-[120%] m-auto"
                                                : "object-cover w-full h-full"
                                        }
                                    />
                                </div>
                                {selectedOption && !showResults && (
                                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                                        Submitted!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Percentage Results Heading */}
                        {showResults ? <h3 className="text-2xl font-bold text-gray-300">
                            Percentage of guesses for options
                        </h3> : null}

                        {/* Options - Horizontal Grid */}
                        <div className="grid grid-cols-5 gap-4 max-w-6xl mx-auto">
                            {questionData.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    disabled={selectedOption || showResults}
                                    className={`relative p-4 rounded-lg border-2 text-center font-medium transition-all duration-300 ${selectedOption === option.id
                                        ? 'border-blue-500 bg-blue-600/20'
                                        : 'border-gray-700 hover:border-gray-500'
                                        } ${getOptionColor(option.id)} ${selectedOption || showResults ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className='flex gap-2'>
                                            <span className="text-xl font-semibold">{option.name}</span>
                                            {selectedOption === option.id && (
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Show percentage in option for admin when results are shown */}
                                        {showResults && (
                                            <div className="text-center">
                                                <span className="text-xl font-bold text-white">
                                                    {getOptionPercentage(option.votes).toFixed(1)}%
                                                </span>
                                                <div className="text-sm text-gray-300">
                                                    ({option.votes} votes)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>


                        {/* Waiting Message for Admin */}
                        {selectedOption && !showResults && (
                            <div className="p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg max-w-md mx-auto">
                                <p className="text-blue-300 text-xl">
                                    Answer submitted! Waiting for other players...
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Regular User Layout - Keep existing side-by-side for desktop, stacked for mobile */
                    <>
                        {/* Results Section - Shown at top when results are visible */}
                        {showResults && (
                            <div className="mb-6 space-y-4">
                                <div className={`p-4 rounded-lg text-center ${pointsEarned > 0 ? 'bg-green-900/50 border border-green-600/50' : pointsEarned < 0 ? 'bg-red-900/50 border border-red-600/50' : 'bg-gray-800/50 border border-gray-600/50'}`}>
                                    <h3 className="text-lg font-bold mb-2">
                                        {pointsEarned > 0 ? '🎉 Correct!' : pointsEarned < 0 ? '❌ Wrong Answer' : '⏰ Time\'s Up!'}
                                    </h3>
                                    <p className="text-xl mb-2">
                                        It's <span className="font-bold text-green-400">
                                            {questionData.options.find(opt => opt.id === questionData.correctAnswer)?.name}
                                        </span>
                                    </p>
                                    <p className={`text-xl font-bold ${pointsEarned > 0 ? 'text-green-400' : pointsEarned < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {pointsEarned > 0 ? '+' : ''}{pointsEarned} points
                                    </p>
                                </div>

                                <div className="text-center text-gray-400">
                                    Next round in: <span className="text-white font-bold">{nextRoundTimer}s</span>
                                </div>
                            </div>
                        )}

                        {/* Desktop Layout - Side by Side */}
                        <div className="hidden lg:flex gap-8 items-start">
                            {/* Left Side - Photo */}
                            <div className={`flex-shrink-0 transition-all duration-500 ${showResults ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-300">
                                        Who is this little one?
                                    </h2>
                                    <div className="relative inline-block">
                                        <div className="w-[37.3rem] h-[21rem] rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
                                            <img
                                                src={questionData.photo}
                                                alt="Childhood photo"
                                                onLoad={handleImageLoad}
                                                className={
                                                    isPortrait
                                                        ? "object-contain h-[120%] m-auto"
                                                        : "object-cover w-full h-full"
                                                }
                                            />
                                        </div>
                                        {selectedOption && !showResults && (
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                Submitted!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Options */}
                            <div className="flex-1 min-w-0">
                                <div className="space-y-4">
                                    {questionData.options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(option.id)}
                                            disabled={selectedOption || showResults}
                                            className={`relative w-full p-5 rounded-lg border-2 text-left font-medium transition-all duration-300 ${selectedOption === option.id
                                                ? 'border-blue-500 bg-blue-600/20'
                                                : 'border-gray-700 hover:border-gray-500'
                                                } ${getOptionColor(option.id)} ${selectedOption || showResults ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl">{option.name}</span>
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
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>{option.votes} guesses</span>
                                                        <span>{getOptionPercentage(option.votes).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                                        <div
                                                            className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(option.id)}`}
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

                                {/* Waiting Message for Desktop */}
                                {selectedOption && !showResults && (
                                    <div className="mt-6 text-center p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                        <p className="text-blue-300">
                                            Answer submitted! Waiting for other players...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Layout - Stacked */}
                        <div className="lg:hidden">
                            {/* Photo Section - Mobile */}
                            <div className={`text-center mb-8 transition-all duration-500 ${showResults ? 'hidden' : 'block'}`}>
                                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-300">
                                    Who is this little one?
                                </h2>
                                <div className="relative inline-block">
                                    <div className="w-[21.1rem] h-[12rem] sm:w-64 sm:h-64 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
                                        <img
                                            src={questionData.photo}
                                            alt="Childhood photo"
                                            onLoad={handleImageLoad}
                                            className={
                                                isPortrait
                                                    ? "object-contain h-[120%] m-auto"
                                                    : "object-cover w-full h-full"
                                            }
                                        />
                                    </div>
                                    {selectedOption && !showResults && (
                                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Submitted!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options - Mobile */}
                            <div className="space-y-3 mb-6">
                                {questionData.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        disabled={selectedOption || showResults}
                                        className={`relative w-full p-4 rounded-lg border-2 text-left font-medium transition-all duration-300 ${selectedOption === option.id
                                            ? 'border-blue-500 bg-blue-600/20'
                                            : 'border-gray-700 hover:border-gray-500'
                                            } ${getOptionColor(option.id)} ${selectedOption || showResults ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
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

                                        {/* Results Bar - Mobile */}
                                        {showResults && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{option.votes} guesses</span>
                                                    <span>{getOptionPercentage(option.votes).toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-800 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(option.id)}`}
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

                            {/* Waiting Message - Mobile */}
                            {selectedOption && !showResults && (
                                <div className="text-center p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                    <p className="text-blue-300">
                                        Answer submitted! Waiting for other players...
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Match
