// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {AccessControlled} from "./_libs/AccessControlled.sol";
import {IERC20Implementation} from "./ERC20Implementation/IERC20Implementation.sol";
import {IUpgradeableBeacon} from "./UpgradeableBeacon/IUpgradeableBeacon.sol";

contract MockOperator {
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

/**
 * @title Factory
 * @notice Factory contract to create new tokens
 */
contract Factory is AccessControlled, MockOperator {
    address public immutable beaconAddress; // upgradeable beacon address

    struct TokenInfo {
        string name;
        string symbol;
        bytes32 assetRefHash;
        uint256 totalSupply;
        address operator;
        bool isPaused;
    }

    mapping(address => TokenInfo) public tokensLedger; // token address to token info

    event TokenCreated(
        address indexed createdToken,
        address indexed createdBy,
        string name,
        string symbol,
        uint256 totalSupply,
        bytes32 assetRefHash,
        address operator
    );

    event TokenPaused(address indexed pausedToken);
    event TokenUnpaused(address indexed unpausedToken);

    event BeaconUpgraded(address indexed newImplementation);

    /**
     * @notice Constructor
     * @param _ownerAddress: owner address
     * @param _adminAddress: admin address
     * @param _beaconAddress: upgradeable beacon address
     */
    constructor(
        address _ownerAddress,
        address _adminAddress,
        address _beaconAddress
    ) AccessControlled(_ownerAddress, _adminAddress) {
        beaconAddress = _beaconAddress;
    }

    /**
     * @notice Create a new token
     * @param _name: name of the token
     * @param _symbol: symbol of the token
     * @param _totalSupply: total supply of the token
     * @param _assetRefHash: asset reference hash
     * @param _operator: operator address
     * @param _initialRecipient: initial owner of the token supply (tokens go here)
     * @dev Callable by admin
     */
    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        bytes32 _assetRefHash,
        address _operator,
        address _initialRecipient
    ) external onlyAdmin whenNotPaused {
        require(bytes(_name).length > 0, "_name cannot be empty");
        require(bytes(_symbol).length > 0, "_symbol cannot be empty");
        require(_totalSupply > 0, "_totalSupply cannot be zero");
        require(_initialRecipient != address(0), "_initialRecipient be zero address");
        require(_operator != address(0), "_operator cannot be zero address");
        require(operatorsLedger[_operator].operator != address(0), "_operator not found");
        require(operatorsLedger[_operator].isPaused == false, "_operator cannot be paused");

        bytes memory initData = abi.encodeWithSelector(
            IERC20Implementation.initialize.selector,
            _name,
            _symbol,
            _totalSupply,
            _assetRefHash,
            _operator,
            _initialRecipient
        );

        address tokenProxy = address(new BeaconProxy(beaconAddress, initData));

        tokensLedger[tokenProxy] = TokenInfo({
            name: _name,
            symbol: _symbol,
            totalSupply: _totalSupply,
            assetRefHash: _assetRefHash,
            operator: _operator,
            isPaused: false
        });

        emit TokenCreated(tokenProxy, msg.sender, _name, _symbol, _totalSupply, _assetRefHash, _operator);
    }

    /**
     * @notice Pause a token
     * @param _token: token address
     * @dev Only admin can pause a token
     */
    function pauseToken(address _token) external onlyAdmin {
        require(tokensLedger[_token].operator != address(0), "not found");
        require(tokensLedger[_token].isPaused == false, "already paused");
        tokensLedger[_token].isPaused = true;

        IERC20Implementation(_token).pause();
        emit TokenPaused(_token);
    }

    /**
     * @notice Unpause a token
     * @param _token: token address
     * @dev Only admin can unpause a token
     */
    function unpauseToken(address _token) external onlyAdmin {
        require(tokensLedger[_token].operator != address(0), "not found");
        require(tokensLedger[_token].isPaused == true, "already unpaused");
        tokensLedger[_token].isPaused = false;

        IERC20Implementation(_token).unpause();
        emit TokenUnpaused(_token);
    }

    /**
     * @notice Upgrade the beacon
     * @param _newImplementation: new implementation address
     * @dev Only owner can upgrade the beacon
     */
    function _dangerous_upgrade_upgradeable_beacon_implementation(address _newImplementation) external onlyOwner {
        IUpgradeableBeacon(beaconAddress).upgradeTo(_newImplementation);
        emit BeaconUpgraded(_newImplementation);
    }
}
