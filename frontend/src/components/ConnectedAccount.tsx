import { useCurrentAccount } from '@mysten/dapp-kit';

function ConnectedAccount() {
	const account = useCurrentAccount();

	if (!account) {
		return null;
	}

	return <div>Connected to {account.address}</div>;
}

export default ConnectedAccount;