import {
  TransactionBuilder,
  Networks,
  Server,
  Operation,
  Asset,
  Memo,
} from "@stellar/stellar-sdk";

// We are setting a very high maximum fee, which increases our transaction's
// chance of being included in the ledger.
// Current recommended fee is `100_000` stroops.
const maxFeePerOperation = "100000";
const horizonUrl = "https://horizon-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit

/**
 * Constructs and returns a Stellar transaction that will create or modify a
 * trustline on an account.
 */
export async function createChangeTrustTransaction({ 
  source, 
  asset, 
  limit 
}: { 
  source: string;
  asset: string;
  limit?: string;
}): Promise<{ transaction: string; network_passphrase: string }> {
  // We start by converting the asset provided in string format into a Stellar
  // Asset() object
  const assetParts = asset.split(":");
  if (assetParts.length !== 2) {
    throw new Error('Invalid asset format. Expected format: "CODE:ISSUER"');
  }
  
  const trustAsset = new Asset(assetParts[0], assetParts[1]);

  // Next, we setup our transaction by loading the source account from the
  // network, and initializing the TransactionBuilder.
  const server = new Server(horizonUrl);
  const sourceAccount = await server.loadAccount(source);

  // Build the transaction with the changeTrust operation
  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase: networkPassphrase,
    fee: maxFeePerOperation,
  })
    // Add a single `changeTrust` operation (this controls whether we are
    // adding, removing, or modifying the account's trustline)
    .addOperation(
      Operation.changeTrust({
        asset: trustAsset,
        limit: limit?.toString(),
      }),
    )
    // Before the transaction can be signed, it requires timebounds
    .setTimeout(standardTimebounds)
    // It also must be "built"
    .build();

  return {
    transaction: transaction.toXDR(),
    network_passphrase: networkPassphrase,
  };
}

/**
 * Constructs and returns a Stellar transaction that contains a payment operation and an optional memo.
 */
export async function createPaymentTransaction({
  source,
  destination,
  asset,
  amount,
  memo,
}: {
  source: string;
  destination: string;
  asset: string;
  amount: string;
  memo?: string | Buffer;
}): Promise<{ transaction: string; network_passphrase: string }> {
  // First, we setup our transaction by loading the source account from the
  // network, and initializing the TransactionBuilder.
  const server = new Server(horizonUrl);
  const sourceAccount = await server.loadAccount(source);
  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase: networkPassphrase,
    fee: maxFeePerOperation,
  });

  // Determine what asset to send
  let sendAsset;
  if (asset && asset !== "native") {
    sendAsset = new Asset(asset.split(":")[0], asset.split(":")[1]);
  } else {
    sendAsset = Asset.native();
  }

  // If a memo was supplied, add it to the transaction
  if (memo) {
    if (typeof memo === "string") {
      transaction.addMemo(Memo.text(memo));
    } else if (memo instanceof Buffer) {
      transaction.addMemo(Memo.hash(memo.toString("hex")));
    }
  }

  // Add a single `payment` operation
  transaction.addOperation(
    Operation.payment({
      destination: destination,
      amount: amount.toString(),
      asset: sendAsset,
    }),
  );

  // Before the transaction can be signed, it requires timebounds
  const builtTransaction = transaction.setTimeout(standardTimebounds).build();
  
  return {
    transaction: builtTransaction.toXDR(),
    network_passphrase: networkPassphrase,
  };
}

/**
 * Constructs and returns a Stellar transaction that contains a createAccount operation and an optional memo.
 */
export async function createCreateAccountTransaction({
  source,
  destination,
  amount,
  memo,
}: {
  source: string;
  destination: string;
  amount: string;
  memo?: string;
}): Promise<{ transaction: string; network_passphrase: string }> {
  // The minimum account balance on the Stellar network is 1 XLM
  if (parseFloat(amount) < 1) {
    throw new Error("Insufficient starting balance. Minimum is 1 XLM.");
  }

  // Setup our transaction
  const server = new Server(horizonUrl);
  const sourceAccount = await server.loadAccount(source);
  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase: networkPassphrase,
    fee: maxFeePerOperation,
  });

  // If a memo was supplied, add it to the transaction
  if (memo) {
    transaction.addMemo(Memo.text(memo));
  }

  // Add a single `createAccount` operation
  transaction.addOperation(
    Operation.createAccount({
      destination: destination,
      startingBalance: amount.toString(),
    }),
  );

  // Build the transaction
  const builtTransaction = transaction.setTimeout(standardTimebounds).build();
  
  return {
    transaction: builtTransaction.toXDR(),
    network_passphrase: networkPassphrase,
  };
}

/**
 * Constructs and returns a Stellar transaction that will contain a path payment strict send operation
 * to send/receive different assets.
 */
export async function createPathPaymentStrictSendTransaction({
  source,
  sourceAsset,
  sourceAmount,
  destination,
  destinationAsset,
  destinationAmount,
  memo,
}: {
  source: string;
  sourceAsset: string;
  sourceAmount: string;
  destination: string;
  destinationAsset: string;
  destinationAmount: string;
  memo?: string;
}): Promise<{ transaction: string; network_passphrase: string }> {
  // Setup our transaction by loading the source account and initializing the TransactionBuilder
  const server = new Server(horizonUrl);
  const sourceAccount = await server.loadAccount(source);
  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase: networkPassphrase,
    fee: maxFeePerOperation,
  });

  // Parse assets for sending and receiving
  const sendAsset = sourceAsset === "native"
    ? Asset.native()
    : new Asset(sourceAsset.split(":")[0], sourceAsset.split(":")[1]);
    
  const destAsset = destinationAsset === "native"
    ? Asset.native()
    : new Asset(destinationAsset.split(":")[0], destinationAsset.split(":")[1]);

  // Calculate an acceptable 2% slippage
  const destMin = ((98 * parseFloat(destinationAmount)) / 100).toFixed(7);

  // Add memo if provided
  if (memo) {
    transaction.addMemo(Memo.text(memo));
  }

  // Add a single `pathPaymentStrictSend` operation
  transaction.addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount: sourceAmount.toString(),
      destination,
      destAsset,
      destMin,
    }),
  );

  // Build the transaction with timebounds
  const builtTransaction = transaction.setTimeout(standardTimebounds).build();
  
  return {
    transaction: builtTransaction.toXDR(),
    network_passphrase: networkPassphrase,
  };
}

/**
 * Constructs and returns a Stellar transaction that will contain a path payment strict receive operation
 * to send/receive different assets.
 */
export async function createPathPaymentStrictReceiveTransaction({
  source,
  sourceAsset,
  sourceAmount,
  destination,
  destinationAsset,
  destinationAmount,
  memo,
}: {
  source: string;
  sourceAsset: string;
  sourceAmount: string;
  destination: string;
  destinationAsset: string;
  destinationAmount: string;
  memo?: string;
}): Promise<{ transaction: string; network_passphrase: string }> {
  // Setup our transaction by loading the source account and initializing the TransactionBuilder
  const server = new Server(horizonUrl);
  const sourceAccount = await server.loadAccount(source);
  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase: networkPassphrase,
    fee: maxFeePerOperation,
  });

  // Parse assets for sending and receiving
  const sendAsset = sourceAsset === "native"
    ? Asset.native()
    : new Asset(sourceAsset.split(":")[0], sourceAsset.split(":")[1]);
    
  const destAsset = destinationAsset === "native"
    ? Asset.native()
    : new Asset(destinationAsset.split(":")[0], destinationAsset.split(":")[1]);

  // Calculate an acceptable 2% slippage
  const sendMax = ((102 * parseFloat(sourceAmount)) / 100).toFixed(7);

  // Add memo if provided
  if (memo) {
    transaction.addMemo(Memo.text(memo));
  }

  // Add a single `pathPaymentStrictReceive` operation
  transaction.addOperation(
    Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax,
      destination,
      destAsset,
      destAmount: destinationAmount,
    }),
  );

  // Build the transaction with timebounds
  const builtTransaction = transaction.setTimeout(standardTimebounds).build();
  
  return {
    transaction: builtTransaction.toXDR(),
    network_passphrase: networkPassphrase,
  };
}
