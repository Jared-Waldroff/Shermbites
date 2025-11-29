import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SoundCard from './SoundCard'
import UploadModal from './UploadModal'
import RandomButton from './RandomButton'
import { Plus } from 'lucide-react'
import './SoundBoard.css'

export default function SoundBoard() {
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingId, setPlayingId] = useState(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    useEffect(() => {
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

    if (loading) return <div className="loading-state">Loading Sherm bites...</div>
    if (error) return <div className="error-state">Error: {error}. Make sure you've set up Supabase!</div>

    return (
        <div className="sound-board-container">
            <div className="controls-bar">
                <RandomButton onPlayRandom={playRandom} disabled={clips.length === 0} />
                <button className="upload-btn" onClick={() => setIsUploadModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Clip</span>
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
