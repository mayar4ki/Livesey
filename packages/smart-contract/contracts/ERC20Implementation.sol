// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
 * @title ERC20Implementation
 * @notice ERC20Implementation contract to create a new token with ERC20 standard
 */
contract ERC20Implementation is ERC20Upgradeable {
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
     * @param _owner: owner of the token
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _owner
    ) public initializer {
        __ERC20_init(_name, _symbol);
        _mint(_owner, _totalSupply);
    }

    function decimals() public pure override returns (uint8) {
        return 1;
    }
}
