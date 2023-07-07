const maxDataLength = 10

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
                db.createObjectStore(storeName, {keyPath: "surl"})
            }
        };
    });
}

export const readLatestData = (db: IDBDatabase, storeName: string): Promise<any> => {
    return new Promise((resolve) => {
        const list:any[] = []
        const objectStore = db.transaction(storeName).objectStore(storeName)
        objectStore.openCursor().onsuccess = (event) => {
            // @ts-ignore
            const cursor = event.target.result;
            if (cursor && list.length < maxDataLength) {
                list.push(cursor.value);
                cursor.continue();
            } else {
                resolve(list)
            }
        }
    })

}

export const updateData = (db: IDBDatabase, storeName: string, data: any): Promise<Event> => {
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


