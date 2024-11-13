import { openDB, IDBPDatabase } from 'idb';

interface Message {
  message: string;
  senderId: string;
  senderUserName:string;
  sentTimeStamp: number;
  readTimeStamp?: number;
}



let db: IDBPDatabase | null = null;

async function initDB(): Promise<void> {
  if (!db) {
    db = await openDB('ChatDB', 1, {
      upgrade() {
      },
    });
  }
}
async function createChatStoreIfNeeded(chatPartner: string): Promise<void> {
  if (!db) await initDB();
  
  if (db && !db.objectStoreNames.contains(chatPartner)) { 
    db.close();
    db = await openDB('ChatDB', db.version + 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(chatPartner)) {
          database.createObjectStore(chatPartner, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
}

export async function saveMessage(chatPartner: string, messageData: Message): Promise<boolean> {
  await createChatStoreIfNeeded(chatPartner);
  if (db) {
    const tx = db.transaction(chatPartner, 'readwrite');
    await tx.objectStore(chatPartner).add(messageData);
    await tx.done;
    return true;
  }
  return false;
}
 
export async function getMessages(): Promise<Message[]> {
  await initDB();
  if (db) {
    return await db.getAll('messages');
  }
  return [];
}
