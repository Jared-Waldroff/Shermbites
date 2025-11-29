import React from 'react'
import { Shuffle } from 'lucide-react'
import './RandomButton.css'

export default function RandomButton({ onPlayRandom, disabled }) {
    return (
        <button
            className="random-btn"
            onClick={onPlayRandom}
            disabled={disabled}
            title="Play Random Clip"
        >
            <Shuffle size={24} />
            <span>Random Bite</span>
        </button>
    )
}
