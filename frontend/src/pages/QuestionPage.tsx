import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // or whichever router you use
import { questions } from "../mockData/questions";
import "./questionPage.css";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui.js/client";
import { DEVNET_COUNTER_PACKAGE_ID, QUESTION_POLL_PACKAGE_ID } from "../constants";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { ExitIcon } from "@radix-ui/react-icons"
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
// import { Answer } from "../types";

// make a question card which I made in chat GPT


interface Answer {
  id: string;
  likes: number;
  content: string;
  author: string;
}

// interface Question {
//   id: number;
//   title: string;
//   body: string;
//   votes: number;
//   askedAt: string;
//   tags: string[];
//   answers: Answer[];
// }

interface QuestionListItemProps {
    questionId: string;
  }
  interface Question {
      id: string;
      title: string;
      description: string;
      votes: number;
      askedAt: Date;
      answers: [];
  }
  interface User {
    user_id: string;
  }

const QuestionPage: React.FC<User> = (user) => {
    const questionId  = useParams();
    // console.log("User from app.tsx: ", user);
    // console.log("Question ID from : ", questionId);
    const [question, setQuestion] = useState< Question | null | undefined>(null);
    const [askedAt, setAskedAt] = useState<number | null | undefined>(null);
    const [answers, setAnswers] = useState<[]>([]);
    const [owner, setOwner] = useState<boolean>(false);
    const [withdraw, setWithdraw] = useState<boolean>(false);
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
    const descriptionRef = useRef("");
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
    const validateOwner = async (objectId: string) => {
        const object = await client.getObject({id: objectId, options: { showOwner: true }});
        const owner = object.data?.owner.AddressOwner;
        if (owner === currentAccount?.address){
            setOwner(true);
            return true
        }
        else{
            return false
        }
    }
    const fetchCreationTransaction = async (objectId: string) => {
        try {
            // console.log("Fetching creation transaction for objectId: ", objectId);
            // console.log("Current Account from line 92: ", currentAccount?.address);
           
            // const question = await fetchObject(objectId);
            // for (const answer of question?.content.fields.answers){
            //     console.log("Answer: ", answer);
            //     const answerObj = await fetchObject(answer);
            //     console.log("Answer Object: ", answerObj);
            //     setAnswers(answerObj? answers.push(answerObj));

            // }
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

                const transactionDetails = await fetchTransaction(creationDigest);
         
                const creationTime = Number(transactionDetails.timestampMs);
                const askedAt_In_Timestamp = new Date(creationTime);
                const now = Date.now();
                const askedAt_In_Hours = Math.round((now - askedAt_In_Timestamp.getTime()) / 3600000);
                // console.log("Asked At: ", askedAt_In_Hours);
                setAskedAt(askedAt_In_Hours);
                return creationDigest;
            } else {
                // console.log("No creation event found.");
                return null;
            }
        } catch (error) {
            // console.error("Error fetching creation transaction: ", error);
            return null;
        }
    };
    const { mutate: signAndExecute, isSuccess, isPending } = useSignAndExecuteTransaction();
    // const poll = fetchObject(QUESTION_POLL_PACKAGE_ID);
    // console.log("Poll: ", poll);
    // the code above is bad as I am not in async context
    const handleQuestion = async () => {
        const currentQuestion = await fetchObject(String(questionId.id)); // Await the promise
        console.log("Current Question: ", currentQuestion);
        if(currentQuestion !== null && currentQuestion !== undefined) {
            // console.log("currentQuestion digest( address to transaction details): ", currentQuestion.digest);
            // const transactionDetails = await fetchTransaction(currentQuestion.digest);
            // console.log("Transaction Details: ", transactionDetails)
            setQuestion(currentQuestion.content.fields);
            if(currentQuestion.content.fields.question_to_earn.fields.balance == 0){
                setWithdraw(true);
            }
            if(currentQuestion.content.fields.answers.length > 0){
                console.log("Answers: ", currentQuestion.content.fields.answers);
                for (const answer of currentQuestion.content.fields.answers){
                    const answerObj = await fetchObject(answer);
                    console.log("Answer Object: ", answerObj);
                    const userObj = await fetchObject(answerObj.content.fields.user);
                    console.log("User Object: ", userObj.content.fields.name);
                    const display_answer:Answer = {
                        id: answerObj.content.fields.id.id,
                        likes: answerObj.content.fields.likes,
                        content: answerObj.content.fields.answer,
                        author: userObj.content.fields.name,
                    }
                    for (const already_present_answer of answers){
                        if(already_present_answer.id === display_answer.id){
                            console.log("Answer already present");
                        }
                        else{
                            answers.push(display_answer);
                        }
                    }
                    if(answers.length === 0){
                        answers.push(display_answer);
                    }
                    console.log("Display Answer: ", display_answer);
                    console.log("Current state of Answers: ", answers);
                    // setAnswers(answerObj? answers.push(display_answer));
                    
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tx = new Transaction();
        tx.moveCall({
            target: `${DEVNET_COUNTER_PACKAGE_ID}::suickoverflow::create_Answer`,
            arguments: [tx.object(String(questionId.id)), tx.pure.address(user.user_id), tx.pure.address(String(questionId.id)), tx.pure.string(descriptionRef.current)]
        });
        signAndExecute(
            {
              transaction: tx,
            },
            {
                onSuccess: async ({ digest }) => {
                const { effects } = await client.waitForTransactionBlock({
                  digest: digest,
                  options: {
                    showEffects: true,
                  },
                });
              },
            },
        );
    }
      // Cleanup the timer when the component unmounts
    useEffect(() => {
        
        handleQuestion();
        console.log("Question from 191: ", questionId);
        fetchCreationTransaction(String(questionId.id));
        validateOwner(String(questionId.id));

    }, [questionId]);
    const navigate = async() => {
        console.log("From exit button clicked: ", question?.id.id);
        validateOwner(String(question?.id.id));
        if(owner){
            const tx = new Transaction();
            console.log("User ID: ", user.user_id);
            const userObj = await fetchObject(user.user_id);
            tx.moveCall({
                target: `${DEVNET_COUNTER_PACKAGE_ID}::suickoverflow::withdraw_question_to_earn`,
                arguments: [tx.pure.address(user.user_id), tx.object(String(questionId.id)), tx.object(SUI_CLOCK_OBJECT_ID)]
            });
            signAndExecute(
                {
                  transaction: tx,
                },
                {
                    onSuccess: async ({ digest }) => {
                    const { effects } = await client.waitForTransactionBlock({
                      digest: digest,
                      options: {
                        showEffects: true,
                      },
                    });
                  },
                },
            );
        }
    };
    if(question){
        return (
            <div className="questionPageContainer">
                {owner ? withdraw ? <></>: <ExitIcon onClick={() => navigate()}/> : <></>}
                <div style={{ padding: "1rem" }}>
                    <h1>{question.title}</h1>
                    <p>asked at {askedAt} hours ago</p>

                <div style={{ margin: "1rem 0" }}>
                <p>{question.description}</p>
                </div>
                <strong>Votes: {question.votes}</strong>
            
                <div>
                    {/* {question.tags.map((tag, index) => (
                        <span
                        key={index}
                        style={{
                            display: "inline-block",
                            marginRight: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#f2f2f2",
                            borderRadius: "4px",
                            color: "black"
                        }}
                        >
                        {tag}
                        </span>
                    ))} */}
                </div>
                
                <hr style={{ margin: "2rem 0" }} />
                
             
                {withdraw ? <p>question has been expired and you can't answer it</p> : 
                   
                    <div style={{ marginTop: "2rem" }}>
                    <form>
                        <div className="floating-label-group">
                            <textarea 
                                id="question"
                                name="question"
                                placeholder="Describe yourself"
                                required
                                onChange={(e) => {
                                    descriptionRef.current = e.target.value;
                                }}
                                />
                        </div>
                        <button type="submit" onClick={(e) => handleSubmit(e)} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                        Add Answer
                        </button>
                    </form>
                    </div>
                }

                <h2>Answers</h2>
                    {question.answers.length === 0 ? (
                        <p>No answers yet. Be the first to answer!</p>
                        ) : (
                        answers.map((answer) => (
                            <div
                            key={answer.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "1rem",
                                marginTop: "1rem",
                                borderRadius: "8px",
                            }}
                            >
                                <div>
                                    <p>{answer.content}</p>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" , marginTop: "1rem"}}>
                                    <p>Likes: {answer.likes}</p>
                                    <small>
                                    answered by {answer.author} 
                                </small>
                                </div>
                            </div>
                        ))
                        )}
                </div>
            </div>

    );
  }
  else{
    return (
      <div className="questionPageContainer">
        <h1>Question not found</h1>
      </div>
    );
  }
};

export default QuestionPage;
