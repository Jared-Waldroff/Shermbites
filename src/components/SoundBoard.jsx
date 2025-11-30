import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { saveClip, getClip, isClipDownloaded } from '../lib/db'
import SoundCard from './SoundCard'
import UploadModal from './UploadModal'
import RandomButton from './RandomButton'
import WhiteMonsterButton from './WhiteMonsterButton'
import DownloadProgress from './DownloadProgress'
import { Plus, Download, XCircle } from 'lucide-react'
import './SoundBoard.css'

export default function SoundBoard() {
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingId, setPlayingId] = useState(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [downloadedClips, setDownloadedClips] = useState({})
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadStats, setDownloadStats] = useState({ current: 0, total: 0 })
    const [showAggressivePopup, setShowAggressivePopup] = useState(false)

    const currentAudioRef = useRef(null)

    useEffect(() => {
        console.log('SoundBoard mounted')
        fetchClips()

        return () => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause()
                currentAudioRef.current = null
            }
        }
    }, [])

    async function fetchClips() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('clips')
                .select('*')
                .order('label', { ascending: true })

            if (error) throw error
            setClips(data || [])

            // Check download status for all clips
            checkDownloadStatus(data || [])

            // Auto-download missing clips
            downloadMissingClips(data || [])

        } catch (err) {
            console.error('Error fetching clips:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function checkDownloadStatus(clipsToCheck) {
        const status = {}
        for (const clip of clipsToCheck) {
            status[clip.id] = await isClipDownloaded(clip.id)
        }
        setDownloadedClips(status)
    }

    async function downloadMissingClips(allClips) {
        const missingClips = []
        for (const clip of allClips) {
            const downloaded = await isClipDownloaded(clip.id)
            if (!downloaded && clip.filename) {
                missingClips.push(clip)
            }
        }

        if (missingClips.length === 0) return

        setIsDownloading(true)
        setDownloadStats({ current: 0, total: missingClips.length })

        let downloadedCount = 0
        for (let i = 0; i < missingClips.length; i++) {
            const clip = missingClips[i]
            try {
                const { data } = supabase.storage.from('audio-clips').getPublicUrl(clip.filename)
                if (data?.publicUrl) {
                    const response = await fetch(data.publicUrl)
                    const blob = await response.blob()
                    await saveClip(clip.id, blob)

                    setDownloadedClips(prev => ({ ...prev, [clip.id]: true }))
                    downloadedCount++
                }
            } catch (e) {
                console.error(`Failed to download ${clip.label}`, e)
            }

            setDownloadStats(prev => ({ ...prev, current: downloadedCount }))
            setDownloadProgress(Math.round(((i + 1) / missingClips.length) * 100))
        }

        setIsDownloading(false)
    }

    const playSound = async (clip) => {
        if (!clip.filename) return

        // Audio Locking Mechanism
        if (playingId !== null) {
            setShowAggressivePopup(true)
            setTimeout(() => setShowAggressivePopup(false), 2000)
            return
        }

        try {
            let audioSrc
            const blob = await getClip(clip.id)

            if (blob) {
                audioSrc = URL.createObjectURL(blob)
            } else {
                const { data } = supabase.storage.from('audio-clips').getPublicUrl(clip.filename)
                audioSrc = data?.publicUrl
            }

            if (audioSrc) {
                const audio = new Audio(audioSrc)
                currentAudioRef.current = audio
                setPlayingId(clip.id)

                audio.play().catch(e => {
                    console.error("Audio play error:", e)
                    setPlayingId(null)
                    currentAudioRef.current = null
                })

                audio.onended = () => {
                    setPlayingId(null)
                    currentAudioRef.current = null
                    if (blob) URL.revokeObjectURL(audioSrc)
                }
            }
        } catch (e) {
            console.error("Play error:", e)
            setPlayingId(null)
        }
    }

    const playRandom = () => {
        if (clips.length === 0) return
        const randomClip = clips[Math.floor(Math.random() * clips.length)]
        playSound(randomClip)
    }

    const playBlast = async () => {
        if (clips.length === 0) return

        // Audio Locking for Blast too
        if (playingId !== null) {
            setShowAggressivePopup(true)
            setTimeout(() => setShowAggressivePopup(false), 2000)
            return
        }

        const randomClip = clips[Math.floor(Math.random() * clips.length)]

        if (!randomClip.filename) return

        try {
            let arrayBuffer
            const blob = await getClip(randomClip.id)

            if (blob) {
                arrayBuffer = await blob.arrayBuffer()
            } else {
                const { data } = supabase.storage.from('audio-clips').getPublicUrl(randomClip.filename)
                if (data?.publicUrl) {
                    const response = await fetch(data.publicUrl)
                    arrayBuffer = await response.arrayBuffer()
                }
            }

            if (arrayBuffer) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)()
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

                const source = audioContext.createBufferSource()
                source.buffer = audioBuffer

                // Create Distortion
                const distortion = audioContext.createWaveShaper()
                distortion.curve = makeDistortionCurve(400) // Increased distortion for WHITE MONSTER
                distortion.oversample = '4x'

                // Create Gain (Volume)
                const gainNode = audioContext.createGain()
                gainNode.gain.value = 0.8 // Louder

                // Connect chain: Source -> Distortion -> Gain -> Destination
                source.connect(distortion)
                distortion.connect(gainNode)
                gainNode.connect(audioContext.destination)

                setPlayingId(randomClip.id) // Lock UI
                source.start()

                source.onended = () => {
                    setPlayingId(null)
                    audioContext.close()
                }
            }

        } catch (e) {
            console.error("Blast error:", e)
            setPlayingId(null)
        }
    }

    // Helper for distortion curve
    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50
        const n_samples = 44100
        const curve = new Float32Array(n_samples)
        const deg = Math.PI / 180

        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x))
        }
        return curve
    }

    const handleDownloadAll = () => {
        downloadMissingClips(clips)
    }

    if (loading && clips.length === 0) return <div className="loading-state">Loading Sherm bites...</div>
    if (error) return <div className="error-state">Error: {error}. Make sure you've set up Supabase!</div>

    return (
        <div className="sound-board-container">
            {showAggressivePopup && (
                <div className="aggressive-popup-overlay">
                    <div className="aggressive-popup">
                        <XCircle size={48} color="#ff0000" />
                        <h2>SLOW THE FUCK DOWN</h2>
                    </div>
                </div>
            )}

            <div className="controls-bar">
                <RandomButton onPlayRandom={playRandom} disabled={clips.length === 0} />
                <WhiteMonsterButton onBlast={playBlast} disabled={clips.length === 0} />
                <button className="upload-btn" onClick={() => setIsUploadModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Clip</span>
                </button>
                <button className="upload-btn" onClick={handleDownloadAll} disabled={isDownloading || clips.length === 0} style={{ background: 'var(--surface-color)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Download size={20} />
                    <span>{isDownloading ? 'Downloading...' : 'Download All'}</span>
                </button>
            </div>

            {isDownloading && (
                <DownloadProgress
                    progress={downloadProgress}
                    current={downloadStats.current}
                    total={downloadStats.total}
                />
            )}

            {clips.length === 0 ? (
                <div className="empty-state">No clips found. Add some to the database!</div>
            ) : (
                <div className="sound-grid">
                    {clips.map(clip => (
                        <SoundCard
                            key={clip.id}
                            label={clip.label}
                            onClick={() => playSound(clip)}
                            isPlaying={playingId === clip.id}
                            isDownloaded={downloadedClips[clip.id]}
                        />
                    ))}
                </div>
            )}

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={fetchClips}
            />
        </div>
    )
}
