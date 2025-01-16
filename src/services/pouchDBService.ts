import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

export interface Message {
  content: string;
  senderId: string;
  senderUserName: string;
  sentTimeStamp: string;
  readTimeStamp?: string;
  roomId: string;
  recipientId: string;
}

const dbCache: { [key: string]: PouchDB.Database } = {};

const getDatabase = (chatPartner: string): PouchDB.Database => {
  if (!dbCache[chatPartner]) {
    dbCache[chatPartner] = new PouchDB(chatPartner);
  }
  return dbCache[chatPartner];
};

export const saveMessage = async (chatPartner: string, messageData: Message): Promise<boolean> => {
  const db = getDatabase(chatPartner);
  try {
    const response = await db.post(messageData);
    return response.ok;
  } catch (error) {
    console.error('Failed to save message:', error);
    return false;
  }
};

export const getMessages = async (chatPartner: string): Promise<Message[]> => {
  const db = getDatabase(chatPartner);
  try {
    const result = await db.allDocs({ include_docs: true });
    return result.rows
      .filter((row) => row.doc)
      .sort((a, b) => {
        const docA = a.doc as Message | undefined;
        const docB = b.doc as Message | undefined;
        if (docA && docB) {
          return docA.sentTimeStamp.localeCompare(docB.sentTimeStamp);
        }
        return 0;
      })
      .map((row) => row.doc as unknown as Message);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
};

export const closeDatabase = (chatPartner: string): void => {
  if (dbCache[chatPartner]) {
    dbCache[chatPartner].close();
    delete dbCache[chatPartner];
  }
};
