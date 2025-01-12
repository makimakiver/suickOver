import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NavigationBar from './components/NavigationBar'
import { ConnectButton, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import AnswerPostingPage from './pages/AnswerPostingPage'
import QuestionPage from './pages/QuestionPage'
import { useEffect, useState } from 'react'
import { isValidSuiObjectId } from "@mysten/sui/utils";
import AccountCreationPage from './pages/AccountCreationPage'
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client'
import { SuiClient } from '@mysten/sui.js/client'
import { DEVNET_COUNTER_PACKAGE_ID } from './constants'
function App() {
  const currentAccount = useCurrentAccount();
  console.log("Current Account: ", currentAccount?.address);
  const { questionId } = useParams();

  const client = new SuiClient({ url: getFullnodeUrl('devnet') });
  const [hasAccount, setHasAccount] = useState(false);
  const [checked, setChecked] = useState(false);
  const data = useSuiClientQuery('getOwnedObjects', {
      owner: String(currentAccount?.address),
    });
  const [username, setUsername] = useState("");
  const [user, setUser] = useState("");
  const fetchUsername = async (user_address: string) => {
    try {
      console.log("Fetching username for objectId: ", user_address);
      const username = await client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            function: "create_User_Account",
            module: "suickoverflow",
            package: String(DEVNET_COUNTER_PACKAGE_ID),
          }
        },
        options: {
          showEffects: true,
          showInput: true,
        },
      });
      console.log("username: ", username);
      for(const creationEvent of username.data){
        console.log("AccountCreation Event Sender and fetching user: ", creationEvent.transaction?.data.sender);
        if (creationEvent.transaction?.data.sender === String(currentAccount?.address)) {
          console.log("set User: ", creationEvent.effects?.created[0].reference.objectId);
          fetchUser(String(creationEvent.effects?.created[0].reference.objectId));
          console.log("set User: ", user);
          return null;
        } 
      }
      return null;
      console.log("Username: ", username);
      // setUsername(username);
    } catch (error) {
      console.error("Error fetching username: ", error);
      return null;
    }
  };
  const fetchUser = async (objectId: string) => {
    console.log("Fetching user for objectId: ", objectId);
    try {
      console.log("Fetching user for objectId: ", objectId);
      const user = await client.getObject({ 
        id: objectId,
        options: {
          showContent: true,
        }
      });
      setUser(objectId);
      console.log("fetched User: ", user);
      console.log("fetched User: ", user.data.content?.fields.name);
      setUsername(String(user.data.content?.fields.name));
    } catch (error) {
      console.error("Error fetching user: ", error);
      return null;
    }
  };
  const fetchCreationTransaction = async (user_address: string) => {
    try {
      console.log("Fetching creation transaction for objectId: ", user_address);
      const accountCreationEvent = await client.queryTransactionBlocks({
          filter: {
            MoveFunction: {
              function: "create_User_Account",
              module: "suickoverflow",
              package: String(DEVNET_COUNTER_PACKAGE_ID),
            }

          },
          options: {
            showEffects: true, // Include transaction effects if needed
            showInput: true,   // Include transaction inputs if needed
            // Add other options as required
          },
        });
        for(const creationEvent of accountCreationEvent.data){
          console.log("Creation Event Sender: ", creationEvent.transaction?.data.sender);
          if (creationEvent.transaction?.data.sender === String(currentAccount?.address)) {
            console.log("Set them to be true:  ", creationEvent.transaction?.data.sender);
            setHasAccount(true);
            return null;
          } 
        }
        console.log("No creation event found.");
        return null;

    } catch (error) {
        console.error("Error fetching creation transaction: ", error);
        return null;
    }
  };

  useEffect(() => {
    console.log("Checking account creation for: ", currentAccount?.address);
    fetchCreationTransaction(String(currentAccount?.address));
    setChecked(true);
    fetchUsername(String(currentAccount?.address));
    console.log("Has Account: ", hasAccount);
  }, [currentAccount?.address]);

  // const [counterId, setCounter] = useState(() => {
  //   const hash = window.location.hash.slice(1);
  //   return isValidSuiObjectId(hash) ? hash : null;
  // });
  if(!checked){
    return <div>Checking account creation...</div>;
  }
  return (
    <BrowserRouter>
        <div>
          <Heading> 😆 Hello {username}!!!</Heading>
        </div>
        <Flex
        py="2"
        justify="between"
        >
        <div className='topComponentUpLeft' style={{display: "flex", flexDirection: "column"}} >
          <Heading>
            <Link to="/" style={{textDecoration: "none", color: "white"}}>
              Q&A Monetised App
            </Link>
          </Heading>
        </div>

        <div className='topComponentUpRight'>
          <ConnectButton />
        </div>

      </Flex>
      <Flex style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}>
        {
          currentAccount && checked && hasAccount ? (
            <div className='topComponentDownLeft' style={{display: "flex", flexDirection: "column", alignItems: "left"}}>
              <NavigationBar />
            </div>
          ) : (
            <div className='topComponentDownLeft' style={{display: "flex", flexDirection: "column", alignItems: "left"}}>
              <NavigationBar />
            </div>
          )
        }
    
      </Flex>
      <Layout>
        {
          currentAccount ? (
            checked ? (
            hasAccount ? (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route 
                path="/post-question" 
                element={
                  <AnswerPostingPage 
                    onSubmitAnswer={(answer) => {
                      // Handle answer submission
                    }}
                    user={user ? { id: user } : { id: '' }}
                  />
                } 
              />
              <Route path="/questions/:id" element={<QuestionPage user_id={user}/>} />
              <Route path="/create-account" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            // <Navigate to="/create-account"/>
            <Routes>
              <Route path="/" element={<Navigate to="/create-account" replace />} />
              <Route path="/create-account" element={<AccountCreationPage />} />
            </Routes>
          )) : (
            <div>
              <Heading>Please create an account</Heading>
            </div>
          )) : (
            <div>
              <Heading>Please connect your wallet</Heading>
            </div>
          )
        }
      </Layout>
    </BrowserRouter>
  )
}

export default App
