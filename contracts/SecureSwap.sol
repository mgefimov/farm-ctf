// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
import "hardhat/console.sol";

interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

interface IWMOVR {
    function deposit() external payable;
}

contract SecureSwap {
    uint256 public constant IN_AMOUNT_OFFSET = 4;
    uint256 public constant IN_TOKEN_OFFSET = 4 + 32 + 32 + 32 + 32 + 32 + 32;
    uint256 public constant OUT_TOKEN_OFFSET =
        4 + 32 + 32 + 32 + 32 + 32 + 32 + 32;
    uint256 public constant TO_ADDRESS_OFFSET = 4 + 32 + 32 + 32;

    address public constant WMOVR = 0x98878B06940aE243284CA214f92Bb71a2b032B8A;

    address public constant SOLAR_ROUTER =
        0xAA30eF758139ae4a7f798112902Bf6d65612045f;

    address[] public ALLOWED_TOKENS;

    constructor() {
        // pushing tokens allowed for trading
        ALLOWED_TOKENS.push(0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D); //USDC
        ALLOWED_TOKENS.push(0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080); //xcKSM
        ALLOWED_TOKENS.push(WMOVR);
    }

    function deposit() external payable {
        // deposit MOVRs and convert ot WMOVR
        IWMOVR(WMOVR).deposit{value: msg.value}();
    }

    function swap(bytes calldata data) external returns (bool, bytes memory) {
        // encoded with selector data
        uint256 inAmount = _inAmount(data);
        address inToken = _inToken(data);
        address outToken = _outToken(data);
        address to = _to(data);
        console.log("inAmount", inAmount);
        console.log("inToken", inToken);
        console.log("outToken", outToken);
        console.log("to", to);
        require(
            IERC20(inToken).balanceOf(address(this)) >= inAmount,
            "not enough balance"
        );
        require(_checkTokenAllowed(outToken), "token not allowed");
        require(to == address(this), "wrong reciever");

        IERC20(inToken).approve(SOLAR_ROUTER, inAmount);
        return SOLAR_ROUTER.call(data);
    }

    function sweep(address token) external {
        // sweep airdrop or donations
        require(!_checkTokenAllowed(token), "token protected");

        IERC20(token).transfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
    }

    function _checkTokenAllowed(address _token) internal view returns (bool) {
        for (uint256 i = 0; i < ALLOWED_TOKENS.length; i++) {
            if (ALLOWED_TOKENS[i] == _token) {
                return true;
            }
        }
        return false;
    }

    function _inAmount(bytes memory _data) internal pure returns (uint256) {
        return _toUint256(_data, IN_AMOUNT_OFFSET);
    }

    function _to(bytes memory _data) internal pure returns (address) {
        return address(uint160(_toUint256(_data, TO_ADDRESS_OFFSET)));
    }

    function _inToken(bytes memory _data) internal pure returns (address) {
        return address(uint160(_toUint256(_data, IN_TOKEN_OFFSET)));
    }

    function _outToken(bytes memory _data) internal pure returns (address) {
        return address(uint160(_toUint256(_data, OUT_TOKEN_OFFSET)));
    }

    // extract uint256 from data
    function _toUint256(bytes memory _bytes, uint256 _start)
        internal
        pure
        returns (uint256)
    {
        require(_start + 32 >= _start, "toUint256_overflow");
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }
}
