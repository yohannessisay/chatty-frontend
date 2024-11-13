export const encryptData = async (data: string): Promise<string> => {
  const response = await fetch("/public-key.pem");
  if (!response.ok) {
    throw new Error("Failed to fetch public key");
  }

  const publicKeyText = await response.text();

  const binaryDerString = window.atob(
    publicKeyText.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, "")
  );
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(data)
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};
