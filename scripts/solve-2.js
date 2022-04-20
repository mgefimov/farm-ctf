const { ethers } = require("hardhat");
async function run() {
  const magicSequenceAddress = "0x10E293117f15D6622E434682FE5F36f4c594F51A";

  const MagicSequence = await ethers.getContractFactory("MagicSequence");
  const magicSequence = MagicSequence.attach(magicSequenceAddress);

  const MaginAttack = await ethers.getContractFactory("MagicAttack");
  const magicAttack = await MaginAttack.deploy(magicSequence.address);
  await magicAttack.deployed();

  const tx = await magicAttack.attack();
  await tx.wait();
}
run();