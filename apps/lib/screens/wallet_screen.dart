import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/theme.dart';
import '../utils/constants.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  _WalletScreenState createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  List<Map<String, dynamic>> wallets = [
    {
      'name': 'Ethereum Wallet',
      'address': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'balance': '2.45 ETH',
      'type': 'Ethereum',
      'isConnected': true,
    },
    {
      'name': 'Polygon Wallet',
      'address': '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      'balance': '1250 MATIC',
      'type': 'Polygon',
      'isConnected': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Wallet', style: Theme.of(context).textTheme.displayMedium),
            const SizedBox(height: 24),
            _buildWalletBalance(context),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Connected Wallets',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                ElevatedButton.icon(
                  onPressed: () => _showConnectWalletDialog(context),
                  icon: const Icon(Icons.add),
                  label: const Text('Connect'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: wallets.length,
                itemBuilder: (context, index) {
                  final wallet = wallets[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      title: Text(
                        wallet['name'],
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  wallet['address'],
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy, size: 16),
                                onPressed: () {
                                  Clipboard.setData(
                                    ClipboardData(text: wallet['address']),
                                  );
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Address copied to clipboard',
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Balance: ${wallet['balance']}',
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      leading: CircleAvatar(
                        backgroundColor: _getBlockchainColor(wallet['type']),
                        child: Text(
                          wallet['type'][0],
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        color: Colors.red,
                        onPressed: () => _showDisconnectDialog(context, index),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWalletBalance(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: AppTheme.cryptoCardDecoration(context, isPrimary: true),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Total Balance', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 8),
          const Text(
            '\$4,350.75',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.arrow_downward),
                label: const Text('Deposit'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primaryColor,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.arrow_upward),
                label: const Text('Withdraw'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showConnectWalletDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Connect Wallet'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ...AppConstants.supportedBlockchains.map(
                (blockchain) => ListTile(
                  title: Text(blockchain),
                  leading: CircleAvatar(
                    backgroundColor: _getBlockchainColor(blockchain),
                    child: Text(
                      blockchain[0],
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _connectWallet(blockchain);
                  },
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  void _showDisconnectDialog(BuildContext context, int index) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Disconnect Wallet'),
          content: const Text(
            'Are you sure you want to disconnect this wallet?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  wallets.removeAt(index);
                });
                Navigator.pop(context);
              },
              child: const Text('Disconnect'),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
            ),
          ],
        );
      },
    );
  }

  void _connectWallet(String blockchainType) {
    // In a real app, this would integrate with actual wallet providers
    // For now, we'll simulate adding a wallet
    setState(() {
      wallets.add({
        'name': '$blockchainType Wallet',
        'address':
            '0x${blockchainType.hashCode.toRadixString(16).padLeft(40, '0')}',
        'balance': '0.00 ${_getBlockchainToken(blockchainType)}',
        'type': blockchainType,
        'isConnected': true,
      });
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$blockchainType wallet connected successfully'),
        backgroundColor: Colors.green,
      ),
    );
  }

  String _getBlockchainToken(String blockchainType) {
    switch (blockchainType) {
      case 'Ethereum':
        return 'ETH';
      case 'Polygon':
        return 'MATIC';
      case 'Solana':
        return 'SOL';
      case 'Binance Smart Chain':
        return 'BNB';
      case 'Avalanche':
        return 'AVAX';
      default:
        return 'TOKENS';
    }
  }

  Color _getBlockchainColor(String blockchainType) {
    switch (blockchainType) {
      case 'Ethereum':
        return Colors.indigo;
      case 'Polygon':
        return Colors.purple;
      case 'Solana':
        return Colors.deepPurple;
      case 'Binance Smart Chain':
        return Colors.amber.shade800;
      case 'Avalanche':
        return Colors.red;
      default:
        return Colors.blueGrey;
    }
  }
}
