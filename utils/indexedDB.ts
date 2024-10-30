const DB_NAME = 'RecipeFrenCache'
const STORE_NAME = 'imageCache'
const DB_VERSION = 1

export interface CachedImage {
  url: string
  base64: string
  timestamp: number
}

export class ImageCache {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' })
          store.createIndex('timestamp', 'timestamp')
        }
      }
    })
  }

  async set(url: string, base64: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const request = store.put({
        url,
        base64,
        timestamp: Date.now()
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async get(url: string): Promise<string | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(url)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result as CachedImage | undefined
        resolve(result?.base64 ?? null)
      }
    })
  }

  async cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      const cutoff = Date.now() - maxAgeMs

      const request = index.openCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          if (cursor.value.timestamp < cutoff) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }
}

export const imageCache = new ImageCache() 