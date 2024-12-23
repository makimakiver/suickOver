import React from "react";
import { questions } from "../mockData/questions";
import QuestionListItem from "../components/QuestionItem";
import { ethos, EthosConnectStatus, SignInButton } from 'ethos-connect';
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

const HomePage: React.FC = () => {
    const {status} = ethos.useWallet();
    console.log(status);
    
    // const { data, isPending, isError, error, refetch } = useSuiClientQuery(
	// 	'getOwnedObjects',
	// 	{ owner: "0x123" },
	// 	{
	// 		gcTime: 10000,
	// 	},
	// );
    // console.log(data);
    // console.log(isPending);
    // console.log(isError);
    // console.log(error); 
    // console.log(refetch);
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">Top Questions</h1>
                {questions.map((q) => (
                    <QuestionListItem key={q.id} question={q} />
                ))}
            </div>
        );
};

export default HomePage;
