import axios from "axios";
const validExtensions = [
  ".x",
  ".polygon",
  ".nft",
  ".crypto",
  ".blockchain",
  ".bitcoin",
  ".dao",
  ".888",
  ".wallet",
  ".binanceus",
  ".hi",
  ".klever",
  ".kresus",
  ".anime",
  ".manga",
  ".go",
  ".zil",
  ".eth",
];

export async function resolveUnstoppableDomain(domain) {
  if (validExtensions.includes(domain.substring(domain.lastIndexOf(".")))) {
    const url = `https://api.unstoppabledomains.com/resolve/domains/${domain}`;
    const headers = {
      Authorization: `Bearer 8cpvqmldkyhbbheoupgx6cgjjvnpvnoih9exsrrmqrlamtcw`,
    };

    try {
      const response = await axios.get(url, {headers});
      return response.data;
    } catch (error) {
      throw error;
    }
  } else {
    return undefined;
  }
}
export function isEthereumAddress(address) {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
}
export const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
