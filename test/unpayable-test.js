const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("Unpayable", function () {
  it("Send ethers", async function () {
    const provider = waffle.provider;
    const [owner] = await ethers.getSigners();

    const Unpayable = await ethers.getContractFactory("Unpayable");
    const unpayableAddress = "0x6768b8349BA43c98019a5d092A02e94D03Fd9322";
    const unpayable = Unpayable.attach(unpayableAddress);

    const SuicideBoy = await ethers.getContractFactory("SuicideBoy");
    const suicideBoy = await SuicideBoy.deploy(unpayable.address);
    await suicideBoy.deployed();

    const sendTx = await owner.sendTransaction({to: suicideBoy.address, value: BigNumber.from("42")});

    await sendTx.wait();

    
    const unpayableBalanceBefore = await provider.getBalance(unpayable.address);
    expect(unpayableBalanceBefore).to.eq(BigNumber.from('0'))

    const dieTx = await suicideBoy.die();
    await dieTx.wait();

    const unpayableBalanceAfter = await provider.getBalance(unpayable.address);
    expect(unpayableBalanceAfter).to.eq(BigNumber.from('42'))
  });
});
