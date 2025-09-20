import { Buffer } from 'buffer';

// Generate a secure encryption key
async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await generateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData
    );

    // Export the key
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    
    // Combine IV, key, and encrypted data
    const combined = new Uint8Array(iv.length + exportedKey.byteLength + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(exportedKey), iv.length);
    combined.set(new Uint8Array(encryptedData), iv.length + exportedKey.byteLength);

    return Buffer.from(combined).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, key, and encrypted data
    const iv = combined.slice(0, 12);
    const keyData = combined.slice(12, 44);
    const data = combined.slice(44);

    // Import the key
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    );

    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Secure storage wrapper
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    const encrypted = await encryptData(value);
    localStorage.setItem(key, encrypted);
  },

  getItem: async (key: string): Promise<string | null> => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return await decryptData(encrypted);
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
}; 