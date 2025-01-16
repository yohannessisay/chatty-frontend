import PouchDB from "pouchdb";

export interface Message {
  content: string;
  senderId: string;
  senderUserName: string;
  sentTimeStamp: string;
  readTimeStamp?: string;
  roomId: string;
  recipientId: string;
}

class PouchDBService {
  private db: PouchDB.Database;

  constructor(chatPartner: string) {
    this.db = new PouchDB(chatPartner);
  }

  public async saveMessage(messageData: Message): Promise<boolean> {
    try {
      const response = await this.db.post(messageData);
      return response.ok;
    } catch (error) {
      console.error("Failed to save message:", error);
      return false;
    }
  }

  public async getMessages(): Promise<Message[]> {
    try {
      const result = await this.db.allDocs({ include_docs: true });
      return result.rows
        .map((row) => (row.doc ? (row.doc as unknown as Message) : null))
        .filter((doc): doc is Message => doc !== null);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return [];
    }
  }
}

export default PouchDBService;
