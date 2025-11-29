import React from 'react'
import './SoundCard.css'
import { Play } from 'lucide-react'

export default function SoundCard({ label, onClick, isPlaying }) {
    return (
        <button className={`sound-card ${isPlaying ? 'playing' : ''}`} onClick={onClick}>
            <Play className="sound-icon" size={24} fill={isPlaying ? "currentColor" : "none"} />
            <span className="sound-label">{label}</span>
        </button>
    )
}
