import React, { useEffect, useState } from "react";
import { questions } from "../mockData/questions";
import QuestionListItem from "../components/QuestionItem";
import { useNetworkVariable } from "../networkConfig";
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
// import { ethos, EthosConnectStatus, SignInButton } from 'ethos-connect';
// import { useSuiClientQuery } from "@mysten/dapp-kit";
// import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import "./Homepage.css";
import { useSuiObject } from "../utils/hooks";
import { QUESTION_POLL_PACKAGE_ID } from "../constants";
import { getFullnodeUrl, SuiObjectData } from "@mysten/sui.js/client";
import { SuiClient } from "@mysten/sui.js/client";
const HomePage: React.FC = () => {
    const currentAccount = useCurrentAccount();
    const [questionPoll, setQuestionPoll] = useState<[] | null | undefined>(null);
    const [showContent, setShowContent] = useState(false);
    // const counterPackageId = useNetworkVariable("questionPollPackageId");
    // const suiClient = useSuiClient();
    // const currentAccount = useCurrentAccount();
    // const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    // const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    //     id: String(question.id),
    //     options: {
    //     showContent: true,
    //     showOwner: true,
    //     },
    // });
    const client = new SuiClient({ url: getFullnodeUrl('devnet') });

    const fetchObject = async (objectId: string) => {
        const object = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });
        const {data} = object;
        return data;
    }
    // const poll = fetchObject(QUESTION_POLL_PACKAGE_ID);
    // console.log("Poll: ", poll);
    // the code above is bad as I am not in async context
    const handlePoll = async () => {
        const poll = await fetchObject(QUESTION_POLL_PACKAGE_ID); // Await the promise
        if(poll !== null && poll !== undefined) {
            console.log("Poll: ", poll.content.fields.questions);
            setQuestionPoll(poll.content.fields.questions);
        }
    };
    useEffect(() => {
      // Set a timer to update the state after 3 seconds
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 800);
  
      // Cleanup the timer when the component unmounts
      return () => clearTimeout(timer);
    }, []);
  
    useEffect(() => {
        handlePoll();
    }, [currentAccount]);

    if (!showContent) {
      // Optionally show a loading spinner or placeholder
      return <div>Loading...</div>;
    }
    // console.log("Question Poll: ", questionPoll);
    // handlePoll();
    // console.log("Question Poll: ", questionPoll);
    // const currentQuestion = useSuiObject(QUESTION_POLL_PACKAGE_ID, 10000000);
    
    // const OwnedObjects = ({ address }: { address: string }) => {
    //     const { data } = useSuiClientQuery('getOwnedObjects', {
    //         owner: address,
    //     });
    //     if (!data) {
    //         return null;
    //     }
    //     return data;
    // }
    // console.log(OwnedObjects({address: String(currentAccount?.address)}));
    // const {status} = ethos.useWallet();
    // console.log(status);
    
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
            <div className="homepageContainer">
                {questionPoll && questionPoll.length > 0 ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Top Questions</h1>
                        {questionPoll.map((id) => (
                            <QuestionListItem questionId={String(id)} key={id} />
                        ))}
                    </>
                    ):(
                        <h1 className="text-2xl font-bold mb-4">No questions yet</h1>
                    )

                }
            </div>
        );
};

export default HomePage;
