import React, { useState } from 'react'
import { Zap } from 'lucide-react'
import './BlastButton.css'

export default function BlastButton({ onBlast, disabled }) {
    const [isShaking, setIsShaking] = useState(false)

    const handleClick = () => {
        if (disabled) return
        setIsShaking(true)
        onBlast()
        setTimeout(() => setIsShaking(false), 500)
    }

    return (
        <button
            className={`blast-btn ${isShaking ? 'shake' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            title="BLAST! (Warning: Loud)"
        >
            <Zap size={24} fill="currentColor" />
            <span>BLAST!</span>
        </button>
    )
}
