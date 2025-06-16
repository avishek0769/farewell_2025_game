import React from 'react'
import { Modal } from '../screens/Landing'

function RulesModal({showRulesModal, closeModals}) {

    return (
        <Modal
            isOpen={showRulesModal}
            onClose={closeModals}
            title="Game Rules"
        >
            <div
                className="space-y-4 text-gray-300 max-h-[60vh] overflow-y-auto pr-1"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#374151 transparent'
                }}
            >
                <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">How to Play:</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Each round shows a childhood photo of a batchmate.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Everyone will guess who it is at the same time, in real-time.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Each round gives you 5 options — pick one before the timer runs out.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Once the timer ends or all have answered, the correct person is revealed.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>The faster you answer correctly, the more you score!</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>There are 10–15 rounds in total. Get ready!</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Scoring:</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Correct answer: Points equal to the seconds remaining (max 60).</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Wrong answer: -10 points penalty.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>No extra points for waiting — be fast, be right.</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2 text-white">Winning:</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Scores are updated after every round.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Final leaderboard will reveal who knows the batch best.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-3 mt-1">•</span>
                            <span>Top 3 get a fun shoutout at the end!</span>
                        </li>
                    </ul>
                </div>
                <div className="pt-4">
                    <button
                        onClick={closeModals}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default RulesModal