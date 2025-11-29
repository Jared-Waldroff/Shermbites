import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SoundCard from './SoundCard'
import UploadModal from './UploadModal'
import RandomButton from './RandomButton'
import BlastButton from './BlastButton'
import { Plus, Download } from 'lucide-react'
import './SoundBoard.css'

export default function SoundBoard() {
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingId, setPlayingId] = useState(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    useEffect(() => {
        console.log('SoundBoard mounted')
        fetchClips()
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
        } catch (err) {
            console.error('Error fetching clips:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const playSound = (clip) => {
        if (!clip.filename) return

        const { data } = supabase.storage.from('audio-clips').getPublicUrl(clip.filename)

        if (data?.publicUrl) {
            const audio = new Audio(data.publicUrl)
            setPlayingId(clip.id)
            audio.play().catch(e => console.error("Audio play error:", e))
            audio.onended = () => setPlayingId(null)
        }
    }

    const playRandom = () => {
        if (clips.length === 0) return
        const randomClip = clips[Math.floor(Math.random() * clips.length)]
        playSound(randomClip)
    }

    const playBlast = async () => {
        if (clips.length === 0) return
        const randomClip = clips[Math.floor(Math.random() * clips.length)]

        if (!randomClip.filename) return

        const { data } = supabase.storage.from('audio-clips').getPublicUrl(randomClip.filename)

        if (data?.publicUrl) {
            try {
                const response = await fetch(data.publicUrl)
                const arrayBuffer = await response.arrayBuffer()
                const audioContext = new (window.AudioContext || window.webkitAudioContext)()
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

                const source = audioContext.createBufferSource()
                source.buffer = audioBuffer

                // Create Distortion
                const distortion = audioContext.createWaveShaper()
                distortion.curve = makeDistortionCurve(200) // Reduced distortion
                distortion.oversample = '4x'

                // Create Gain (Volume)
                const gainNode = audioContext.createGain()
                gainNode.gain.value = 0.5

                // Connect chain: Source -> Distortion -> Gain -> Destination
                source.connect(distortion)
                distortion.connect(gainNode)
                gainNode.connect(audioContext.destination)

                setPlayingId(randomClip.id)
                source.start()
                source.onended = () => setPlayingId(null)

            } catch (e) {
                console.error("Blast error:", e)
            }
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

    const handleDownloadAll = async () => {
        if (clips.length === 0) return
        const confirmDownload = window.confirm(`Download ${clips.length} clips for offline use?`)
        if (!confirmDownload) return

        let downloadedCount = 0
        for (const clip of clips) {
            if (!clip.filename) continue
            const { data } = supabase.storage.from('audio-clips').getPublicUrl(clip.filename)
            if (data?.publicUrl) {
                try {
                    await fetch(data.publicUrl) // Browser cache will store this
                    downloadedCount++
                } catch (e) {
                    console.error(`Failed to cache ${clip.label}`, e)
                }
            }
        }
        alert(`Downloaded ${downloadedCount} clips! You can now go offline.`)
    }

    if (loading) return <div className="loading-state">Loading Sherm bites...</div>
    if (error) return <div className="error-state">Error: {error}. Make sure you've set up Supabase!</div>

    return (
        <div className="sound-board-container">
            <div className="controls-bar">
                <RandomButton onPlayRandom={playRandom} disabled={clips.length === 0} />
                <BlastButton onBlast={playBlast} disabled={clips.length === 0} />
                <button className="upload-btn" onClick={() => setIsUploadModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Clip</span>
                </button>
                <button className="upload-btn" onClick={handleDownloadAll} disabled={clips.length === 0} style={{ background: 'var(--surface-color)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Download size={20} />
                    <span>Download All</span>
                </button>
            </div>

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
