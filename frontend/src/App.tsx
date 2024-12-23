import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NavigationBar from './components/NavigationBar'
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
function App() {
  const currentAccount = useCurrentAccount();

  return (
    <BrowserRouter>
        <Flex

        py="2"
       
        justify="between"
      >
        <div className='topComponentUpLeft' style={{display: "flex", flexDirection: "column"}}>
          <Heading>Q&A Monetised App</Heading>
        </div>

        <div className='topComponentUpRight'>
          <ConnectButton />
        </div>

      </Flex>
      <Flex style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}>
        <div className='topComponentDownLeft' style={{display: "flex", flexDirection: "column", alignItems: "left"}}>
          <NavigationBar />
        </div>
    
      </Flex>
      <Layout>
        {
          currentAccount ? (
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          ) : (
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
