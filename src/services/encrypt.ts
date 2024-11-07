import forge from "node-forge";


export const encryptData = async (data: string): Promise<string> => {
  const response = await fetch("/public-key.pem");
  if (!response.ok) {
    throw new Error("Failed to fetch public key");
  }

  const publicKeyText = await response.text();
  const publicKey = forge.pki.publicKeyFromPem(publicKeyText);

  const encrypted = publicKey.encrypt(data, "RSA-OAEP");

  return forge.util.encode64(encrypted);
};

