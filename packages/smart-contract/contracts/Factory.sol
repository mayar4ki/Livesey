// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {AccessControlled} from "./_libs/AccessControlled.sol";
import {IERC20Implementation} from "./ERC20Implementation/IERC20Implementation.sol";
import {IUpgradeableBeacon} from "./UpgradeableBeacon/IUpgradeableBeacon.sol";

/**
 * @title Factory
 * @notice Factory contract to create new tokens
 */
contract Factory is AccessControlled {
    address public immutable beacon; // upgradeable beacon address

    struct BeaconInfo {
        string name;
        string symbol;
        bytes32 assetRefHash;
        uint256 totalSupply;
    }

    mapping(address => BeaconInfo) public beaconLedger; // beacon address to beacon info

    event BeaconProxyCreated(
        address indexed createdBeaconProxy,
        address indexed deployer,
        string name,
        string symbol,
        bytes32 assetRefHash,
        uint256 totalSupply
    );

    event BeaconProxyDeleted(address indexed deletedBeaconProxy);
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
        beacon = _beaconAddress;
    }

    /**
     * @notice Create a new token
     * @param _name: name of the token
     * @param _symbol: symbol of the token
     * @param _assetRefHash: asset reference hash
     * @param _totalSupply: total supply of the token
     * @param _owner: owner of the token
     * @dev Callable by admin
     */
    function createBeaconProxy(
        string memory _name,
        string memory _symbol,
        bytes32 _assetRefHash,
        uint256 _totalSupply,
        address _owner
    ) external onlyAdmin whenNotPaused {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_totalSupply > 0, "Total supply cannot be zero");
        require(_owner != address(0), "Owner cannot be zero address");

        bytes memory initData = abi.encodeWithSelector(
            IERC20Implementation.initialize.selector,
            _name,
            _symbol,
            _assetRefHash,
            _totalSupply,
            _owner
        );

        address beaconProxy = address(new BeaconProxy(beacon, initData));
        beaconLedger[beaconProxy] = BeaconInfo({
            name: _name,
            symbol: _symbol,
            assetRefHash: _assetRefHash,
            totalSupply: _totalSupply
        });

        emit BeaconProxyCreated(
            beaconProxy,
            msg.sender,
            _name,
            _symbol,
            _assetRefHash,
            _totalSupply
        );
    }

    /**
     * @notice Dispose a beacon proxy
     * @param _beaconProxy: beacon proxy address
     * @dev Only admin can dispose a beacon proxy
     */
    function deleteBeaconProxy(address _beaconProxy) external onlyAdmin {
        delete beaconLedger[_beaconProxy];
        emit BeaconProxyDeleted(_beaconProxy);
    }

    /**
     * @notice Upgrade the beacon
     * @param _newImplementation: new implementation address
     * @dev Only owner can upgrade the beacon
     */
    function upgradeBeacon(address _newImplementation) external onlyOwner {
        IUpgradeableBeacon(beacon).upgradeTo(_newImplementation);
        emit BeaconUpgraded(_newImplementation);
    }
}
