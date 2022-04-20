// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

contract SuicideBoy {
    address idol;

    constructor(address _idol) {
        idol = _idol;
    }

    receive() external payable {}

    function die() external {
        selfdestruct(payable(idol));
    }
}

contract Unpayable {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    fallback() external {
        revert("doesn't accept funds");
    }

    function putMoney() external payable {
        require(msg.value > 500 ether, "doesn't accept too small amount");
    }

    function refund(address payable who) external {
        require(msg.sender == owner, "only owner can call refund");
        who.transfer(address(this).balance);
    }
}
