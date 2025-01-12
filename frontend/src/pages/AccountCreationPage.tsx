import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // or your router
// import { Textarea } from "@nextui-org/input";
import { TextArea } from "@radix-ui/themes";
import "./AnswerPostPage.css";
import { Transaction } from "@mysten/sui/transactions";
import { DEVNET_COUNTER_PACKAGE_ID, QUESTION_POLL_PACKAGE_ID } from "../constants";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { SuiClient } from "@mysten/sui.js/client";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
interface AnswerPostingPageProps {
  onSubmitAnswer: (answer: string) => void;
}
    
const AnswerPostingPage: React.FC = () => {
  const [answerContent, setAnswerContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef("");
  const descriptionRef = useRef("");
  const priceRef = useRef(0);
  const deadlineRef = useRef("");
  const navigate = useNavigate();
  const { id } = useParams(); // questionId param from URL (e.g., /questions/:id/answer)
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });
  const { mutate: signAndExecute, isSuccess, isPending } = useSignAndExecuteTransaction();
  const currentUser = useCurrentAccount();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    // setError(null);

    // tx.moveCall({
    //     target: "create_question",
    //     arguments: [titleRef.current, descriptionRef.current, priceRef.current, deadlineRef.current]
    // });
    // if (!id) {
    //   setError("Question ID not found in URL");
    //   setLoading(false);
    //   return;
    // }

    try {
        
        const username = titleRef.current;
        const userBio = descriptionRef.current;
        const tx = new Transaction();
        tx.moveCall({
            target: `${DEVNET_COUNTER_PACKAGE_ID}::suickoverflow::create_User_Account`,
            arguments: [tx.pure.string(username), tx.pure.string(userBio)]
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
                console.log("effects", effects);
              },
            },
        );
        // Submit the answer via a prop function or directly call an API
        // await onSubmitAnswer(Number(id), answerContent);

        // Optionally navigate back to the question page after successful submission
        navigate(`/`);
    } catch (err) {
      console.error(err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    
  }, [deadlineRef.current]);
return (
    <div className="question-posting-page">
        <div className="form-container">
        <h1 style={{fontSize: "1.5rem", fontFamily: "Consolas, Menlo, Monaco, monospace", marginBottom: "3rem"}}>Create an Account</h1>
        
        <form>
            {/* Question Field
            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "2rem"}}>
                <label htmlFor="question" style={{fontSize: "1rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Your Username</label>
            </div> */}
            
            <div className="floating-label-group" style={{marginBottom: "3rem"}}>
            <input 
                type="text" 
                id="title" 
                name="title"
                required
                onChange={(e) => {
                    titleRef.current = e.target.value;
                }}
            />
            <label htmlFor="price" style={{fontSize: "1rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Username</label>
            </div>
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
            {/* Submit */}
            <button type="submit" onClick={(e) => handleSubmit(e)}>Create Account</button>
        </form>
        </div>
    </div>
  );
};

export default AnswerPostingPage;
