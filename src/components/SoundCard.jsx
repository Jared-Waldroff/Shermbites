import React from 'react'
import './SoundCard.css'
import { Play, CheckCircle } from 'lucide-react'

export default function SoundCard({ label, onClick, isPlaying, isDownloaded }) {
    return (
        <button className={`sound-card ${isPlaying ? 'playing' : ''}`} onClick={onClick}>
            <div className="sound-card-header">
                <Play className="sound-icon" size={24} fill={isPlaying ? "currentColor" : "none"} />
                {isDownloaded && <CheckCircle className="downloaded-icon" size={16} />}
            </div>
            <span className="sound-label">{label}</span>
        </button>
    )
}
