// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {OperableUpgradeable} from "../_libs/OperableUpgradeable.sol";
import {ProfitableERC20Upgradeable} from "../_libs/ProfitableERC20Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AntiContractGuard} from "../_libs/AntiContractGuard.sol";

/**
 * @title ERC20Implementation
 * @notice ERC20Implementation contract to create a new token with ERC20 standard
 */
contract ERC20Implementation is
    ProfitableERC20Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    OperableUpgradeable,
    ReentrancyGuardUpgradeable,
    AntiContractGuard
{
    bytes32 public assetRefHash;
    // Storage gap
    uint256[50] private __gap;

    event NewOperatorAddress(address account);

    /**
     * @notice Disable initializers
     * @dev This is to prevent the contract from being initialized
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the token
     * @param _name: name of the token
     * @param _symbol: symbol of the token
     * @param _totalSupply: total supply of the token
     * @param _assetRefHash: asset reference hash
     * @param _operator: operator address
     * @param _initialRecipient: initial owner of the token supply (tokens go here)
     * @dev Callable by admin
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        bytes32 _assetRefHash,
        address _operator,
        address _initialRecipient,
        address _rewardToken
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __ProfitableERC20_init(_rewardToken);
        _mint(_initialRecipient, _totalSupply * (10 ** uint256(decimals())));

        // Owner will be the Factory Contract
        __Ownable_init(msg.sender);
        __Operable_init(_operator);
        __Pausable_init();
        __ReentrancyGuard_init();

        assetRefHash = _assetRefHash;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Transfers operability of the contract to a new account (`newOperator`).
     * Can only be called by the current owner.
     */
    function transferOperability(address newOperator) public override onlyOwner {
        if (newOperator == address(0)) {
            revert OperableInvalidOperator(address(0));
        }
        _transferOperability(newOperator);
    }

    /**
     * @notice returns to normal state
     * @dev called by owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice triggers stopped state
     * @dev called by owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }

    function withdrawDividend() external whenNotPaused nonReentrant notContract {
        _withdrawDividend();
    }

    function distributeDividends(uint256 amount) external whenNotPaused onlyOperator {
        _distributeDividends(amount);
    }
}
