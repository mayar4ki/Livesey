// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AccessControlled
 * @notice AccessControlled contract to manage the access control
 */
abstract contract AccessControlled is Ownable, Pausable {
    address private _admin; // address of the admin

    constructor(
        address _ownerAddress,
        address _adminAddress
    ) Ownable(_ownerAddress) {
        _admin = _adminAddress;
    }

    event Pause();
    event Unpause();
    event NewAdminAddress(address admin);

    modifier onlyAdmin() {
        require(msg.sender == _admin, "Not admin");
        _;
    }

    /**
     * @notice Set admin address
     */
    function setAdmin(address _adminAddress) external onlyOwner {
        require(_adminAddress != address(0), "Cannot be zero address");
        _admin = _adminAddress;

        emit NewAdminAddress(_adminAddress);
    }

    /**
     * @notice called by the admin to unpause, returns to normal state
     */
    function unpause() external whenPaused onlyOwner {
        _unpause();
        emit Unpause();
    }

    /**
     * @notice called by the admin to pause, triggers stopped state
     */
    function pause() external whenNotPaused onlyOwner {
        _pause();
        emit Pause();
    }

    /**
     * @dev Returns the address of the current admin.
     */
    function admin() public view virtual returns (address) {
        return _admin;
    }
}
