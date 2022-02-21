import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import myEpicNft from "./utils/MyEpicNFT.json";

const CONTRACT_ADDRESS = "0xB14A10cBfb9d307f3Dc75a9FA8f540f49a1a7473";

const TWITTER_HANDLE = "emystiexx";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = " ";
const TOTAL_MINT_COUNT = 50;

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [opensea, setOpenSea] = useState("");

  const checkIfwalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ehereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Nework!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListner();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListner();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListner = () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setLoading(true);
          setOpenSea(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMessage("Minting... please wait.");
        await nftTxn.wait();
        setLoading(true);
        setMessage(
          `Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to wallet
    </button>
  );

  useEffect(() => {
    checkIfwalletIsConnected();
  });

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
          <br />
          {loading ? (
            <p className="message">
              Hey there! We've minted your NFT and sent it to your wallet. it
              may be blank right now. it can take a max of 10 min to show up on
              OpenSea. Here's the link:
              <a href={opensea}>View NFT</a>
            </p>
          ) : (
            <></>
          )}

          <br />
          {loading ? (
            <p className="message">{message}</p>
          ) : (
            <p className="message">{message}</p>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;
