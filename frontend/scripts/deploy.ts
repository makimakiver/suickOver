import "dotenv/config";
// Ed25519 is a public-key signature system designed to be fast, secure, and widely adopted.
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";
import { SuiClient } from "@mysten/sui.js/client";
import path, { dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { writeFileSync } from "fs";

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
  process.exit(1);
}
const path_to_scripts = dirname(fileURLToPath(import.meta.url));

// we need to create a keypair to start sign the transaction
// the function fromSecretKey wants a Uint8Array, so we need to convert the private key from string to a Uint8Array
const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey).slice(1));
const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
// we need to get path to where we want to run the command to build the contract
// import.meta.url is the path to the current file and dirname is the path to the directory name of the current file
const path_to_contracts = path.join(path_to_scripts, "../../contracts");

// console.log("Hello world") import.meta.url is the path to the current file and dirname is the path to the directory name of the current file and its not formatted properly
//console.log(JSON.parse(execSync(`sui move build --dump-bytecode-as-base64 --path ${path_to_contracts}`, {encoding: "utf-8"})));
// the print statement will return list of followings: modules, dependencies, sources, bytecode
// we need to get the bytecode from the list
console.log("Building contracts")
const {dependencies, modules} = JSON.parse(execSync(`sui move build --dump-bytecode-as-base64 --path ${path_to_contracts}`, {encoding: "utf-8"}));

console.log("Deploying the contracts...");
console.log(`deploying from ${keypair.toSuiAddress()}`);

//create a transaction block
const deploy_trx = new TransactionBlock();
const [upgrade_cap] = deploy_trx.publish({
    modules, dependencies
})

deploy_trx.transferObjects([upgrade_cap], deploy_trx.pure(keypair.toSuiAddress()));

const { objectChanges, balanceChanges } = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: deploy_trx,
    options: {
        showEvents: true,
        showObjectChanges: true,
        showInput: false,
        showRawInput: false,
        showEffects: true,
        showBalanceChanges: true,
    }
})
console.log(objectChanges, balanceChanges);

if(!balanceChanges){
    console.log("Balance changes not defined");
    process.exit(1);
}


if(!objectChanges){
    console.log("Object changes not defined");
    process.exit(1);
}

function parse_amount(amount: string): number {
    return parseInt(amount) / 10 ** 9;
}

console.log("Spent on gas: "+Math.abs(parse_amount(balanceChanges[0].amount))+" SUI");

const published_change = objectChanges.find(change => change.type == "published");
if(published_change?.type == "published"){
    console.log("Error: the contract was not published");
    process.exit(1);
}
else{
    const deployed_address = {
        packageId: published_change.packageId,
    }
    // continue watching the deployed address
}

const deployed_path = 
writeFileSync("deployed_address.json", JSON.stringify(deployed_address, null, 2));
console.log("The contracts have been deployed");


