const serverUrl = "https://18hbfeok0v2n.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "qHpNS1YP9YSw7eTezY46ZrP3ZwAE0udKevTflxlf"; // Application id from moralis.io
const provider = 'walletconnect';

let user;
let web3;
let result = '';

let floki_uri1;
let floki_uri2;
let floki_uri3;

// Moralis.start({ serverUrl, appId });

// scrolling menu
$('.navbar-nav a[href^="#"]').click(async function(e) {
  e.preventDefault();
  var target = this.hash;
  
  if (this.id == 'connect_to_wallet') {
    try {
      // user = await Moralis.authenticate(/*{ provider }*/);
      web3 = await Moralis.enableWeb3(/*{ provider }*/);
      const accounts = await new web3.eth.getAccounts();
      let str = accounts[0];
      console.log('account[0]', str);
      this.innerHTML = str.slice(0, 5) + "..." + str.slice(-3, -1);
    } catch (error) {
        console.log('Login failed', error);
    }
  }
  if (target) {
    $('html, body').animate({
      scrollTop: $(target).offset().top -70
    },500);
  }
});

// mint
$('.hero-content a').click(async function(e) {
  await e.preventDefault();
  const contract_json = fetch('../floki.json')
    .then(response => {
      return response.json();
    })
    .then(data => {return data});
  const abi = await contract_json;
  if (typeof web3 == 'undefined') {
    alert('Wallet not connected!');
    return;
  }

  const accounts = await new web3.eth.getAccounts();
  const contract = await new web3.eth.Contract(abi.abi, '0x8ED15B1C342FC94292014fB354adbF1aF9eD3cBd');
  let total = parseInt(await contract.methods.totalSupply().call());
  if (this.id == 'id_mint') {
    // only for testing
    if (total == 0) {
        await contract.methods.registerMetadata(0, "https://ipfs.infura.io/ipfs/QmREs4YP1c9P91mK8sZgU3FHWKSgsazuwmtokyFHUsyGN8").send({from:accounts[0]});

        await contract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmXLpyswRGci38RExizpya79DnpLU5GpUQwL6Wyw1BGVQV").send({from:accounts[0]});
        await contract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmUqMuMmGVmZeWuxjjbqys7u1UiGqoSAJAquNezVeSDKRH").send({from:accounts[0]});
        await contract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmUQFByXKs8D6muHNZ3jmZfZFRnV94HoWphtzDVj3JsCo8").send({from:accounts[0]});
        await contract.methods.registerMetadata(1, "https://ipfs.infura.io/ipfs/QmfCGG2zzhkzpPapA5TDqKCa7ZbsoyjGQevcDvDmb4yAWD").send({from:accounts[0]});

        await contract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmUDe5hpqqDfou36jVbpNTeVWENW5RqaATyuFofCxTAAVg").send({from:accounts[0]});
        await contract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmdMKafm23nVtMssLch2SQAbA9ytPNxmB2XzTEvs2U3LHr").send({from:accounts[0]});
        await contract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/Qmdtt55yBirFbzX5aiNc9hYN87EDgVbbGHL8ZoDW9vNSMo").send({from:accounts[0]});
        await contract.methods.registerMetadata(2, "https://ipfs.infura.io/ipfs/QmZMBddDidggQ1ssWYXKfgGwbxgo5Z2fzPCXzs5pGvNCqa").send({from:accounts[0]});

        await contract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmYXEHFHiu5xNgRrUA2Rzz1iTMfrCYGjQgf2cVhtxNxUU4").send({from:accounts[0]});
        await contract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmWKHBgHxBaL5WRsFfPY7p6KCMa1YNEkYFaU6z4giY1PxZ").send({from:accounts[0]});
        await contract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmbXf1c46g36qg7XvAV27P47bCQsR1dDmFAagCJMGQmeGT").send({from:accounts[0]});
        await contract.methods.registerMetadata(3, "https://ipfs.infura.io/ipfs/QmYD1vdExGLAN2ibY8zMDnnCNdZpMhpmfRcGUNwo8vWV7H").send({from:accounts[0]});

        await contract.methods.registerMetadata(4, "https://ipfs.infura.io/ipfs/QmSPZZyBkFuEqevAWKyKZQPNZGd6M2SBSQR2SPs73ucGzG").send({from:accounts[0]});

        await contract.methods.registerMetadata(5, "https://ipfs.infura.io/ipfs/QmaeAx35K2gzcgDqTmTkYQRLwkySUrX4bHXdr7QuhsKUu6").send({from:accounts[0]});
    }

    await contract.methods.mint().send({from:accounts[0]});
    total = parseInt(await contract.methods.totalSupply().call());
    floki_uri1 = floki_uri2;
    floki_uri2 = floki_uri3;
    floki_uri3 = await contract.methods.tokenURI(total).call();
    if (floki_uri3 == '')
      floki_uri3 = "Not Revealed";
  }
  else if (this.id == 'id_reveal') {
    await contract.methods.reveal(total).send({from:accounts[0]});
    floki_uri3 = await contract.methods.tokenURI(total).call();
    // console.log("[Token %d] URI : %s", tokenId, uri);
  }

  if (typeof floki_uri1 !== 'undefined')
    document.getElementById('floki1').innerHTML = floki_uri1;
  if (typeof floki_uri2 !== 'undefined')
    document.getElementById('floki2').innerHTML = floki_uri2;
  if (typeof floki_uri3 !== 'undefined')
    document.getElementById('floki3').innerHTML = floki_uri3;
});

// for change menu color
$('.navbar-nav  li').click(function(){
  $(this).addClass('active').siblings().removeClass('active');
});

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


