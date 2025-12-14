import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const uploadJSONToIPFS = async (jsonData: any) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        throw new Error("Pinata API keys are missing in environment variables");
    }

    try {
        const response = await axios.post(url, jsonData, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading to IPFS: ", error);
        throw error;
    }
};

export const uploadFileToIPFS = async (file: File) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        throw new Error("Pinata API keys are missing in environment variables");
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': `multipart/form-data;`,
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading file to IPFS: ", error);
        throw error;
    }
};
