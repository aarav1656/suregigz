import axios, { type AxiosRequestConfig } from "axios"
import { settings } from "../utils/environment"

const coingeckoApiKey = settings.coingeckoKey ?? ""
const appOriginUrl = "*"


// export const getTokenPriceUSD: bigint = (id: string) => {

//   const config: AxiosRequestConfig = {
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": appOriginUrl,
//       "x-cg-api-key": coingeckoApiKey,
//     },
//   }
//   return axios
//     .get(
//       `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&precision=full`,
//       config
//     )
//     .then((resp) => BigInt(resp.data?.[id]?.usd) ?? 0n)
// }


export const getTokenPriceUSD = async (id: string): Promise<number> => {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": appOriginUrl,
        "x-cg-api-key": coingeckoApiKey,
      },
    };
  
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&precision=full`,
        config
      );
  
      // Extracting price and converting to BigInt safely
      const priceStr = response.data?.[id]?.usd ?? "0";
      return Number(priceStr);
    } catch (error) {
      // console.error("Error fetching token price:", error);
      return 0;
    }
  };

