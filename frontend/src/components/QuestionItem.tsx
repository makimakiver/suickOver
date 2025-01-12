import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Question } from "../types";
import "./QuestionItem.css";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiObject } from "../utils/hooks";
import { DEVNET_COUNTER_PACKAGE_ID, QUESTION_POLL_PACKAGE_ID } from "../constants";
import { getFullnodeUrl, SuiObjectData } from "@mysten/sui.js/client";
import { SuiClient } from "@mysten/sui.js/client";

interface QuestionListItemProps {
  questionId: string;
}
interface Question {
    id: string;
    title: string;
    description: string;
    votes: number;
    askedAt: Date;
}
const QuestionListItem: React.FC<QuestionListItemProps> = ({ questionId }) => {
    // console.log("questionId: ", questionId);
    const [question, setQuestion] = useState< Question | null | undefined>(null);
    const [askedAt, setAskedAt] = useState<number | null | undefined>(null);
    const [numberOfAnswers, setNumberOfAnswers] = useState<number | null | undefined>(null);
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
    const currentAccount = useCurrentAccount();
    const fetchObject = async (objectId: string) => {
        try{
            const object = await client.getObject({
              id: objectId,
              options: { showContent: true, showOwner: true },
            });
            // console.log("Object: ", object);
            const {data} = object;
            return data;
        } catch (error) {
            // console.error("Error fetching object: ", error);
            return null;
        }
    }
    const fetchTransaction = async (transactionDigest: string) => {
        const transactionDetails = await client.getTransactionBlock({ digest: transactionDigest });
        // console.log("Transaction Details: ", transactionDetails);
        return transactionDetails;
    };
    const fetchCreationTransaction = async (objectId: string) => {
        try {
            console.log("Fetching creation transaction for objectId: ", objectId);
            console.log("Current Account: ", currentAccount?.address);
    
            const creationEvent = await client.queryTransactionBlocks({
                filter: {
                    // MoveFunction: {
                    //     package: String(DEVNET_COUNTER_PACKAGE_ID),
                    //     module: "suickoverflow",
                    //     function: "create_Question",
                    // },
                    ChangedObject: objectId
                    // FromAddress: currentAccount?.address,
                },
                    
                    // MoveEventModule: {
                    //     package: String(DEVNET_COUNTER_PACKAGE_ID),
                    //     module: "suickoverflow",
                    // }
                limit: 100
            });
    
            console.log("Creation Event: ", creationEvent);
    
            if (creationEvent.data.length > 0) {
                const creationDigest = creationEvent.data[0].digest;
                console.log("Creation Transaction Digest: ", creationDigest);
                const transactionDetails = await fetchTransaction(creationDigest);
                console.log("Transaction Details: ", transactionDetails);
                const creationTime = Number(transactionDetails.timestampMs);
                const askedAt_In_Timestamp = new Date(creationTime);
                const now = Date.now();
                const askedAt_In_Hours = Math.round((now - askedAt_In_Timestamp.getTime()) / 3600000);
                console.log("Asked At: ", askedAt_In_Hours);
                setAskedAt(askedAt_In_Hours);
                return creationDigest;
            } else {
                console.log("No creation event found.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching creation transaction: ", error);
            return null;
        }
    };
    
    // const poll = fetchObject(QUESTION_POLL_PACKAGE_ID);
    // console.log("Poll: ", poll);
    // the code above is bad as I am not in async context
    const handleQuestion = async () => {
        const currentQuestion = await fetchObject(questionId); // Await the promise
        
        setNumberOfAnswers(currentQuestion.content.fields.answers.length);
        console.log("Number of Answers: ", numberOfAnswers);
        if(currentQuestion !== null && currentQuestion !== undefined) {
            // console.log("currentQuestion digest( address to transaction details): ", currentQuestion.digest);
            // const transactionDetails = await fetchTransaction(currentQuestion.digest);
            // console.log("Transaction Details: ", transactionDetails);
            console.log("Question: ", currentQuestion.content.fields);
            setQuestion(currentQuestion.content.fields);
        }
    };
      // Cleanup the timer when the component unmounts
    useEffect(() => {
        console.log("questionId is passed in or changed");
        handleQuestion();
        fetchCreationTransaction(questionId);
    }, [questionId]);
    // console.log("question: ", question);
    // const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    // const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    //     id: String(question.id),
    //     options: {
    //     showContent: true,
    //     showOwner: true,
    //     },
    // });
    // const currentQuestion = useSuiObject(String(question.id), 10000000000000);
    // console.log(currentQuestion);
    // const tx = new Transaction();
    // signAndExecute(
    //     {
    //     transaction: tx,
    //     },
    //     {
    //     onSuccess: (tx) => {
    //         suiClient.waitForTransaction({ digest: tx.digest }).then(async () => {
    //         await refetch();
    //         setWaitingForTxn("");
    //         });
    //     },
    //     },
    // );
    
    if(question !== null && question !== undefined) {
    return (
        <div className="questionItemWrapper">
            <div className="questionItemTopComponent">
                <div className="questionItemVotes">
                    {/* <div className="questionItemVotesCount">{question?.votes}</div> */}
                    <div className="questionItemVotesCount"> {numberOfAnswers} </div>
                    <div className="questionItemVotesText">answers</div>
                </div>
                <div className="questionItemContent">
                    <Link to={`/questions/${String(questionId)}`} className="questionItemTitleLink">
                    {question.title}
                    
                    </Link>
                </div>
                <div className="questionItemAskedAt">
                    {/* asked {Math.round((Date.now() - question.askedAt.getTime()) / 3600000)} hours ago */}
                    asked {askedAt} hours ago
                </div>
            </div>
            <div className="questionItemBody">
                <p className="questionItemBodyText">{question.description}</p>
            </div>
            {/* <div className="questionItemTags">
                {question.tags.map((tag) => (
                <span key={tag} className="text-sm bg-gray-200 px-2 py-1 rounded">
                    {tag}
                </span>
                ))}
            </div> */}
            {/* hey you suckers */}
        </div>
    );
    }
};

export default QuestionListItem;
