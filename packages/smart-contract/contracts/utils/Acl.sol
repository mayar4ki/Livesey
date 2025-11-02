// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Acl is Ownable {
    function aa() public returns (uint256) {
        return 5 + 6;
    }

    function bb() public returns (uint256) {
        return 3 + 2;
    }
}
