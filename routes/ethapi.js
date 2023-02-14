var express = require("express");
var router = express.Router();
require('dotenv').config();

const ethers = require('ethers'); // Load Ethers library
const SampleToken = require("../Barter.json");

const SampleTokenAddress = "0x12609b58Fb6cd5bC0A4771658d8EC17722Af69b0";
const providerURL = 'https://rpc.api.moonbase.moonbeam.network';
// Define provider
const provider = new ethers.JsonRpcProvider(providerURL);

const contract = new ethers.Contract(SampleTokenAddress, SampleToken.abi, provider);
const signerPrivateKey = process.env.REACT_APP_PRIVATE_KEY;

let walletSigner = new ethers.Wallet(signerPrivateKey, provider);
const readWriteContract = new ethers.Contract(SampleTokenAddress, SampleToken.abi, walletSigner);

async function sendMatch(arr) {
  console.log(`sendMatch arr: ${arr}`);
  const transaction = await readWriteContract.autoMatchOrder(arr);
  await transaction.wait();
  console.log("sendMatch sendtx successfully ");
}

async function getUnFinishedOrders() {
  const oids = await readWriteContract.unFinishedOrders();
  let new_oids = [];
  for (let index = 0; index < oids.length; index++) {
    new_oids.push(oids[index]);
  }

  const orders = await readWriteContract.getFilterOrders(new_oids);
  return orders;
}

// Submit results directly
// router.post("/match/:oid1/:oid2", async function (req, res) {
//   //parse
//   const params = req.params;
//   await sendMatch([params.oid1, params.oid2])

//   res.send("ok");

//   res.end();
// });

function equar(a, b) {
  if (a.length !== b.length) {
      return false
  } else {
      for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
              return false
          }
      }
      return true;
  }
}

router.get("/triger_match", async function (req, res, next) {
  //get order info
  try {
    let orders = await getUnFinishedOrders();
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders.length; j++) {
        if (i === j) {
          continue;
        }
        const a = orders[i];
        const b = orders[j];

        console.log("#in count match", a, b);
        //count match oids pair
        if (
          a.base_address == b.target_address
          &&
          equar(a.base_nfts, b.target_nfts)
          &&
          equar(a.base_snfts, b.target_snfts)
        ) {
          //send match oids pair tx
          console.log("#in send match", a.order_index, b.order_index);
          await sendMatch([a.order_index.toString(), b.order_index.toString()]);
        }
      }
    }
    res.send("ok");
    res.end();
  } catch (err) {
    next(err)
  }

});


module.exports = router;