import React from 'react'
import './DownloadProgress.css'

export default function DownloadProgress({ progress, total, current }) {
    return (
        <div className="download-progress-container">
            <div className="download-info">
                <span>Downloading clips...</span>
                <span>{current} / {total}</span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
