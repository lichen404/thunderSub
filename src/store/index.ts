const maxDataLength = 30

export const handleOpenDB = (databaseName: string, storeName: string, version = 1): Promise<any> => {
    return new Promise((resolve, reject) => {
        let db;
        const indexedDB = window.indexedDB
        const request = indexedDB.open(databaseName, version);
        request.onsuccess = () => {
            db = request.result // 数据库对象
            resolve(db);
        };

        request.onerror = (e) => {
            reject(e)
        };

        request.onupgradeneeded = () => {
            db = request.result

            if (!db.objectStoreNames.contains(storeName)) {
                const objectStore = db.createObjectStore(storeName, {keyPath: "url"});
                objectStore.createIndex("name", "name", {unique: false});
                objectStore.createIndex("path", "path", {unique: false});
                objectStore.createIndex("date", "date", {unique: false});
            }
        };
    });
}

export const readLatestData = (db: IDBDatabase, storeName: string): any[] => {
    const list = []
    const objectStore = db.transaction(storeName).objectStore(storeName)
    const {result: cursor} = objectStore.openCursor()
    let i = 0
    if (cursor && i < maxDataLength) {
        list.push(cursor.value)
        i++
    }
    return list
}

export const updateData = (db: IDBDatabase, storeName: string, data: any):Promise<Event> => {
    return new Promise((resolve, reject) => {
        const request = db.transaction([storeName], "readwrite").objectStore(storeName).put(data)
        request.onsuccess = (e) => {
            resolve(e)
        }
        request.onerror = (e) => {
            reject(e)
        }
    })
}

export const addData = (db: IDBDatabase, storeName: string, data: any): Promise<Event> => {
    return new Promise((resolve, reject) => {
        const request = db.transaction([storeName], "readwrite").objectStore(storeName).add(data)
        request.onsuccess = (e) => {
            resolve(e)
        }
        request.onerror = (e) => {
            reject(e)
        }
    })
}


