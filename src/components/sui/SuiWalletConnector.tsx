import React, { useState } from 'react';
import { useSuiWallet } from '@/hooks/useSui';

interface SuiWalletConnectorProps {
  onConnected?: (address: string) => void;
  onDisconnected?: () => void;
}

const SuiWalletConnector: React.FC<SuiWalletConnectorProps> = ({
  onConnected,
  onDisconnected,
}) => {
  const { isConnected, address, connect, disconnect, generateKeypair } = useSuiWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKeypair, setGeneratedKeypair] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);

  const handleConnect = async () => {
    if (!privateKey.trim()) {
      setError('Please enter a private key');
      return;
    }

    setError(null);
    const result = connect(privateKey);
    
    if (result.success && result.address) {
      onConnected?.(result.address);
      setPrivateKey('');
    } else {
      setError(result.error || 'Failed to connect');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnected?.();
    setError(null);
  };

  const handleGenerateKeypair = () => {
    const newKeypair = generateKeypair();
    setGeneratedKeypair({
      address: newKeypair.address,
      privateKey: newKeypair.privateKey,
    });
  };

  const handleUseGeneratedKeypair = () => {
    if (generatedKeypair) {
      setPrivateKey(generatedKeypair.privateKey);
      setGeneratedKeypair(null);
    }
  };

  if (isConnected) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800">Wallet Connected</h3>
            <p className="text-sm text-green-600 font-mono">
              {address}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect Sui Wallet</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Private Key
          </label>
          <div className="relative">
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPrivateKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleConnect}
            disabled={!privateKey.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Connect
          </button>
          <button
            onClick={handleGenerateKeypair}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Generate New
          </button>
        </div>

        {generatedKeypair && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Generated Keypair</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Address:</span>
                <p className="font-mono text-yellow-700 break-all">{generatedKeypair.address}</p>
              </div>
              <div>
                <span className="font-medium">Private Key:</span>
                <p className="font-mono text-yellow-700 break-all">{generatedKeypair.privateKey}</p>
              </div>
              <button
                onClick={handleUseGeneratedKeypair}
                className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Use This Keypair
              </button>
            </div>
            <div className="mt-2 text-xs text-yellow-600">
              ⚠️ Save this private key securely! It won't be shown again.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 For testing purposes only. Never share your private key.</p>
        <p>💡 You can generate a new keypair for testing or use an existing one.</p>
      </div>
    </div>
  );
};

export default SuiWalletConnector;