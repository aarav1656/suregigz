"use client";

import { string } from '@dao-xyz/borsh';
import axios from 'axios';
import { use, useState } from 'react';
import { soneium } from 'viem/chains';
import { useEffect } from 'react';
// import 'globals.css';


const HomePage = () => {
  // State declarations
  const [balancewallet, setBalancewallet] = useState([]);
  const [balanceintent, setBalanceintent] = useState([]);
  const [isLoadingwallet, setIsLoadingwallet] = useState(false);
  const [isLoadingintent, setIsLoadingintent] = useState(false);
  const [isLoadingdeposit, setIsLoadingdeposit] = useState(false);
  const [isLoadingwithdraw, setIsLoadingwithdraw] = useState(false);
  const [isLoadingswapintent, setIsLoadingswapintent] = useState(false);
  const [isLoadingswapwallet, setIsLoadingswapwallet] = useState(false);
  const [isLoadingtransfer, setIsLoadingtransfer] = useState(false);
  const [amountdeposit, setAmountdeposit] = useState('');
  const [amountwithdraw, setAmountwithdraw] = useState('');
  const [amountswapintent, setAmountswapintent] = useState('');
  const [amountswapwallet, setAmountswapwallet] = useState('');
  const [amounttransfer, setAmounttranfer] = useState('');
  const [transferrecipientAddress, settranferAddress] = useState('');
  const [sellTokenintents, setSellTokenintents] = useState('');
  const [buyTokenintents, setBuyTokenintents] = useState('');
  const [sellTokenwallet, setSellTokenwallet] = useState('');
  const [buyTokenwallet, setBuyTokenwallet] = useState('');
  const [sellChainwallet, setSellChainwallet] = useState('');
  const [buyChainwallet, setBuyChainwallet] = useState('');
  const [tokendeposit, setTokendeposit] = useState('');
  const [chaindeposit, setChaindeposit] = useState('');
  const [senderdeposit, setsenderdeposit] = useState('');
  const [tokenwithdraw, setTokenwithdraw] = useState('');
  const [chainwithdraw, setChainwithdraw] = useState('');
  const [withdrawaddress, setwithdrawaddress] = useState('');
  const [transfertoken,settransfertoken] = useState('');
  const [transfersender,settransfersender] = useState('');
  const [zwalletsellsender,setzwalletsellsender] = useState('');
  const [zwalletbuyreceiver,setzwalletbuyreceiver] = useState('');
  const [txid, setTxid] = useState('');
  const [deposittxid, setdeposittxid] = useState('');
  const [swaptxid, setswaptxid] = useState('');
  const [withdrawtxid, setwithdrawtxid] = useState('');
  const [transaction_status,setTransaction_Status] = useState('');
  const [button_type,setButton_Type] = useState('');
  const [derivedbtcaddress ,setderivedbtcaddress] = useState('');
  const [btcreciveraddr ,setbtcreciveraddr] = useState('');
  const [zecaccountaddr, setzecaccountaddr] = useState('');
  const [nearaccount, setnearaccount] = useState('');
  
  
  const fetchDerivedBtcAddress = async () => {
    try {
      const response = await fetch('/api/btcderivedaddress');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to derive BTC address');
      }
      
      setderivedbtcaddress(data.address);
      return data;
    } catch (error) {
      console.error('Error fetching BTC address:', error);
      setderivedbtcaddress('');
      return "";
    }
  };

  const fetchzcashaddr = async () => {
    try {
      const response = await fetch('/api/zcashaccount');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Zcash address');
      }
      
      setzecaccountaddr(data.address);
      return data;
    } catch (error) {
      console.error('Error fetching BTC address:', error);
      setzecaccountaddr('');
      return "";
    }
  };

  const fetchnearaddr = async () => {
    try {
      const response = await fetch('/api/nearaccount');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch near address');
      }
      
      setnearaccount(data.address);
      return data;
    } catch (error) {
      console.error('Error fetching BTC address:', error);
      setnearaccount('');
      return "";
    }
  };
  
  useEffect(() => {
    if (derivedbtcaddress === '') {
      fetchDerivedBtcAddress();
    }
  }, [derivedbtcaddress]);

  useEffect(() => {
    if (zecaccountaddr === '') {
      fetchzcashaddr();
    }
  }, [zecaccountaddr]);

  useEffect(() => {
    if (nearaccount === '') {
      fetchnearaddr();
    }
  }, [nearaccount]);

  useEffect(() => {
    if (tokenwithdraw === 'NEAR' && nearaccount) {
      setwithdrawaddress(nearaccount);
    }
  }, [tokenwithdraw, nearaccount]); // Add all dependencies

  useEffect(() => {
    if (tokenwithdraw === 'ZEC' && zecaccountaddr) {
      setwithdrawaddress(zecaccountaddr);
    }
  }, [tokenwithdraw, zecaccountaddr]); // Add all dependencies

  useEffect(() => {
    if (tokenwithdraw === 'BTC' && derivedbtcaddress) {
      setwithdrawaddress(derivedbtcaddress);
    }
  }, [tokenwithdraw, derivedbtcaddress]); // Add all dependencies

  useEffect(() => {
    if (buyTokenwallet === 'BTC' && derivedbtcaddress) {
      setbtcreciveraddr(derivedbtcaddress);
    }
  }, [buyTokenwallet, derivedbtcaddress]); // Add all dependencies



  useEffect(() => {
    if (tokendeposit === 'ZEC' && zecaccountaddr) {
      setsenderdeposit(zecaccountaddr);
    }
  }, [tokendeposit, zecaccountaddr]); // Add all dependencies

  useEffect(() => {
    if (sellTokenwallet === 'ZEC' && zecaccountaddr) {
      setzwalletsellsender(zecaccountaddr);
    }
  }, [sellTokenwallet, zecaccountaddr]); // Add all dependencies

  useEffect(() => {
    if (buyTokenwallet === 'ZEC' && zecaccountaddr) {
      setzwalletbuyreceiver(zecaccountaddr);
    }
  }, [buyTokenwallet, zecaccountaddr]); // Add all dependencies

  useEffect(() => {
    if (transfertoken === 'ZEC' && zecaccountaddr) {
      settransfersender(zecaccountaddr);
    }
  }, [transfertoken, zecaccountaddr]); // Add all dependencies

  // Handler functions
  const depositToIntents = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoadingdeposit(true);
    setTransaction_Status("ongoing");
    event.preventDefault();
    try {
      const response = await axios.post('/api/depositToIntents', {params : { amountdeposit, tokendeposit, chaindeposit,senderdeposit }});
      setTxid(response.data.txid);
      if (response.data.txid === ""){
        setTransaction_Status("failed")
      }
      else{
        setTransaction_Status("success")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally{
      setIsLoadingdeposit(false);
      setButton_Type("depositToIntents");
    }
  };

  const withdrawFromIntents = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoadingwithdraw(true);
    setTransaction_Status("ongoing");
    event.preventDefault();
    try {
      const response = await axios.post('/api/withdrawFromIntents', {params : { amountwithdraw, tokenwithdraw, chainwithdraw, withdrawaddress }});
      setTxid(response.data.txid);
      if (response.data.txid === ""){
        setTransaction_Status("failed")
      }
      else{
        setTransaction_Status("success")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally{
      setIsLoadingwithdraw(false);
      setButton_Type("withdrawFromIntents");
    }
  };

  const getIntentsBalance = async () => {
    setIsLoadingintent(true);
    try {
      const response = await axios.get('/api/getIntentsBalance');
      setBalanceintent(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingintent(false);
    }
  };

  const getWalletBalance = async () => {
    setIsLoadingwallet(true);
    try {
      const response = await axios.get('/api/getWalletBalance');
      setBalancewallet(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingwallet(false);
    }
  };

  const transferToOtherWallet = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoadingtransfer(true);
    setTransaction_Status("ongoing");
    event.preventDefault();
    try {
      const response = await axios.post('/api/transferToOtherWallet', {params : { amounttransfer, transferrecipientAddress, transfertoken, transfersender }});
      setTxid(response.data.txid);
      if (response.data.txid === ""){
        setTransaction_Status("failed")
      }
      else{
        setTransaction_Status("success")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally{
      setIsLoadingtransfer(false);
      setButton_Type("transferToOtherWallet");
    }
  };

  const swapInIntents = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoadingswapintent(true);
    setTransaction_Status("ongoing");
    event.preventDefault();
    try {
      const response = await axios.post('/api/swapInIntents', {params:{
        sellTokenintents,
        buyTokenintents,
        amountswapintent
      }});
      setTxid(response.data.txid);
      if (response.data.txid === ""){
        setTransaction_Status("failed")
      }
      else{
        setTransaction_Status("success")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally{
      setIsLoadingswapintent(false);
      setButton_Type("swapInIntents");
    }
  };

  const directWalletSwap = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoadingswapwallet(true);
    setTransaction_Status("ongoing");
    event.preventDefault();
    try {
      const response = await axios.post('/api/directWalletSwap', {params:{
        sellTokenwallet,
        buyTokenwallet,
        amountswapwallet,
        sellChainwallet,
        buyChainwallet,
        zwalletsellsender,
        zwalletbuyreceiver,
        btcreciveraddr
      }});
      setdeposittxid(response.data.deposittxid);
      setswaptxid(response.data.swaptxid);
      setwithdrawtxid(response.data.withdrawtxid);
      if (response.data.deposittxid === ""){
        setTransaction_Status("failed")
      }
      else{
        setTransaction_Status("success")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally{
      setIsLoadingswapwallet(false);
      setButton_Type("directWalletSwap");
    }
  };

  function chainCompute(token: string): string[] {
    switch (token) {
      case 'ZEC':
        return ['zec'];
      case 'NEAR':
        return ['near'];
      case 'BTC':
        return ['bitcoin'];
      case 'USDC':
        return ['ethereum','near','turbochain','aurora','base','arbitrum','solana'];
      case 'ETH':
        return ['ethereum','near','turbochain','aurora','base','arbitrum'];
      case 'AURORA':
        return ['ethereum','near','turbochain','aurora'];
      case 'TURBO':
        return ['ethereum','near','turbochain'];
      case 'SWEAT':
        return ['near'];
      case 'SOL':
        return ['solana'];
      case 'DOGE':
        return ['dogecoin'];
      case 'XRP':
        return ['xrpledger'];
      case 'PEPE':
        return ['eth'];
      case 'SHIB':
        return ['eth'];
      case 'LINK':
        return ['eth'];
      case 'UNI':
        return ['eth'];
      case 'ARB':
        return ['arbitrum'];
      case 'AAVE':
        return ['eth'];
      case 'GMX':
        return ['arbitrum'];
      case 'MOG':
        return ['eth'];
      case 'BRETT':
        return ['base'];
      case 'WIF':
        return ['solana'];
      case 'BOME':
        return ['solana'];
      default:
        return ['Unknown'];
    }
  }

  return (
  <div className="app-container">
    <header className="app-header">
      <div className="logo-container">
        <h1 className="logo">CHILL-ZCASH</h1>
        <p className="app-tagline">Your Gateway to Seamless Crypto Management</p>
      </div>
    </header>

    <main className="main-content">
        {/* App Description Section */}
        <section className="description-section">
          <div className="description-card">
            <h2 className="description-title">Welcome to CHILL-ZCASH</h2>
            <div className="description-content">
              <p>
                CHILL-ZCASH is a comprehensive cryptocurrency management platform that allows you to:
              </p>
              <ul className="features-list">
                <li>✅ Manage multiple cryptocurrency balances in one place</li>
                <li>✅ Support Zcash shielded transaction</li>
                <li>✅ Securely deposit and withdraw funds</li>
                <li>✅ Swap between various tokens with ease</li>
                <li>✅ Transfer assets to other wallets</li>
                <li>✅ Track all your transactions</li>
              </ul>
              <div className="highlight-box">
                <h3>Why Choose CHILL-ZCASH?</h3>
                <p>
                Difficulty managing different accounts for different chains? Guess what?
                Our platform supports ZEC, BTC, NEAR, ETH, and more - all in one place.
                With intuitive controls and live tracking, crypto management just got effortless.
                </p>
              </div>
              <div className="supported-tokens">
                <h4>Supported Tokens:</h4>
                <div className="token-grid">
                  <span className="token-badge">ZEC</span>
                  <span className="token-badge">BTC</span>
                  <span className="token-badge">NEAR</span>
                  <span className="token-badge">ETH</span>
                  <span className="token-badge">USDC</span>
                  <span className="token-badge">AURORA</span>
                  <span className="token-badge">SOL</span>
                  <span className="token-badge">DOGE</span>
                  <span className="token-badge">XRP</span>
                  <span className="token-badge">+ many more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Balance Section */}
        <section className="section-container">
          <h2 className="section-title">Balance</h2>
          <div className="balance-actions">
            <button onClick={getIntentsBalance} className="action-button">
              {isLoadingintent ? 'Loading...' : 'Get Intents Balance'}
            </button>
            <button onClick={getWalletBalance} className="action-button">
              {isLoadingwallet ? 'Loading...' : 'Get Wallet Balance'}
            </button>
          </div>

          {balanceintent.length > 0 && (
            <div className="balance-table-container">
              <h3>Intents Balance</h3>
              <table className="balance-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceintent.map((item, index) => (
                    <tr key={index}>
                      <td>{item['token']}</td>
                      <td>{item['balance']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {balancewallet.length > 0 && (
            <div className="balance-table-container">
              <h3>Wallet Balance</h3>
              <table className="balance-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balancewallet.map((item, index) => (
                    <tr key={index}>
                      <td>{item['token']}</td>
                      <td>{item['balance']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Deposit Section */}
        <section className="section-container">
          <h2 className="section-title">Deposit to Intents</h2>
          <form onSubmit={depositToIntents} className="form-container">
            <div className="form-group">
              <label>Token</label>
              <select 
                value={tokendeposit} 
                onChange={(e) => setTokendeposit(e.target.value)} 
                className="form-input"
              >
                <option value="">Select Token</option>
                <option value="BTC">BTC</option>
                <option value="ZEC">ZEC</option>
                <option value="NEAR">NEAR</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="AURORA">AURORA</option>
                <option value="TURBO">TURBO</option>
                <option value="SWEAT">SWEAT</option>
              </select>
            </div>
            
            {tokendeposit === "BTC" && (
              <div className={`status-message success`}>
              {`Your derived btc address is: ${derivedbtcaddress}`}
              </div>
            )}

            {tokendeposit === "ZEC" && (
              <div className={`status-message success`}>
              {`Your zec address is: ${zecaccountaddr}`}
              </div>
            )}

            {tokendeposit === "NEAR"  && (
              <div className={`status-message success`}>
              {`Your near address is: ${nearaccount}`}
              </div>
            )}

            <div className="form-group">
              <label>Chain</label>
              <select 
                value={chaindeposit} 
                onChange={(e) => setChaindeposit(e.target.value)} 
                className="form-input"
              >
                <option value="">Select chain</option>
                {chainCompute(tokendeposit).map(chain => (chain === "bitcoin" || chain === "zec" || chain === "near") && (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>


            {tokendeposit === "ZEC" && (
              <div className="form-group">
                <label>Zcash Address</label>
                <input
                  type="string"
                  value={senderdeposit}
                  onChange={(e) => setsenderdeposit(e.target.value)}
                  placeholder="Zcash Address to send from"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amountdeposit}
                onChange={(e) => setAmountdeposit(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isLoadingdeposit ? "Depositing..." : "Deposit to Intents"}
            </button>
            
            {button_type === "depositToIntents" && (transaction_status === "success" || transaction_status === "failed"  ) && (
              <div className={`status-message ${transaction_status}`}>
                {transaction_status === "success" 
                  ? `Deposit to Intents successfully with transaction id: ${txid}` 
                  : `Deposit to Intents failed due to Internal server error`}
              </div>
            )}
          </form>
        </section>

        {/* Withdraw Section */}
        <section className="section-container">
          <h2 className="section-title">Withdraw From Intents</h2>
          <form onSubmit={withdrawFromIntents} className="form-container">
            <div className="form-group">
              <label>Token</label>
              <select 
                value={tokenwithdraw} 
                onChange={(e) => {
                  setTokenwithdraw(e.target.value);
                  ((e.target.value !== "BTC") && setwithdrawaddress(''));
                }} 
                className="form-input"
              >
                <option value="">Select Token</option>
                <option value="ZEC">ZEC</option>
                <option value="NEAR">NEAR</option>
                <option value="BTC">BTC</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="AURORA">AURORA</option>
                <option value="TURBO">TURBO</option>
                <option value="SWEAT">SWEAT</option>
                <option value="SOL">SOL</option>
                <option value="DOGE">DOGE</option>
                <option value="XRP">XRP</option>
                <option value="PEPE">PEPE</option>
                <option value="SHIB">SHIB</option>
                <option value="LINK">LINK</option>
                <option value="UNI">UNI</option>
                <option value="ARB">ARB</option>
                <option value="AAVE">AAVE</option>
                <option value="GMX">GMX</option>
                <option value="MOG">MOG</option>
                <option value="BRETT">BRETT</option>
                <option value="WIF">WIF</option>
                <option value="BOME">BOME</option>
              </select>
            </div>

            {tokenwithdraw === "BTC" && (
              <div className={`status-message success`}>
              {`Your derived btc address is: ${derivedbtcaddress}`}
              </div>
            )}

            {tokenwithdraw === "ZEC" && (
              <div className={`status-message success`}>
              {`Your zec address is: ${zecaccountaddr}`}
              </div>
            )}

            {tokenwithdraw === "NEAR"  && (
              <div className={`status-message success`}>
              {`Your near address is: ${nearaccount}`}
              </div>
            )}

            <div className="form-group">
              <label>Chain</label>
              <select 
                value={chainwithdraw} 
                onChange={(e) => setChainwithdraw(e.target.value)} 
                className="form-input"
              >
                <option value="">Select chain</option>
                {chainCompute(tokenwithdraw).map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amountwithdraw}
                onChange={(e) => setAmountwithdraw(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Withdraw Address</label>
              <input
                type="string"
                value={withdrawaddress}
                onChange={(e) => setwithdrawaddress(e.target.value)}
                placeholder="Enter withdraw Address"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isLoadingwithdraw ? "Withdrawing..." : "Withdraw From Intents"}
            </button>
            
            {button_type === "withdrawFromIntents" && (transaction_status === "success" || transaction_status === "failed"  ) && (
              <div className={`status-message ${transaction_status}`}>
                {transaction_status === "success" 
                  ? `Withdraw From Intents successfully with transaction id: ${txid}` 
                  : `Withdraw From Intents failed due to Internal server error`}
              </div>
            )}
          </form>
        </section>

        {/* Swap Sections */}
        <section className="section-container">
          <h2 className="section-title">Swap in Intents</h2>
          <form onSubmit={swapInIntents} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Sell Token</label>
                <select 
                  value={sellTokenintents} 
                  onChange={(e) => setSellTokenintents(e.target.value)} 
                  className="form-input"
                >
                  <option value="">Select Sell Token</option>
                  <option value="ZEC">ZEC</option>
                  <option value="NEAR">NEAR</option>
                  <option value="BTC">BTC</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="AURORA">AURORA</option>
                  <option value="TURBO">TURBO</option>
                  <option value="SWEAT">SWEAT</option>
                  <option value="SOL">SOL</option>
                  <option value="DOGE">DOGE</option>
                  <option value="XRP">XRP</option>
                  <option value="PEPE">PEPE</option>
                  <option value="SHIB">SHIB</option>
                  <option value="LINK">LINK</option>
                  <option value="UNI">UNI</option>
                  <option value="ARB">ARB</option>
                  <option value="AAVE">AAVE</option>
                  <option value="GMX">GMX</option>
                  <option value="MOG">MOG</option>
                  <option value="BRETT">BRETT</option>
                  <option value="WIF">WIF</option>
                  <option value="BOME">BOME</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Buy Token</label>
              <select 
                value={buyTokenintents} 
                onChange={(e) => setBuyTokenintents(e.target.value)} 
                className="form-input"
              >
                <option value="">Select Buy Token</option>
                <option value="ZEC">ZEC</option>
                <option value="NEAR">NEAR</option>
                <option value="BTC">BTC</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="AURORA">AURORA</option>
                <option value="TURBO">TURBO</option>
                <option value="SWEAT">SWEAT</option>
                <option value="SOL">SOL</option>
                <option value="DOGE">DOGE</option>
                <option value="XRP">XRP</option>
                <option value="PEPE">PEPE</option>
                <option value="SHIB">SHIB</option>
                <option value="LINK">LINK</option>
                <option value="UNI">UNI</option>
                <option value="ARB">ARB</option>
                <option value="AAVE">AAVE</option>
                <option value="GMX">GMX</option>
                <option value="MOG">MOG</option>
                <option value="BRETT">BRETT</option>
                <option value="WIF">WIF</option>
                <option value="BOME">BOME</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amountswapintent}
                onChange={(e) => setAmountswapintent(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isLoadingswapintent ? "Swapping..." : "Intent SWAP"}
            </button>
            
            {button_type === "swapInIntents" && (transaction_status === "success" || transaction_status === "failed"  ) && (
              <div className={`status-message ${transaction_status}`}>
                {transaction_status === "success" 
                  ? `Intent SWAP successfully with transaction id: ${txid}` 
                  : `Intent SWAP failed due to Internal server error`}
              </div>
            )}
          </form>
        </section>

        <section className="section-container">
          <h2 className="section-title">Direct Wallet Swap</h2>
          <form onSubmit={directWalletSwap} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Sell Token</label>
                <select 
                  value={sellTokenwallet} 
                  onChange={(e) => setSellTokenwallet(e.target.value)} 
                  className="form-input"
                >
                  <option value="">Select Sell Token</option>
                  <option value="BTC">BTC</option>
                  <option value="ZEC">ZEC</option>
                  <option value="NEAR">NEAR</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="AURORA">AURORA</option>
                  <option value="TURBO">TURBO</option>
                  <option value="SWEAT">SWEAT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sell Chain</label>
                <select 
                  value={sellChainwallet} 
                  onChange={(e) => setSellChainwallet(e.target.value)} 
                  className="form-input"
                >
                  <option value="">Select chain</option>
                  {chainCompute(sellTokenwallet).map(chain => (chain === "bitcoin" || chain === "zec" || chain === "near") && (
                    <option key={chain} value={chain}>{chain}</option>
                  ))}
                </select>
              </div>
            </div>

            {sellTokenwallet === "BTC" && (
                <div className={`status-message success`}>
                {`Your derived btc address is: ${derivedbtcaddress}`}
                </div>
            )}

            {sellTokenwallet === "ZEC" && (
              <div className={`status-message success`}>
              {`Your zec address is: ${zecaccountaddr}`}
              </div>
            )}

            {sellTokenwallet === "NEAR"  && (
              <div className={`status-message success`}>
              {`Your near address is: ${nearaccount}`}
              </div>
            )}

            {sellTokenwallet === "ZEC" && (
              <div className="form-group">
                <label>Zcash Address From</label>
                <input
                  type="string"
                  value={zwalletsellsender}
                  onChange={(e) => setzwalletsellsender(e.target.value)}
                  placeholder="Zcash Address to send from"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Buy Token</label>
                <select 
                  value={buyTokenwallet} 
                  onChange={(e) => setBuyTokenwallet(e.target.value)} 
                  className="form-input"
                >
                  <option value="">Select Buy Token</option>
                  <option value="BTC">BTC</option>
                  <option value="ZEC">ZEC</option>
                  <option value="NEAR">NEAR</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="AURORA">AURORA</option>
                  <option value="TURBO">TURBO</option>
                  <option value="SWEAT">SWEAT</option>
                </select>
              </div>


              <div className="form-group">
                <label>Buy Chain</label>
                <select 
                  value={buyChainwallet} 
                  onChange={(e) => setBuyChainwallet(e.target.value)} 
                  className="form-input"
                  >
                  <option value="">Select chain</option>
                  {chainCompute(buyTokenwallet).map(chain => (chain === "bitcoin" || chain === "zec" || chain === "near") && (
                    <option key={chain} value={chain}>{chain}</option>
                  ))}
                </select>
              </div>
            </div>

            {buyTokenwallet === "BTC" && (
              <div className={`status-message success`}>
              {`Your derived btc address is: ${derivedbtcaddress}`}
              </div>
            )}

            {buyTokenwallet === "ZEC" && (
              <div className={`status-message success`}>
              {`Your zec address is: ${zecaccountaddr}`}
              </div>
            )}

            {buyTokenwallet === "NEAR"  && (
              <div className={`status-message success`}>
              {`Your near address is: ${nearaccount}`}
              </div>
            )}
            
            {buyTokenwallet === "BTC" && (
              <div className="form-group">
                <label>BTC withdraw Address</label>
                <input
                  type="string"
                  value={btcreciveraddr}
                  onChange={(e) => setbtcreciveraddr(e.target.value)}
                  placeholder="BTC Address to withdraw"
                  className="form-input"
                />
              </div>
            )}

            {buyTokenwallet === "ZEC" && (
              <div className="form-group">
                <label>Zcash Address TO</label>
                <input
                  type="string"
                  value={zwalletbuyreceiver}
                  onChange={(e) => setzwalletbuyreceiver(e.target.value)}
                  placeholder="Zcash Address to send to"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amountswapwallet}
                onChange={(e) => setAmountswapwallet(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isLoadingswapwallet ? "Swapping..." : "Wallet SWAP"}
            </button>
            
            {button_type === "directWalletSwap" && (transaction_status === "success" || transaction_status === "failed"  ) && (
              <div className={`status-message ${transaction_status}`}>
                {transaction_status === "success" 
                  ? `Wallet SWAP successfully with transaction id's: deposit: ${deposittxid}, swap: ${swaptxid}, withdraw: ${withdrawtxid}` 
                  : `Wallet SWAP failed due to Internal server error`}
              </div>
            )}
          </form>
        </section>

        {/* Transfer Section */}
        <section className="section-container">
          <h2 className="section-title">Transfer To Other Wallet</h2>
          <form onSubmit={transferToOtherWallet} className="form-container">
            <div className="form-group">
              <label>Token</label>
              <select 
                value={transfertoken} 
                onChange={(e) => settransfertoken(e.target.value)} 
                className="form-input"
              >
                <option value="">Select Token</option>
                <option value="NEAR">NEAR</option>
                <option value="ZEC">ZEC</option>
                <option value="BTC">BTC</option>
              </select>
            </div>

            {transfertoken === "BTC" && (
              <div className={`status-message success`}>
              {`Your derived btc address is: ${derivedbtcaddress}`}
              </div>
            )}

            {transfertoken === "ZEC" && (
              <div className={`status-message success`}>
              {`Your zec address is: ${zecaccountaddr}`}
              </div>
            )}

            {transfertoken === "NEAR"  && (
              <div className={`status-message success`}>
              {`Your near address is: ${nearaccount}`}
              </div>
            )}

            {transfertoken === "ZEC" && (
              <div className="form-group">
                <label>Zcash Address</label>
                <input
                  type="string"
                  value={transfersender}
                  onChange={(e) => settransfersender(e.target.value)}
                  placeholder="Zcash Address to send from"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                value={transferrecipientAddress}
                onChange={(e) => settranferAddress(e.target.value)}
                placeholder="Recipient Address"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={amounttransfer}
                onChange={(e) => setAmounttranfer(e.target.value)}
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isLoadingtransfer ? "Transferring..." : "Transfer To other Wallet"}
            </button>
            
            {button_type === "transferToOtherWallet" && (transaction_status === "success" || transaction_status === "failed"  ) && (
              <div className={`status-message ${transaction_status}`}>
                {transaction_status === "success" 
                  ? `Transfer To other Wallet successfully with transaction id: ${txid}` 
                  : `Transfer To other Wallet failed due to Internal server error`}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
