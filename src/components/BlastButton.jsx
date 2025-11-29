import React from 'react'
import { Zap } from 'lucide-react'
import './BlastButton.css'

export default function BlastButton({ onBlast, disabled }) {
    return (
        <button
            className="blast-btn"
            onClick={onBlast}
            disabled={disabled}
            title="BLAST! (Warning: Loud)"
        >
            <Zap size={24} fill="currentColor" />
            <span>BLAST!</span>
        </button>
    )
}
