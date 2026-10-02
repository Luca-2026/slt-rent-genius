/** Local, per-device drafts. IndexedDB keeps File blobs intact across camera/browser restarts. */
export interface ProtocolDraft<T> { value: T; updatedAt: number }
const DB = "slt-protocol-drafts";
const STORE = "drafts";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason: unknown) => void) => void): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let value: T;
    tx.oncomplete = () => { db.close(); resolve(value); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
    run(tx.objectStore(STORE), (result) => { value = result; }, reject);
  });
}

export function readProtocolDraft<T>(key: string): Promise<ProtocolDraft<T> | undefined> {
  return transaction("readonly", (store, resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as ProtocolDraft<T> | undefined);
    request.onerror = () => reject(request.error);
  });
}

export function writeProtocolDraft<T>(key: string, value: T): Promise<void> {
  return transaction("readwrite", (store) => { store.put({ value, updatedAt: Date.now() }, key); });
}

export function deleteProtocolDraft(key: string): Promise<void> {
  return transaction("readwrite", (store) => { store.delete(key); });
}