import {SuiObjectData} from "@mysten/sui.js/client";
import { useEffect, useState } from "react";
import { ethos } from "ethos-connect";

export const useSuiObject = (objectId: string, interval: number) => {
    const [object, setObject] = useState<SuiObjectData | null>(null);
    const { wallet } = ethos.useWallet();

    useEffect(() => {
        if(wallet){
            const intervalId = setInterval(async () => {
                const res = await wallet.client.getObject({ 
                    id: objectId,
                    options: {
                        showContent: true,
                    }
                })
                if(res.data){
                    setObject(res.data);
                }
            }, interval*1000)
            return () => clearInterval(intervalId); // cleanup function
        }
    }, [wallet])
    return object
}