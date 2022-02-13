const serverUrl = "https://bv6zq2ky3bep.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "91XLclHS60fMzg3hPujNGtroF188g5QA4d7oPH43"; // Application id from moralis.io
const flokiContractAddr = "0xd9f505e5cd191cae1449012ad13929fdb998f81a";
const walletProvder = 'walletconnect';
let walletSelector = document.getElementById('wallet_selector');
let user;
let web3;
let result = '';
let flokiContract;
let mintFee;
let loggedIn;
let floki_uri1;
let floki_uri2;
let floki_uri3;

Moralis.start({ serverUrl, appId });

function err(errStr)
{
  alert(errStr);
}

const log_info = console.log;

function isMobileScreen() {
  var agent = navigator.userAgent;      
  var isWebkit = (agent.indexOf("AppleWebKit") > 0);      
  var isIPad = (agent.indexOf("iPad") > 0);      
  var isIOS = (agent.indexOf("iPhone") > 0 || agent.indexOf("iPod") > 0);     
  var isAndroid = (agent.indexOf("Android")  > 0);     
  var isNewBlackBerry = (agent.indexOf("AppleWebKit") > 0 && agent.indexOf("BlackBerry") > 0);     
  var isWebOS = (agent.indexOf("webOS") > 0);      
  var isWindowsMobile = (agent.indexOf("IEMobile") > 0);     
  var isSmallScreen = (screen.width < 767 || (isAndroid && screen.width < 1000));     
  var isUnknownMobile = (isWebkit && isSmallScreen);     
  var isMobile = (isIOS || isAndroid || isNewBlackBerry || isWebOS || isWindowsMobile || isUnknownMobile);
  var isTablet = (isIPad || (isMobile && !isSmallScreen));

  return isMobile || isTablet;
}

function disableScroll() {
  // Get the current page scroll position
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,

  // if any scroll is attempted, set this to the previous value
  window.onscroll = function() {
      window.scrollTo(scrollLeft, scrollTop);
  };
}

function enableScroll() {
  window.onscroll = function() {};
}

function awaiting(s) {
  document.getElementById('awaiting').style.display = s == 1 ? 'block' : 'none';
  if (s == 1) {
    disableScroll();
  } else {
    enableScroll();
  }
}

async function load_contract_abi(abiFile)
{
  const contract_json = fetch(abiFile)
    .then(response => {
      return response.json();
    })
    .then(data => {return data});
  const abi = await contract_json;
  return abi.abi;
}

async function showStatOfMint(totalMinted) {
  document.getElementById('count_of_minted').innerText = totalMinted + " of 3,003 minted";
}

async function flokiGetLastMintedNftId() {
  if (typeof flokiContract == undefined)
  {
    err('Not ready to use smart contract!(contract not loaded)');
    return false;
  }
  return parseInt(await flokiContract.methods.totalSupply().call());
}

async function updateNftFace(nftUiId, nftTokenId)
{
  let tokenURI;
  if (nftTokenId <= 0 || 
    (tokenURI = await flokiContract.methods.tokenURI(nftTokenId).call()) == '') {
    document.getElementById(nftUiId).innerHTML ='<img src="images/floki_queen_res.jpg" alt="">';  
    return;
  }
  const response = await fetch(tokenURI);
  const floki_json = await response.json();
  
  console.log("updateNftFace: ", floki_json.image, floki_json.attributes[0], document.getElementById(nftUiId).innerHTML);

  if (floki_json.image == undefined)
    return;
  
  // floki_json.image = "KingFloki_Common.mp4";
  document.getElementById(nftUiId).innerHTML =  
      '<video src="' + floki_json.image + 
      '" loop="true" poster="images/wait_for_video.gif" autoplay="autoplay" muted controls> </video>';
  console.log("modified html:", document.getElementById(nftUiId).innerHTML);

  // '<video src="" alt="" data-xblocker="passed" style="visibility: visible;">';  
  // document.getElementById(nftUiId).innerHTML = tokenURI == '' ? "Not Revealed" : tokenURI;
}

async function flokiUpdateNftFaces() {
  const lastNft = parseInt(await flokiGetLastMintedNftId(flokiContract));
  updateNftFace('floki1', lastNft-2);
  updateNftFace('floki2', lastNft-1);
  updateNftFace('floki3', lastNft);
  return lastNft;
}

async function flokiMint(mintingAcount, count) {
  const totalFee = mintFee.mul(web3.utils.toBN(count));
  await flokiContract.methods
      .batchMint(count)
      .send({from:mintingAcount, value: totalFee})
      .then(function(result) {
        log_info("Success to mint")})
      .catch(function(e) {
        err("Failed to mint!" + e.message);
      });
}

async function flokiReveal(account, tokenId) {
  await flokiContract.methods
      .reveal(tokenId)
      .send({from:account})
      .then(function(result) {
        log_info("Success to reveal")})
      .catch(function(e) {
        err("Failed to reveal! e = " + e.message);
      });
}

async function init(contract_addr)
{
  const abi = await load_contract_abi('../floki.json');
  if (typeof web3 == undefined) {
    err('You should login first!')
    return;
  }
  flokiContract = await new web3.eth.Contract(abi, contract_addr);
  mintFee = web3.utils.toBN(await flokiContract.methods.mintFeeValue().call());
  const mintedCount = await flokiUpdateNftFaces();
  showStatOfMint(mintedCount);
}

async function flokiUploadeAssetsForTesting()
{
  // only for testing
  await flokiContract.methods.registerMetadata(0, "https://ipfs.infura.io/ipfs/QmREs4YP1c9P91mK8sZgU3FHWKSgsazuwmtokyFHUsyGN8").send({from:accounts[0]});

  await flokiContract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmXLpyswRGci38RExizpya79DnpLU5GpUQwL6Wyw1BGVQV").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmUqMuMmGVmZeWuxjjbqys7u1UiGqoSAJAquNezVeSDKRH").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmUQFByXKs8D6muHNZ3jmZfZFRnV94HoWphtzDVj3JsCo8").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmfCGG2zzhkzpPapA5TDqKCa7ZbsoyjGQevcDvDmb4yAWD").send({from:accounts[0]});

  await flokiContract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmUDe5hpqqDfou36jVbpNTeVWENW5RqaATyuFofCxTAAVg").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmdMKafm23nVtMssLch2SQAbA9ytPNxmB2XzTEvs2U3LHr").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/Qmdtt55yBirFbzX5aiNc9hYN87EDgVbbGHL8ZoDW9vNSMo").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmZMBddDidggQ1ssWYXKfgGwbxgo5Z2fzPCXzs5pGvNCqa").send({from:accounts[0]});

  await flokiContract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmYXEHFHiu5xNgRrUA2Rzz1iTMfrCYGjQgf2cVhtxNxUU4").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmWKHBgHxBaL5WRsFfPY7p6KCMa1YNEkYFaU6z4giY1PxZ").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmbXf1c46g36qg7XvAV27P47bCQsR1dDmFAagCJMGQmeGT").send({from:accounts[0]});
  await flokiContract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmYD1vdExGLAN2ibY8zMDnnCNdZpMhpmfRcGUNwo8vWV7H").send({from:accounts[0]});

  await flokiContract.methods.registerMetadata(4, "https://ipfs.infura.io/ipfs/QmSPZZyBkFuEqevAWKyKZQPNZGd6M2SBSQR2SPs73ucGzG").send({from:accounts[0]});

  await flokiContract.methods.registerMetadata(5, "https://ipfs.infura.io/ipfs/QmaeAx35K2gzcgDqTmTkYQRLwkySUrX4bHXdr7QuhsKUu6").send({from:accounts[0]});
}

// connect to wallet
let btnCloseWalletSelector = document.getElementById("modal_close");

btnCloseWalletSelector.onClick = function() {
  closeWalletSelector();
}

function closeWalletSelector() {
  walletSelector.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == walletSelector || 
    event.target == btnCloseWalletSelector) {
    closeWalletSelector();
  }
}

// scrolling menu
$('.navbar-nav a[href^="#"]').click(async function(e) {
  e.preventDefault();
  const target = this.hash;
  
  if (this.id == 'connect_to_wallet') {
    if (loggedIn == true) {
      Moralis.User.logOut();
      this.innerHTML = "WALLET CONNECT";
      loggedIn = false;
      web3 = undefined;
    }
    else if (isMobileScreen() == true) {
      login(this, 'walletconnect');
    }
    else {// show modal box to select serveral type of wallets including metamask
      walletSelector.style.display = "block";
    }
  }
  
  if (target) {
    $('html, body').animate({
      scrollTop: $(target).offset().top -70
    },500);
  }
});

// connect wallet
$('.wallet-item').click(async function(e) {
  await e.preventDefault();

  if (this.id == 'metamask') {
    await login(document.getElementById('connect_to_wallet'), '');
  }
  else if (this.id == 'wallet') {
    await login(document.getElementById('connect_to_wallet'), 'walletconnect');
  }
  closeWalletSelector();

  if (typeof web3 == 'undefined') {
    err('Wallet not connected!');
    return;
  }
});

// mint
$('.hero-content a').click(async function(e) {
  await e.preventDefault();

  const [account] = await new web3.eth.getAccounts();
  let lastNftId = parseInt(await flokiContract.methods.totalSupply().call());

  awaiting(1);
  if (this.id == 'id_mint') {
    // if (lastNftId == 0)
    //   flokiUploadeAssetsForTesting();
    await flokiMint(account, 1);
    lastNftId = await flokiGetLastMintedNftId();
    showStatOfMint(lastNftId);
    floki_uri3 = await flokiContract.methods.tokenURI(lastNftId).call();
    if (floki_uri3 == '')
      floki_uri3 = "Not Revealed";
  }
  else if (this.id == 'id_reveal') {
    floki_uri3 = await flokiContract.methods.tokenURI(lastNftId).call();
    if (floki_uri3 == '') // not revealed
    {
      await flokiReveal(account, lastNftId);
      floki_uri3 = await flokiContract.methods.tokenURI(lastNftId).call();
    }
    else {
      err("This NFT is already revealed!");
    }
  }
  awaiting(0);
});

// for change menu color
$('.navbar-nav  li').click(function(){
  $(this).addClass('active').siblings().removeClass('active');
});

async function login(owner, walletType) {
  log_info("Trying to connect to ", walletType ? walletType : 'metamask');
  awaiting(1);
  try {
    if (walletType == '') { // metamask
      user = await Moralis.authenticate();
      web3 = await Moralis.enableWeb3();
    } else { // wallet
      user = await Moralis.Web3.authenticate({ provider : walletType });
      web3 = await Moralis.Web3.enable({ provider : walletType });
    }

	  if (typeof web3 === undefined) {
      err('Failed to enable web3 via moralis');
      return false;
    }
	  if (typeof web3.eth === undefined) {
      err('undefined web3.eth');
      return false;
    }
    const [account] = await new web3.eth.getAccounts();
    
    owner.innerHTML = account.slice(0, 5) + "..." + account.slice(-3, -1);
    if (typeof user === undefined) {
      err('Failed to authencate via moralis');
      return false;
    }
    if (typeof web3 === undefined) {
      err('Failed to enable web3 via moralis');
      return false;
    }
    log_info("Success to login");
    owner.setAttribute('logState', '1');
    init(flokiContractAddr);
  } catch (error) {
    err("User cancelled to login! err = " + error.message);
    awaiting(0);
    return false;
  }
  awaiting(0);
  loggedIn = true;
  return true;
}

function logOut(owner)
{
  err('logout');
  owner.setAttribute('logState', '0');
}

function showCards(window, url)
{

}
/* Faq Questions =============================================================*/ 
const accordionItemHeaders = document.querySelectorAll(".accordion-item-header");

accordionItemHeaders.forEach(accordionItemHeader => {
  accordionItemHeader.addEventListener("click", event => {
    
    
     const currentlyActiveAccordionItemHeader = document.querySelector(".accordion-item-header.active");
     if(currentlyActiveAccordionItemHeader && currentlyActiveAccordionItemHeader!==accordionItemHeader) {
       currentlyActiveAccordionItemHeader.classList.toggle("active");
       currentlyActiveAccordionItemHeader.nextElementSibling.style.maxHeight = 0;
     }

    accordionItemHeader.classList.toggle("active");
    const accordionItemBody = accordionItemHeader.nextElementSibling;
    if(accordionItemHeader.classList.contains("active")) {
      accordionItemBody.style.maxHeight = accordionItemBody.scrollHeight + "px";
    }
    else {
      accordionItemBody.style.maxHeight = 0;
    }
    
  });
});


