// Define the asset interface
export interface StellarAsset {
  code: string;
  issuer: string;
  domain?: string;
  name?: string;
  type?: string;
  logo?: string;
}

/**
 * Fetch popular Stellar assets from the StellarExpert API
 */
export async function fetchAssets(): Promise<StellarAsset[]> {
  try {
    const response = await fetch('https://api.stellar.expert/explorer/testnet/asset/?limit=20&sort=rating');
    
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data._embedded || !data._embedded.records) {
      return [];
    }
    
    return data._embedded.records.map((record: any) => ({
      code: record.asset_code,
      issuer: record.asset_issuer,
      domain: record.home_domain,
      name: record.name || record.asset_code,
      type: record.asset_type,
      logo: record.logo
    }));
  } catch (error) {
    console.error('Error fetching assets from StellarExpert:', error);
    
    // Return a small set of default assets in case of error
    return [
      {
        code: 'USDC',
        issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        name: 'USD Coin',
      },
      {
        code: 'BTC',
        issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        name: 'Bitcoin',
      },
      {
        code: 'ETH',
        issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        name: 'Ethereum',
      }
    ];
  }
}
