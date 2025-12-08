// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

contract OperatorRegistry {
    struct OperatorInfo {
        address operator;
        bool isPaused;
    }

    address[] public operatorsArr;
    mapping(address => OperatorInfo) public operatorsLedger; // operator address to operator info

    event OperatorAdded(address indexed newOperator);
    event OperatorPaused(address indexed operator);
    event OperatorUnpaused(address indexed operator);

    function addOperator(address newOperator) external {
        require(newOperator != address(0), "invalid operator");
        require(operatorsLedger[newOperator].operator == address(0), "already exists");
        operatorsLedger[newOperator] = OperatorInfo({operator: newOperator, isPaused: false});
        operatorsArr.push(newOperator);

        emit OperatorAdded(newOperator);
    }

    function pauseOperator(address operator) external {
        require(operator != address(0), "invalid operator");
        require(operatorsLedger[operator].operator != address(0), "not found");
        operatorsLedger[operator].isPaused = true;

        emit OperatorPaused(operator);
    }

    function unpauseOperator(address operator) external {
        require(operator != address(0), "invalid operator");
        require(operatorsLedger[operator].operator != address(0), "not found");
        operatorsLedger[operator].isPaused = false;

        emit OperatorUnpaused(operator);
    }

    function getOperators(uint256 cursor, uint256 size) external view returns (OperatorInfo[] memory, uint256) {
        uint256 length = size;

        if (length > operatorsArr.length - cursor) {
            length = operatorsArr.length - cursor;
        }

        OperatorInfo[] memory operatorsPayload = new OperatorInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            operatorsPayload[i] = operatorsLedger[operatorsArr[cursor + i]];
        }

        return (operatorsPayload, cursor + length);
    }

    function getOperatorsLength() external view returns (uint256) {
        return operatorsArr.length;
    }
}
