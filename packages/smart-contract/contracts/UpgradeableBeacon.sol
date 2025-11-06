// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {UpgradeableBeacon as _UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/**
 * @title UpgradeableBeacon
 * @notice UpgradeableBeacon contract to manage the upgradeable beacon
 */
contract UpgradeableBeacon is _UpgradeableBeacon {
    /**
     * @notice Constructor
     * @param _implementation: implementation address
     * @param _initialOwner: initial owner address
     */
    constructor(
        address _implementation,
        address _initialOwner
    ) _UpgradeableBeacon(_implementation, _initialOwner) {}
}
