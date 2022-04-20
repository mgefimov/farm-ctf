const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");
async function run() {
  const provider = waffle.provider;
  const [owner] = await ethers.getSigners();

  const address = "0x6768b8349BA43c98019a5d092A02e94D03Fd9322";

  const SuicideBoy = await ethers.getContractFactory("SuicideBoy");
  const suicideBoy = await SuicideBoy.deploy(address);
  await suicideBoy.deployed();

  const ownerBalance = await provider.getBalance(owner.address);
  console.log('owner balance:', ownerBalance);
  const sendTx = await owner.sendTransaction({to: suicideBoy.address, value: BigNumber.from("42")});

  await sendTx.wait();

  const suicideBoyBalance = await provider.getBalance(suicideBoy.address);
  console.log('suicideBoy balance:', suicideBoyBalance);

  const dieTx = await suicideBoy.die();
  await dieTx.wait();

  const unpayableBalance = await provider.getBalance(address);
  console.log("unpayable balance:", unpayableBalance);
}
run();