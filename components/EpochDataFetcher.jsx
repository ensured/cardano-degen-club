import { SiteHeader } from './site-header';

export default async function EpochDataFetcher() {
    const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;

    const getEpochData = async () => {
        const url = `https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest`;
        const response = await fetch(url, {
            headers: {
                'project_id': blockfrostApiKey
            }
        });
        const data = await response.json();
        return data; // Return the entire data object
    };

    const epochData = await getEpochData(); // Fetch data on the server

    return <SiteHeader epochData={epochData} />; // Pass data to the client component
} 