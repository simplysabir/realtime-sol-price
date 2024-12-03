import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolPriceFeed } from "../target/types/sol_price_feed";
import { assert } from "chai";

const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";
// SOL/USD feed account
// const CHAINLINK_FEED = "669U43LNHx7LsVj95uYksnhXUfWKDsdzVqev3V4Jpw3P";
const CHAINLINK_FEED = "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR";
const DIVISOR = 100000000;

describe("sol-price-feed", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolPriceFeed as Program<SolPriceFeed>;
  const provider = anchor.AnchorProvider.local();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;

  //create an account to store the price data
  const priceFeedAccount = anchor.web3.Keypair.generate();



  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
    .initialize()
    .accounts({
      user: wallet.publicKey,
      decimal: priceFeedAccount.publicKey, // Pass the public key here
      chainlinkFeed: CHAINLINK_FEED,
      chainlinkProgram: CHAINLINK_PROGRAM_ID,
    })
    .signers([priceFeedAccount]) // Sign with the priceFeedAccount
    .rpc();

    console.log("Your transaction signature", tx);

    // Fetch the account details of the account containing the price data
    const latestPrice = await program.account.decimal.fetch(priceFeedAccount.publicKey);
    console.log(Buffer.from(latestPrice.value.toString()).toString());
    console.log('Price Is: ' + Number(latestPrice.value) / DIVISOR)

    // Ensure the price returned is a positive value
    assert.ok(Number(latestPrice.value) / DIVISOR > 0);
  });
});
