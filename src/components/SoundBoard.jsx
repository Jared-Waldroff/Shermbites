import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SoundCard from './SoundCard'
import './SoundBoard.css'

export default function SoundBoard() {
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingId, setPlayingId] = useState(null)

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
            // Fallback for demo if no DB connection yet
            if (err.message.includes('env') || err.message.includes('fetch')) {
                // Optional: Load mock data here if desired, but for now just show error
            }
        } finally {
            setLoading(false)
        }
    }

    const playSound = (clip) => {
        if (!clip.filename) return

        // Construct public URL for the audio file
        // Assuming bucket is 'audio-clips'
        const { data } = supabase.storage.from('audio-clips').getPublicUrl(clip.filename)

        if (data?.publicUrl) {
            const audio = new Audio(data.publicUrl)
            setPlayingId(clip.id)
            audio.play().catch(e => console.error("Audio play error:", e))
            audio.onended = () => setPlayingId(null)
        }
    }

    if (loading) return <div className="loading-state">Loading Sherm bites...</div>
    if (error) return <div className="error-state">Error: {error}. Make sure you've set up Supabase!</div>
    if (clips.length === 0) return <div className="empty-state">No clips found. Add some to the database!</div>

    return (
        <div className="sound-board-container">
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
        </div>
    )
}
