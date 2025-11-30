import React from 'react'
import './WhiteMonsterButton.css'
import whiteMonsterImg from '../assets/white_monster.png'

export default function WhiteMonsterButton({ onBlast, disabled }) {
    return (
        <button
            className="white-monster-btn"
            onClick={onBlast}
            disabled={disabled}
            title="WHITE MONSTER! (Warning: Loud)"
        >
            <img src={whiteMonsterImg} alt="White Monster" className="monster-img" />
            <span>WHITE MONSTER</span>
        </button>
    )
}
