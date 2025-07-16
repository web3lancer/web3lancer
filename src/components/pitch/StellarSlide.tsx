export default function StellarSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl font-semibold">Stellar Contract Details</h2>
      <ul className="text-left max-w-lg mx-auto list-disc list-inside space-y-2">
        <li>
          <b>Contract Address:</b>{" "}
          <a href="https://stellar.expert/explorer/testnet/contract/CDFJTPECWESQLM4NCVBD3VQZ2VMOL7LOK6EEJHTJ3MM4OFNNNJORB5HN" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            View on Stellar Expert
          </a>
        </li>
        <li>
          <b>Contract ID:</b> CDFJTPECWESQLM4NCVBD3VQZ2VMOL7LOK6EEJHTJ3MM4OFNNNJORB5HN
        </li>
        <li>
          <b>Deployment Tx:</b>{" "}
          <a href="https://stellar.expert/explorer/testnet/tx/3ec143da28658ea3f09b5412b45a00a142ab091106ec82d6e6df8ffa49440ffc" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            View Transaction
          </a>
        </li>
      </ul>
    </div>
  );
}
