// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ERC20FundingPool
 * @notice Simple ERC20-only funding pool.
 *         - Users deposit a specific ERC20 token.
 *         - Tracks contributions per address.
 *         - Owner withdraws to treasury.
 *         - Uses balance-delta accounting to support fee-on-transfer tokens.
 */
contract ERC20FundingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public treasury;

    /// @notice Lifetime total tokens received by this pool
    uint256 public totalReceived;

    /// @notice Lifetime contribution per address
    mapping(address => uint256) public contributions;

    event Deposited(address indexed from, uint256 amountReceived);
    event Withdrawn(address indexed to, uint256 amount);
    event TreasuryChanged(address indexed oldTreasury, address indexed newTreasury);

    constructor(IERC20 _token, address _treasury, address _owner) Ownable(_owner) {
        require(address(_token) != address(0), "Token is zero");
        require(_treasury != address(0), "Treasury is zero");

        token = _token;
        treasury = _treasury;

        _transferOwnership(msg.sender);
    }

    /**
     * @notice Deposit tokens into the pool.
     * @dev User must approve this contract first.
     *      Uses balance delta to handle fee-on-transfer tokens.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");

        uint256 beforeBal = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 afterBal = token.balanceOf(address(this));

        uint256 received = afterBal - beforeBal;
        require(received > 0, "Nothing received");

        contributions[msg.sender] += received;
        totalReceived += received;

        emit Deposited(msg.sender, received);
    }

    /// @notice Change treasury address.
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury is zero");
        address old = treasury;
        treasury = _treasury;
        emit TreasuryChanged(old, _treasury);
    }

    /// @notice Withdraw a specific amount to treasury.
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Zero amount");

        uint256 bal = token.balanceOf(address(this));
        require(amount <= bal, "Insufficient balance");

        token.safeTransfer(treasury, amount);
        emit Withdrawn(treasury, amount);
    }

    /// @notice Withdraw full contract balance to treasury.
    function withdrawAll() external onlyOwner nonReentrant {
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "Nothing to withdraw");

        token.safeTransfer(treasury, bal);
        emit Withdrawn(treasury, bal);
    }
}
