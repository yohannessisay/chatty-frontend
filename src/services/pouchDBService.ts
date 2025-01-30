/* eslint-disable @typescript-eslint/no-explicit-any */
import PouchDB from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import { deleteData, getData, postData } from "./apiService";
import { decryptMessage, encryptMessage } from "./encrypt";

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

export const handleInitialChatLists = async (chatPartners: any) => {
  if (chatPartners.length > 0) {
    const promises = chatPartners.map((chatPartner: any) =>
      getDatabase(chatPartner.id)
    );
    await Promise.all(promises);
  }
};

export const saveMyMessage = async (
  chatPartner: string,
  messageData: Message,
  publicKey: string
): Promise<string | boolean> => {
  const db = getDatabase(chatPartner);

  try {
    const convertedMessage = await encryptMessage(
      messageData.content,
      publicKey
    );
    await db.post({
      ...messageData,
      content: convertedMessage,
    });
    return convertedMessage;
  } catch (error) {
    console.error("Failed to save message:", error);
    return false;
  }
};

export const saveIncomingMessage = async (
  chatPartner: string,
  messageData: Message
): Promise<boolean> => {
  const db = getDatabase(chatPartner);

  try {
    await db.post({
      ...messageData,
    });
    return true;
  } catch (error) {
    console.error("Failed to save message:", error);
    return false;
  }
};

export const saveMissedMessage = async (
  chatPartner: string,
  messageData: Message,
  id: string
): Promise<boolean> => {
  const db = getDatabase(chatPartner);

  try {
    await db.post({
      ...messageData,
      content: messageData,
    });
    const response = await deleteData(`messages/updateMessageStatus/${id}`);
    if (response.ok) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to save message:", error);
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
          return docA.sentTimeStamp?.localeCompare(docB.sentTimeStamp);
        }
        return 0;
      })
      .map((row) => row.doc as unknown as Message);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
};
export const getPublicKey = async (
  chatPartner: string
): Promise<any | null> => {
  const db = getDatabase(chatPartner);
  try {
    const result = (await db.find({ selector: { type: "keyPair" } })) as any;
    if (result.docs.length > 0) {
      return {
        privateKey: result.docs[0].privateKey,
        publicKey: result.docs[0].publicKey,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch public key:", error);
  }
  return null;
};
export const fetchPublicKeyFromBackend = async (chatPartnerId: string) => {
  try {
    const response = await getData(`user/getPublicKeys/${chatPartnerId}`);
    if (response.ok) {
      const { publicKey } = await response.json();
      return publicKey;
    }
  } catch (error) {
    console.error("Failed to fetch public key from backend:", error);
  }
  return null;
};
export const addPublicKeyToBackend = async (
  senderId: string,
  chatPartnerId: string,
  publicKey: string
) => {
  try {
    const response = await postData(`user/connect`, {
      senderId: senderId,
      recipientId: chatPartnerId,
      publicKey: publicKey,
    });
    if (response.ok) {
      const { publicKey } = await response.json();
      return publicKey;
    }
  } catch (error) {
    console.error("Failed to fetch public key from backend:", error);
  }
  return null;
};
export const closeDatabase = (chatPartner: string): void => {
  if (dbCache[chatPartner]) {
    dbCache[chatPartner].close();
    delete dbCache[chatPartner];
  }
};
export const savePublicKey = async (
  chatPartner: string,
  publicKey: string,
  senderId: string,
  privateKey: string = ""
) => {
  const db = getDatabase(chatPartner);
  try {
    const documentId = "keyPair";

    const result = await db.find({ selector: { type: "keyPair" } });

    if (result?.docs?.length > 0) {
      const deletePromises = result.docs.map((doc) =>
        db.remove(doc._id, doc._rev)
      );
      await Promise.all(deletePromises);
    }

    await db.put({
      _id: documentId,
      publicKey,
      privateKey,
      type: "keyPair",
    });
    addPublicKeyToBackend(senderId, chatPartner, publicKey);
  } catch (error) {
    console.error("Failed to save key pair:", error);
  }
};

export const getDecryptedMessages = async (
  chatPartner: string
): Promise<Message[]> => {
  try {
    const keyPair = await getPublicKey(chatPartner);
    if (!keyPair || !keyPair.privateKey) {
      throw new Error("Private key not found");
    }

    const messages = await getMessages(chatPartner);

    const decryptedMessages = [];

    for (const message of messages) {
      if (message.content) {
        const decryptedContent = await decryptMessage(
          message.content,
          keyPair.privateKey
        );
        decryptedMessages.push({ ...message, content: decryptedContent });
      }
    }
    return decryptedMessages as Message[];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.error("Failed to decrypt messages:", error);
    return [];
  }
};

export const getDecryptedMessage = async (
  chatPartner: string,
  message: string
): Promise<string> => {

  
  try {
    const keyPair = await getPublicKey(chatPartner);
    if (!keyPair || !keyPair.privateKey) {
      throw new Error("Private key not found");
    }
    console.log(chatPartner,keyPair);
    const decryptedContent = await decryptMessage(message, keyPair.privateKey);
    return decryptedContent;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("Failed to decrypt messages:", error);
    return "ERROR DECRYPTING MESSAGE";
  }
};
