# Required Sui SDK Dependencies

## Install these packages with pnpm:

```bash
# Core Sui SDK packages
pnpm add @mysten/sui.js

# Optional: For wallet adapter integration (if planning to use Sui wallet adapters)
pnpm add @mysten/wallet-adapter-react @mysten/wallet-adapter-base

# Optional: For Sui dApp kit (comprehensive React integration)
pnpm add @mysten/dapp-kit @tanstack/react-query

# Development dependencies (if not already installed)
pnpm add -D @types/node
```

## Package Versions

As of latest integration, the recommended versions are:

- `@mysten/sui.js`: `^0.50.0` or latest
- `@mysten/wallet-adapter-react`: `^0.50.0` or latest (optional)
- `@mysten/dapp-kit`: `^0.50.0` or latest (optional)

## Integration Status

✅ **Completed:**
- Sui service layer (`src/services/suiServices.ts`)
- Contract utilities (`src/utils/contractUtils.ts`)
- Wallet utilities (`src/utils/walletUtils.ts`)
- TypeScript types (`src/types/suiTypes.ts`)
- React hooks (`src/hooks/useSui.ts`)
- Wallet connector component (`src/components/sui/SuiWalletConnector.tsx`)
- Test page (`src/pages/sui-test.tsx`)

📋 **Ready for Testing:**
- User Profile creation and management
- Project creation and milestone management
- Reputation system and reviews
- Messaging and notifications
- Basic wallet connectivity

🔄 **Next Steps:**
1. Install the required dependencies with `pnpm add @mysten/sui.js`
2. Navigate to `/sui-test` to test the integration
3. Connect with a test wallet or generate a new keypair
4. Test each module (Profile, Project, Reputation, Messaging)

⚠️ **Important Notes:**
- The integration uses testnet configuration by default
- All contract addresses are from the deployed testnet contracts
- For production, update the contract addresses in `contractUtils.ts`
- The wallet connector is for testing only - implement proper wallet integration for production

## File Structure

```
src/
├── components/
│   └── sui/
│       └── SuiWalletConnector.tsx
├── hooks/
│   └── useSui.ts
├── pages/
│   └── sui-test.tsx
├── services/
│   └── suiServices.ts
├── types/
│   └── suiTypes.ts
└── utils/
    ├── contractUtils.ts
    └── walletUtils.ts
```

## Usage Example

```typescript
import { useSuiIntegration } from '@/hooks/useSui';

function MyComponent() {
  const { wallet, profile, project } = useSuiIntegration();
  
  const handleCreateProfile = async () => {
    if (!wallet.isConnected) return;
    
    const result = await profile.createProfile({
      username: 'myusername',
      email: 'user@example.com',
      bio: 'My bio',
      hourlyRate: 50
    });
    
    if (result.success) {
      console.log('Profile created:', result.data);
    }
  };
  
  return (
    <div>
      {wallet.isConnected ? (
        <button onClick={handleCreateProfile}>
          Create Profile
        </button>
      ) : (
        <div>Connect wallet first</div>
      )}
    </div>
  );
}
```