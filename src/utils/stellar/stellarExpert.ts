// Define the asset interface
export interface StellarAsset {
  code: string;
  issuer: string;
  domain?: string;
  name?: string;
  toml?: string;
}

/**
 * Fetch popular assets from Stellar Expert API
 */
export async function fetchAssets(): Promise<StellarAsset[]> {
  try {
    // Using the Stellar Expert API to fetch popular assets on testnet
    const response = await fetch('https://api.stellar.expert/explorer/testnet/asset?limit=50&sort=rating');
    const data = await response.json();
    
    // Map the response to our StellarAsset interface
    return data.records.map((record: any) => ({
      code: record.code,
      issuer: record.issuer,
      domain: record.domain || null,
      name: record.name || record.code,
      toml: record.toml || null
    }));
  } catch (error) {
    console.error('Error fetching Stellar assets:', error);
    return [];
  }
}
