import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Upload } from 'lucide-react'
import './UploadModal.css'

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [label, setLabel] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || !label) {
            setError('Please provide both a label and a file.')
            return
        }

        setUploading(true)
        setError(null)

        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('audio-clips')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Insert record into DB
            const { error: dbError } = await supabase
                .from('clips')
                .insert([{ label, filename: fileName }])

            if (dbError) throw dbError

            // Success
            setLabel('')
            setFile(null)
            onUploadSuccess()
            onClose()
        } catch (err) {
            console.error('Upload failed:', err)
            setError(err.message || 'An error occurred during upload.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="modal-title">Add New Shermbite</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Label</label>
                        <input
                            type="text"
                            className="form-input"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Wow"
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Audio File</label>
                        <input
                            type="file"
                            className="form-input"
                            accept="audio/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {error && <div style={{ color: '#ef233c', marginBottom: '1rem' }}>{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload Clip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
