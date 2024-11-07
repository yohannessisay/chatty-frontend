import { openDB, IDBPDatabase } from 'idb';

interface Message {
  message: string;
  senderId: string;
  sentTimeStamp: number;
  readTimeStamp?: number;
}



let db: IDBPDatabase | null = null;

async function initDB() {
  if (!db) {
    db = await openDB('ChatDB', 1, {
      upgrade(database) {
        // Create an object store for messages with auto-incrementing key
        if (!database.objectStoreNames.contains('messages')) {
          database.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
}

// Save a message to IndexedDB
export async function saveMessage(messageData: Message): Promise<void> {
  await initDB(); // Ensure database is initialized
  if (db) {
    await db.add('messages', messageData);
  }
}

// Fetch all messages from IndexedDB (optional helper function)
export async function getMessages(): Promise<Message[]> {
  await initDB();
  if (db) {
    return await db.getAll('messages');
  }
  return [];
}
