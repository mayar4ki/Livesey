// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

/**
 * @title IERC20Implementation
 * @notice Interface for ERC20Implementation initialization
 */
interface IERC20Implementation {
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        bytes32 _assetRefHash,
        address _operator,
        address _initialRecipient
    ) external;

    function pause() external;

    function unpause() external;

    function transferOperability(address newOperator) external;
}
