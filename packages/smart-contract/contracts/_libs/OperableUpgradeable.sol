// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Operable.sol)

pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an operator) that can be granted exclusive access to
 * specific functions.
 *
 * The initial operator is set to the address provided by the deployer. This can
 * later be changed with {transferOperability}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOperator`, which can be applied to your functions to restrict their use to
 * the operator.
 */
abstract contract OperableUpgradeable is Initializable, ContextUpgradeable {
    /// @custom:storage-location erc7201:openzeppelin.storage.Operable
    struct OperableStorage {
        address _operator;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.Operable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant OperableStorageLocation =
        0x2db3c6704440dc7710560c708b8061a5c2ece88721ef92ea7f8dce53123f8f00;

    function _getOperableStorage() private pure returns (OperableStorage storage $) {
        assembly {
            $.slot := OperableStorageLocation
        }
    }

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OperableUnauthorizedAccount(address account);

    /**
     * @dev The operator is not a valid operator account. (eg. `address(0)`)
     */
    error OperableInvalidOperator(address operator);

    event OperabilityTransferred(address indexed previousOperator, address indexed newOperator);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial operator.
     */
    function __Operable_init(address initialOperator) internal onlyInitializing {
        __Operable_init_unchained(initialOperator);
    }

    function __Operable_init_unchained(address initialOperator) internal onlyInitializing {
        if (initialOperator == address(0)) {
            revert OperableInvalidOperator(address(0));
        }
        _transferOperability(initialOperator);
    }

    /**
     * @dev Throws if called by any account other than the operator.
     */
    modifier onlyOperator() {
        _checkOperator();
        _;
    }

    /**
     * @dev Returns the address of the current operator.
     */
    function operator() public view virtual returns (address) {
        OperableStorage storage $ = _getOperableStorage();
        return $._operator;
    }

    /**
     * @dev Throws if the sender is not the operator.
     */
    function _checkOperator() internal view virtual {
        if (operator() != _msgSender()) {
            revert OperableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Transfers operability of the contract to a new account (`newOperator`).
     * Can only be called by the current operator.
     */
    function transferOperability(address newOperator) public virtual onlyOperator {
        if (newOperator == address(0)) {
            revert OperableInvalidOperator(address(0));
        }
        _transferOperability(newOperator);
    }

    /**
     * @dev Transfers operability of the contract to a new account (`newOperator`).
     * Internal function without access restriction.
     */
    function _transferOperability(address newOperator) internal virtual {
        OperableStorage storage $ = _getOperableStorage();
        address oldOperator = $._operator;
        $._operator = newOperator;
        emit OperabilityTransferred(oldOperator, newOperator);
    }
}
