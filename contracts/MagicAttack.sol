//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0;

interface Player {
    function number() external returns (uint256);
}

contract MagicSequence {
    bool public accepted;
    bytes4[] private hashes;

    constructor() {
        hashes.push(0xbeced095);
        hashes.push(0x42a7b7dd);
        hashes.push(0x45e010b9);
        hashes.push(0xa86c339e);
    }

    function start() public returns (bool) {
        Player player = Player(msg.sender);

        uint8 i = 0;
        while (i < 4) {
            if (
                bytes4(
                    uint32(
                        uint256(keccak256(abi.encodePacked(player.number()))) >>
                            224
                    )
                ) != hashes[i]
            ) {
                return false;
            }
            i++;
        }

        accepted = true;
        return true;
    }
}

contract MagicAttack is Player {
    uint256[] private nums;
    address magicSequence;
    uint256 i = 0;

    constructor(address _addr) {
        magicSequence = _addr;
        nums.push(42);
        nums.push(55);
        nums.push(256);
        nums.push(9876543);
    }

    function number() external override returns (uint256) {
        return nums[i++ % 4];
    }

    function attack() external {
        bool res = MagicSequence(magicSequence).start();
        require(res, "Solution incorrect");
    }
}
