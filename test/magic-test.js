const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe('Magic', async () => {
  it('Try numbers', async () => {
    
    const [owner] = await ethers.getSigners();

    const MagicSequence = await ethers.getContractFactory("MagicSequence");
    const magicSequence = await MagicSequence.deploy();
    await magicSequence.deployed();

    const MagicAttack = await ethers.getContractFactory("MagicAttack");
    const magicAttack = await MagicAttack.deploy(magicSequence.address);
    await magicAttack.deployed();

    const tx = await magicAttack.attack();
    await tx.wait();
  })
})