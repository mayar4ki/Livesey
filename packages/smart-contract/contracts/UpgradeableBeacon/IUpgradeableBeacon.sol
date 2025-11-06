// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

/**
 * @title IUpgradeableBeacon
 * @notice Interface for the UpgradeableBeacon contract
 */
interface IUpgradeableBeacon {
    /**
     * @dev Must return an address that can be used as a delegate call target.
     * @return implementation address
     */
    function implementation() external view returns (address);

    /**
     * @dev Upgrades the beacon to a new implementation.
     * @param newImplementation: new implementation address
     */
    function upgradeTo(address newImplementation) external;
}
