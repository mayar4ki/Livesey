// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title MultiSig
 * @notice A multi-signature wallet contract that requires multiple owners to approve transactions
 * @dev Uses OpenZeppelin's battle-tested cryptographic utilities and security patterns
 */
contract MultiSig is ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using SafeERC20 for IERC20;
    using Address for address payable;

    // ============ State Variables ============

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredConfirmations;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    Transaction[] public transactions;

    // txIndex => owner => confirmed
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // ============ Events ============

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);

    // ============ Errors ============

    error NotOwner();
    error TxDoesNotExist();
    error TxAlreadyExecuted();
    error TxAlreadyConfirmed();
    error TxNotConfirmed();
    error InsufficientConfirmations();
    error TxFailed();
    error InvalidOwner();
    error OwnerAlreadyExists();
    error OwnerDoesNotExist();
    error InvalidRequirement();
    error CannotRemoveLastOwner();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    modifier onlyMultiSig() {
        if (msg.sender != address(this)) revert NotOwner();
        _;
    }

    modifier txExists(uint256 _txIndex) {
        if (_txIndex >= transactions.length) revert TxDoesNotExist();
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        if (transactions[_txIndex].executed) revert TxAlreadyExecuted();
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        if (isConfirmed[_txIndex][msg.sender]) revert TxAlreadyConfirmed();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize the multi-sig wallet with owners and required confirmations
     * @param _owners Array of initial owner addresses
     * @param _requiredConfirmations Number of confirmations required to execute a transaction
     */
    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        if (_owners.length == 0) revert InvalidRequirement();
        if (_requiredConfirmations == 0 || _requiredConfirmations > _owners.length) revert InvalidRequirement();

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            if (owner == address(0)) revert InvalidOwner();
            if (isOwner[owner]) revert OwnerAlreadyExists();

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _requiredConfirmations;
    }

    // ============ External Functions ============

    /**
     * @notice Receive ETH deposits
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    /**
     * @notice Submit a new transaction for approval
     * @param _to Destination address
     * @param _value ETH value to send
     * @param _data Transaction data (for contract calls)
     * @return txIndex Index of the submitted transaction
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner returns (uint256 txIndex) {
        txIndex = transactions.length;

        transactions.push(Transaction({to: _to, value: _value, data: _data, executed: false, confirmations: 0}));

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    /**
     * @notice Confirm a pending transaction
     * @param _txIndex Index of the transaction to confirm
     */
    function confirmTransaction(
        uint256 _txIndex
    ) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        transaction.confirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @notice Execute a confirmed transaction
     * @param _txIndex Index of the transaction to execute
     */
    function executeTransaction(
        uint256 _txIndex
    ) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) nonReentrant {
        Transaction storage transaction = transactions[_txIndex];

        if (transaction.confirmations < requiredConfirmations) {
            revert InsufficientConfirmations();
        }

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        if (!success) revert TxFailed();

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @notice Revoke a confirmation for a transaction
     * @param _txIndex Index of the transaction to revoke confirmation for
     */
    function revokeConfirmation(uint256 _txIndex) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        if (!isConfirmed[_txIndex][msg.sender]) revert TxNotConfirmed();

        Transaction storage transaction = transactions[_txIndex];
        transaction.confirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    /**
     * @notice Add a new owner (must be called via multi-sig)
     * @param _owner Address of the new owner
     */
    function addOwner(address _owner) external onlyMultiSig {
        if (_owner == address(0)) revert InvalidOwner();
        if (isOwner[_owner]) revert OwnerAlreadyExists();

        isOwner[_owner] = true;
        owners.push(_owner);

        emit OwnerAdded(_owner);
    }

    /**
     * @notice Remove an owner (must be called via multi-sig)
     * @param _owner Address of the owner to remove
     */
    function removeOwner(address _owner) external onlyMultiSig {
        if (!isOwner[_owner]) revert OwnerDoesNotExist();
        if (owners.length == 1) revert CannotRemoveLastOwner();

        isOwner[_owner] = false;

        // Find and remove the owner from the array
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        // Adjust required confirmations if necessary
        if (requiredConfirmations > owners.length) {
            requiredConfirmations = owners.length;
            emit RequirementChanged(requiredConfirmations);
        }

        emit OwnerRemoved(_owner);
    }

    /**
     * @notice Change the number of required confirmations (must be called via multi-sig)
     * @param _required New number of required confirmations
     */
    function changeRequirement(uint256 _required) external onlyMultiSig {
        if (_required == 0 || _required > owners.length) {
            revert InvalidRequirement();
        }

        requiredConfirmations = _required;
        emit RequirementChanged(_required);
    }

    /**
     * @notice Transfer ERC20 tokens from the wallet (must be submitted as a transaction)
     * @param _token Address of the ERC20 token
     * @param _to Recipient address
     * @param _amount Amount to transfer
     * @dev This function should be called via submitTransaction with encoded data
     */
    function transferERC20(address _token, address _to, uint256 _amount) external onlyMultiSig {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get all owners
     * @return Array of owner addresses
     */
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    /**
     * @notice Get the number of owners
     * @return Number of owners
     */
    function getOwnerCount() external view returns (uint256) {
        return owners.length;
    }

    /**
     * @notice Get the total number of transactions
     * @return Transaction count
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /**
     * @notice Get transaction details
     * @param _txIndex Index of the transaction
     * @return to Destination address
     * @return value ETH value
     * @return data Transaction data
     * @return executed Whether the transaction has been executed
     * @return confirmations Number of confirmations
     */
    function getTransaction(
        uint256 _txIndex
    ) external view returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmations) {
        Transaction storage transaction = transactions[_txIndex];

        return (transaction.to, transaction.value, transaction.data, transaction.executed, transaction.confirmations);
    }

    /**
     * @notice Get pending transactions count
     * @return count Number of pending (not executed) transactions
     */
    function getPendingTransactionCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < transactions.length; i++) {
            if (!transactions[i].executed) {
                count++;
            }
        }
    }

    /**
     * @notice Check if a transaction has enough confirmations to be executed
     * @param _txIndex Index of the transaction
     * @return True if the transaction can be executed
     */
    function canExecute(uint256 _txIndex) external view returns (bool) {
        if (_txIndex >= transactions.length) return false;
        Transaction storage transaction = transactions[_txIndex];
        return !transaction.executed && transaction.confirmations >= requiredConfirmations;
    }

    /**
     * @notice Get the ETH balance of the wallet
     * @return The ETH balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get the ERC20 token balance of the wallet
     * @param _token Address of the ERC20 token
     * @return The token balance
     */
    function getTokenBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}
