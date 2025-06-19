import React, { useState } from 'react'
import img1 from "../assets/images/img1.jpg"
import img2 from "../assets/images/img2.jpg"
import img3 from "../assets/images/img3.jpg"
import img4 from "../assets/images/img4.jpg"
import img5 from "../assets/images/img5.jpg"
import img6 from "../assets/images/img6.jpg"
import img7 from "../assets/images/img7.jpg"
import RulesModal from '../components/RulesModal'
import { SERVER_URL } from '../../constants.js'
import { useNavigate, useNavigation } from 'react-router'

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

function Landing() {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [showRulesModal, setShowRulesModal] = useState(false)
    const [showQuizNotReadyModal, setShowQuizNotReadyModal] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        adminPassword: ''
    })
    const childPhotos = [img1, img2, img3, img4, img5, img6, img7, img1, img2, img3]
    const navigate = useNavigate()
    // console.log(navigate)

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleCreateMatch = (e) => {
        e.preventDefault()
        if (formData.fullName.trim() && formData.adminPassword.trim()) {
            fetch(`${SERVER_URL}/api/room/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname: formData.fullName,
                    adminPassword: formData.adminPassword
                })
            })
            .then(res => {
                if (res.status === 200) {
                    setShowCreateModal(false)
                    navigate('/room')
                } else {
                    return res.text().then(text => { throw new Error(text) })
                }
            })
            .catch(err => {
                console.error('Error creating match:', err)
            })
        }
    }

    const handleJoinQuiz = (e) => {
        e.preventDefault()
        fetch(`${SERVER_URL}/api/room/status`).then(res => res.json())
        .then(data => {
            if (data.roomCreated) {
                setShowJoinModal(true)
            } else {
                setShowQuizNotReadyModal(true)
            }
        })
        .catch(err => {
            console.error('Error checking room status:', err)
            setShowQuizNotReadyModal(true)
        })
    }

    const handleJoinQuizSubmit = (e) => {
        e.preventDefault()
        if (formData.fullName.trim()) {
            navigate('/room', {
                state: {
                    fullname: formData.fullName
                }
            })
        }
    }

    const handleRetryQuizStatus = () => {
        setShowQuizNotReadyModal(false)
        handleJoinQuiz({ preventDefault: () => {} })
    }

    const closeModals = () => {
        setShowCreateModal(false)
        setShowJoinModal(false)
        setShowRulesModal(false)
        setShowQuizNotReadyModal(false)
        setFormData({ fullName: '', adminPassword: '' })
    }


    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-900">
            {/* Background with grid of childhood photos */}
            <div className="absolute inset-0">
                {/* Grid container with responsive columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2 md:gap-3 h-full w-full overflow-hidden p-2">
                    {[...Array(30)].map((_, index) => (
                        <div
                            key={index}
                            className="relative"
                        >
                            <img
                                src={childPhotos[index % childPhotos.length]}
                                alt="Childhood memory"
                                className="w-full h-full object-cover rounded-md opacity-70"
                                loading="lazy"
                                style={{
                                    aspectRatio: '3/2',
                                    minHeight: '60px'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Dark blur overlay with gradient */}
                <div className="absolute inset-0 backdrop-blur-[4px] bg-gradient-to-br from-[#0f0f0f]/80 via-[#1a1a1a]/85 to-black/90"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Title */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                            Guess Who? — The Farewell Challenge
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-2xl text-gray-300 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
                        Can you still recognize your batchmates from their childhood photos?
                    </p>

                    {/* Rules Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => setShowRulesModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-black rounded-lg cursor-pointer font-semibold transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20 hover:border-opacity-30"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Game Rules
                        </button>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
                        >
                            Create Match
                        </button>
                        <button
                            onClick={handleJoinQuiz}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
                        >
                            Join Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Match Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeModals}
                title="Create Match"
            >
                <form onSubmit={handleCreateMatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Admin Password *
                        </label>
                        <input
                            type="password"
                            name="adminPassword"
                            value={formData.adminPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="Set admin password"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModals}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Create Match
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Join Quiz Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={closeModals}
                title="Join Quiz"
            >
                <form onSubmit={handleJoinQuizSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModals}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Join Quiz
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Quiz Not Ready Modal */}
            <Modal
                isOpen={showQuizNotReadyModal}
                onClose={closeModals}
                title="Quiz Not Available"
            >
                <div className="text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                        <div className="text-3xl animate-pulse">⏳</div>
                    </div>
                    
                    {/* Main Message */}
                    <h3 className="text-xl font-bold text-white mb-3">
                        Quiz Not Created Yet
                    </h3>
                    
                    {/* Description */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            The quiz has not been created yet. Please wait for an admin to set up the quiz or contact them to get started.
                        </p>
                    </div>

                    {/* Loading indicator */}
                    <div className="flex justify-center mb-6">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleRetryQuizStatus}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                        >
                            🔄 Check Again
                        </button>
                        <button
                            onClick={closeModals}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                        >
                            ❌ Close
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 mt-4">
                        Contact the quiz administrator if this issue persists
                    </p>
                </div>
            </Modal>

            {/* Rules Modal */}
            <RulesModal closeModals={closeModals} showRulesModal={showRulesModal} />
        </div>
    )
}

export default Landing