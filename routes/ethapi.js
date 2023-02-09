var express = require("express");
var router = express.Router();
require('dotenv').config();

const ethers = require('ethers'); // Load Ethers library
const SampleToken = require("../Barter.json");

const SampleTokenAddress = "0xDAAe46e4B58cd6E1a892F51262CC3421034fF30B";
const providerURL = 'https://rpc.api.moonbase.moonbeam.network';
// Define provider
const provider = new ethers.JsonRpcProvider(providerURL);

const contract = new ethers.Contract(SampleTokenAddress, SampleToken.abi, provider);
const signerPrivateKey = process.env.REACT_APP_PRIVATE_KEY;

let walletSigner = new ethers.Wallet(signerPrivateKey, provider);
const readWriteContract = new ethers.Contract(SampleTokenAddress, SampleToken.abi, walletSigner);

async function sendMatch(arr) {
  // account private key, provider
  console.log(`arr: ${arr}`);
  //const transaction = await readWriteContract.submit_match(arr);
  const transaction = await readWriteContract.store(arr[0]);
  await transaction.wait();
  console.log("sendtx successfully ");
}


router.get("/orders", async function (req, res) {
  let oids = await contract.getoid();
  console.log("#####oids ", oids);

  res.send(oids.toString());

  res.end();
});


router.post("/match/:oid1/:oid2", async function (req, res) {
  //parse
  const params = req.params;
  await sendMatch([params.oid1, params.oid2])

  res.send("ok");

  res.end();
});

module.exports = router;