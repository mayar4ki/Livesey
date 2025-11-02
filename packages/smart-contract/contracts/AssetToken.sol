// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetToken is ERC20 {
    // Ledger entry structure
    struct LedgerEntry {
        uint256 id;
        address account;
        uint256 amount;
        string description;
        uint256 timestamp;
        bool exists;
    }

    // Mapping to store ledger entries by ID
    mapping(uint256 => LedgerEntry) private ledger;
    
    // Counter for ledger entries
    uint256 private ledgerCounter;
    
    // Mapping to track entries by account
    mapping(address => uint256[]) private accountEntries;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        ledgerCounter = 0;
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @dev Write an entry to the ledger
     * @param account The account address
     * @param amount The amount related to this entry
     * @param description Description of the ledger entry
     */
    function writeToLedger(
        address account,
        uint256 amount,
        string memory description
    ) public returns (uint256) {
        ledgerCounter++;
        
        ledger[ledgerCounter] = LedgerEntry({
            id: ledgerCounter,
            account: account,
            amount: amount,
            description: description,
            timestamp: block.timestamp,
            exists: true
        });
        
        accountEntries[account].push(ledgerCounter);
        
        return ledgerCounter;
    }

    /**
     * @dev Read a ledger entry by ID
     * @param entryId The ID of the ledger entry to read
     * @return id The entry ID
     * @return account The account address
     * @return amount The amount
     * @return description The description
     * @return timestamp The timestamp when the entry was created
     */
    function readFromLedger(uint256 entryId)
        public
        view
        returns (
            uint256 id,
            address account,
            uint256 amount,
            string memory description,
            uint256 timestamp
        )
    {
        require(ledger[entryId].exists, "Ledger entry does not exist");
        
        LedgerEntry memory entry = ledger[entryId];
        
        return (
            entry.id,
            entry.account,
            entry.amount,
            entry.description,
            entry.timestamp
        );
    }

    /**
     * @dev Get all ledger entry IDs for a specific account
     * @param account The account address
     * @return An array of ledger entry IDs
     */
    function getAccountLedgerEntries(address account)
        public
        view
        returns (uint256[] memory)
    {
        return accountEntries[account];
    }

    /**
     * @dev Get the total number of ledger entries
     * @return The total count of ledger entries
     */
    function getLedgerCount() public view returns (uint256) {
        return ledgerCounter;
    }
}
