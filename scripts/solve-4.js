const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");
async function run() {
  const provider = waffle.provider;
  const [owner] = await ethers.getSigners();

  const contractAddress = "0x9e560C5f21C63f50260E1480106be26cf69Ce3e8";
  const SecureSwap = await ethers.getContractFactory("SecureSwap");
  const secureSwap = SecureSwap.attach(contractAddress);

  const contractBalance = await provider.getBalance(secureSwap.address);
  console.log(contractBalance);

  const wmov = await ethers.getContractAt("IERC20", "0x98878B06940aE243284CA214f92Bb71a2b032B8A");

  const wmovBalanceBefore = await wmov.balanceOf(secureSwap.address);
  console.log(wmovBalanceBefore);

  let ABI = [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address []calldata path, address to, uint256 deadline)"
  ];
  let iface = new ethers.utils.Interface(ABI);
  let data = iface.encodeFunctionData("swapExactTokensForTokens", [ BigNumber.from('10000000000000000'), BigNumber.from('900000000000'), ['0x98878B06940aE243284CA214f92Bb71a2b032B8A', '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844'], secureSwap.address, BigNumber.from('1650484255')])
  const tx2 = await secureSwap.swap(data, {gasLimit: 500000});
  await tx2.wait();
  
  const wmovBalanceAfter = await wmov.balanceOf(secureSwap.address);
  console.log(wmovBalanceAfter);
}

run();