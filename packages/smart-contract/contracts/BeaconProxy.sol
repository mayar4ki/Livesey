// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {BeaconProxy as _BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/**
 * @title BeaconProxy
 * @notice BeaconProxy contract to manage the beacon proxy
 */
contract BeaconProxy is _BeaconProxy {
    /**
     * @dev Initializes the proxy with `beacon`.
     *
     * If `data` is nonempty, it's used as data in a delegate call to the implementation returned by the beacon. This
     * will typically be an encoded function call, and allows initializing the storage of the proxy like a Solidity
     * constructor.
     *
     * Requirements:
     *
     * - `beacon` must be a contract with the interface {IBeacon}.
     * - If `data` is empty, `msg.value` must be zero.
     */
    constructor(
        address beacon,
        bytes memory data
    ) payable _BeaconProxy(beacon, data) {}
}
