// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

/**
 * @title IUpgradeableBeacon
 * @notice Interface for the UpgradeableBeacon contract
 */
interface IUpgradeableBeacon {
    /**
     * @dev Upgrades the beacon to a new implementation.
     * @param newImplementation: new implementation address
     */
    function upgradeTo(address newImplementation) external;
}
