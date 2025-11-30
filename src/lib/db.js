const DB_NAME = 'ShermBitesDB'
const DB_VERSION = 1
const STORE_NAME = 'clips'

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error)
            reject(event.target.error)
        }

        request.onsuccess = (event) => {
            resolve(event.target.result)
        }

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            }
        }
    })
}

export const saveClip = async (id, blob) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put({ id, blob, timestamp: Date.now() })

        request.onsuccess = () => resolve()
        request.onerror = (e) => reject(e.target.error)
    })
}

export const getClip = async (id) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result ? request.result.blob : null)
        request.onerror = (e) => reject(e.target.error)
    })
}

export const isClipDownloaded = async (id) => {
    const clip = await getClip(id)
    return !!clip
}
