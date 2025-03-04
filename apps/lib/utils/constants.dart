class AppConstants {
  // Platform name
  static const String appName = 'Web3Lancer';
  
  // Supported blockchains
  static const List<String> supportedBlockchains = [
    'Ethereum',
    'Polygon',
    'Solana',
    'Binance Smart Chain',
    'Avalanche'
  ];
  
  // Supported tokens
  static const Map<String, String> supportedTokens = {
    'ETH': 'Ethereum',
    'MATIC': 'Polygon',
    'SOL': 'Solana',
    'BNB': 'Binance Coin',
    'AVAX': 'Avalanche',
    'USDT': 'Tether',
    'USDC': 'USD Coin',
    'DAI': 'Dai',
  };
  
  // Escrow settings
  static const int minEscrowWitnesses = 3;
  static const int maxEscrowWitnesses = 7;
  static const double escrowFeePercentage = 0.5; // 0.5%
  
  // User reputation levels
  static const Map<String, int> reputationLevels = {
    'New': 0,
    'Beginner': 10,
    'Intermediate': 50,
    'Advanced': 100,
    'Expert': 200,
    'Master': 500,
  };
  
  // Project categories
  static const List<String> projectCategories = [
    'Smart Contract Development',
    'dApp Development',
    'Blockchain Integration',
    'Web3 Frontend',
    'NFT Creation',
    'Token Development',
    'Security Audits',
    'DAO Implementation',
    'DeFi Projects',
    'Crypto Content Creation',
  ];
  
  // API endpoints
  static const String apiBaseUrl = 'https://api.web3lancer.io';
  static const String explorerBaseUrls = {
    'Ethereum': 'https://etherscan.io',
    'Polygon': 'https://polygonscan.com',
    'Solana': 'https://explorer.solana.com',
    'Binance Smart Chain': 'https://bscscan.com',
    'Avalanche': 'https://snowtrace.io',
  };
}
