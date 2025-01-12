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
interface User {
    id: string;
}
const AnswerPostingPage: React.FC<User> = (user) => {
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
  const handleSubmit = async (e: React.FormEvent, ) => {
    e.preventDefault();
    // setLoading(true);
    // setError(null);
    console.log("hello wooooooorld");

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
        async function getUserCoinObjectIds(userAddress: string): Promise<string[]> {
            const coins = await client.getCoins({ owner: userAddress });
            return coins.data.map((coin) => coin.coinObjectId);
          }
        const coinObjectIds = await getUserCoinObjectIds(String(currentUser?.address));
        if (coinObjectIds.length === 0) {
            throw new Error('No Coin<SUI> objects found for the user.');
        }
        console.log("coinObjectIds", coinObjectIds);
        console.log("titleRef.current", titleRef.current);
        const title = titleRef.current;
        const description = descriptionRef.current;
        const price = priceRef.current;
        const deadline = Date.parse(deadlineRef.current);
        console.log(title, description, price, deadline);
        const days = Date.now();
        // const display_duration = Math.round((deadline-days)/3600000);
        const actual_duration = deadline - days;
        console.log(actual_duration);
        const tx = new Transaction();
        console.log("userId : ", user.user.id);
        tx.moveCall({
            target: `${DEVNET_COUNTER_PACKAGE_ID}::suickoverflow::create_Question`,
            arguments: [tx.pure.u64(actual_duration), tx.pure.address(user.user.id), tx.pure.string(titleRef.current), tx.pure.string(descriptionRef.current), tx.pure.u64(priceRef.current), tx.object(coinObjectIds[0]), tx.object(SUI_CLOCK_OBJECT_ID), tx.object(QUESTION_POLL_PACKAGE_ID)]
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
// return (
//     <div className="form-container">
//       <h1>Ask Your Question</h1>
      
//       <form>
//         {/* Question Field */}
//         <div className="floating-label-group">
//           <textarea 
//             id="question" 
//             name="question" 
//             rows={4}
//             required
//           ></textarea>
//           <label htmlFor="question">Your Question</label>
//         </div>

//         {/* Price Field */}
//         <div className="floating-label-group">
//           <input 
//             type="number" 
//             id="price" 
//             name="price"
//             min={0} 
//             step={0.01} 
//             required
//           />
//           <label htmlFor="price">Price (USD)</label>
//         </div>

//         {/* Date Field */}
//         <div className="floating-label-group">
//           <input 
//             type="date" 
//             id="deadline" 
//             name="deadline" 
//             required
//           />
//           <label htmlFor="deadline">Deadline</label>
//         </div>

//         {/* Submit */}
//         <button type="submit">Submit Question</button>
//       </form>
//     </div>
//   );
return (
    <div className="question-posting-page">
        <div className="form-container">
        <h1 style={{fontSize: "1.5rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Ask Your Question</h1>
        
        <form>
            {/* Question Field */}
            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "2rem"}}>
                <label htmlFor="question" style={{fontSize: "1rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Your Question</label>
            </div>
            
            <div className="floating-label-group">
            <input 
                type="text" 
                id="title" 
                name="title"
                required
                onChange={(e) => {
                    titleRef.current = e.target.value;
                }}
            />
            <label htmlFor="price" style={{fontSize: "1rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Title</label>
            </div>
            <div className="floating-label-group">
                <textarea 
                    id="question"
                    name="question"
                    placeholder="Description of the question"
                    required
                    onChange={(e) => {
                        descriptionRef.current = e.target.value;
                    }}
                />
            </div>

            {/* Price Field */}
            <div className="floating-label-group">
            <input 
                type="number" 
                id="price" 
                name="price"
                min={0} 
                step={0.01} 
                required
                onChange={(e) => {
                    priceRef.current = Number(e.target.value);
                }}
            />
            <label htmlFor="price" style={{fontSize: "1rem", fontFamily: "Consolas, Menlo, Monaco, monospace"}}>Price (USD)</label>
            </div>

            {/* Date Field */}
            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
                <label htmlFor="deadline">Deadline</label>
            </div>
            <div className="floating-label-group">
            <input 
                type="date" 
                id="deadline" 
                name="deadline" 
                required
                onChange={(e) => {
                    deadlineRef.current = e.target.value;
                }}
            />
            </div>

            {/* Submit */}
            <button type="submit" onClick={(e) => handleSubmit(e)}>Submit Question</button>
        </form>
        </div>
    </div>
  );
};

export default AnswerPostingPage;
