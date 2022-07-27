export const handleOpenDB = (databaseName:string, storeName:string, version = 1):Promise<any> =>{
    return new Promise((resolve, reject) => {
        let db;
        const indexedDB = window.indexedDB
        const request = indexedDB.open(databaseName, version);
        request.onsuccess = ()=> {
            db = request.result // 数据库对象
            resolve(db);
        };

        request.onerror = (e)=> {
           reject(e)
        };

        request.onupgradeneeded = ()=> {
            db = request.result

            if (!db.objectStoreNames.contains(storeName)) {
                const objectStore = db.createObjectStore(storeName, { keyPath: "id" });
                objectStore.createIndex("workerId", "workerId", { unique: false });
                objectStore.createIndex("building", "building", { unique: false });
                objectStore.createIndex("equipment", "equipment", { unique: false });
                objectStore.createIndex("jobType", "jobType", { unique: false });
                objectStore.createIndex("detail", "detail", { unique: false });
                objectStore.createIndex("startDate", "startDate", { unique: false });
                objectStore.createIndex("endDate", "endDate", { unique: false });
            }
        };
    });
}