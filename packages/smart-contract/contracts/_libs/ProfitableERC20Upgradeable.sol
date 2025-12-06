// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
 * @dev Abstract contract that extends ERC20Upgradeable with dividend distribution functionality.
 *
 * This contract implements a dividend distribution system where holders of the ERC20 token
 * can receive rewards in a separate reward token. Dividends are distributed proportionally
 * based on token holdings, using a magnified dividend per share mechanism to maintain precision.
 *
 * Key features:
 * - Dividends are tracked using a magnified dividend per share (scaled by MAGNITUDE = 1e36)
 * - Per-account corrections handle changes in token balance (transfers, mints, burns)
 * - Tracks withdrawn dividends to prevent double withdrawals
 * - Uses ERC-7201 namespaced storage pattern for upgradeable contracts
 * - Handles fee-on-transfer tokens by measuring actual received amounts
 *
 * Derived contracts must call {__ProfitableERC20_init} during initialization and should
 * update {_magnifiedDividendCorrections} when token balances change (e.g., in _update hooks).
 */
abstract contract ProfitableERC20Upgradeable is ERC20Upgradeable {
    /// @custom:storage-location erc7201:livesey.storage.ProfitableERC20
    struct ProfitableERC20Storage {
        uint256 _MAGNITUDE;
        IERC20 _rewardToken;
        uint256 _magnifiedDividendPerShare; // Cumulative dividends per token (scaled)
        mapping(address => int256) _magnifiedDividendCorrections; // Per-account correction to handle transfers/mint/burn
        mapping(address => uint256) _withdrawnDividends; // How much each account already withdrew
    }

    error ProfitableERC20InvalidRewardToken(address rewardToken);

    event DividendsDistributed(address indexed by, uint256 amount);
    event DividendWithdrawn(address indexed to, uint256 amount);

    // keccak256(abi.encode(uint256(keccak256("livesey.storage.ProfitableERC20")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ProfitableERC20StorageLocation =
        0x8840a46ded734f39b7fa17e475bd41ee5fda984ac7f77f2ae3984df756569c00;

    function _getProfitableERC20Storage() private pure returns (ProfitableERC20Storage storage $) {
        assembly {
            $.slot := ProfitableERC20StorageLocation
        }
    }

    /**
     * @dev Initializes the ProfitableERC20 contract with the reward token.
     *
     * This function should be called during the initialization of derived contracts.
     *
     * @param rewardToken_ The address of the ERC20 token used for dividend payments.
     */
    function __ProfitableERC20_init(address rewardToken_) internal onlyInitializing {
        if (rewardToken_ == address(0)) revert ProfitableERC20InvalidRewardToken(address(0));
        __ProfitableERC20_init_unchained(rewardToken_);
    }

    /**
     * @dev Internal initialization function that sets the reward token and magnitude.
     *
     * @param rewardToken_ The address of the ERC20 token used for dividend payments.
     */
    function __ProfitableERC20_init_unchained(address rewardToken_) internal onlyInitializing {
        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();
        $._rewardToken = IERC20(rewardToken_);
        $._MAGNITUDE = 1e36;
    }

    /**
     * @notice Deposit reward token dividends into the contract for distribution to token holders.
     * @dev Uses transferFrom to receive tokens. Caller must approve this contract first.
     *
     * The dividend amount is distributed proportionally to all token holders based on their
     * current balance. The distribution uses a magnified dividend per share mechanism to
     * maintain precision.
     *
     * Handles fee-on-transfer tokens by measuring the actual received amount (difference
     * in contract balance before and after transfer).
     *
     * Requirements:
     * - Total supply must be greater than zero
     * - Amount must be greater than zero
     * - Caller must have approved this contract to spend the reward token
     *
     * @param amount The amount of reward tokens to deposit (may be reduced by fees for fee-on-transfer tokens).
     */
    function _distributeDividends(uint256 amount) internal virtual {
        require(totalSupply() > 0, "no supply");
        require(amount > 0, "no amount");

        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();

        uint256 beforeBal = $._rewardToken.balanceOf(address(this));
        SafeERC20.safeTransferFrom($._rewardToken, msg.sender, address(this), amount);
        uint256 afterBal = $._rewardToken.balanceOf(address(this));
        uint256 received = afterBal - beforeBal;
        require(received > 0, "nothing received");

        $._magnifiedDividendPerShare += (received * $._MAGNITUDE) / totalSupply();

        emit DividendsDistributed(msg.sender, received);
    }

    /**
     * @notice Withdraw the caller's available dividends.
     * @dev Transfers the withdrawable dividend amount to the caller and updates
     * the withdrawn dividends tracking. Protected by reentrancy guard.
     *
     * Requirements:
     * - Caller must have withdrawable dividends greater than zero
     */
    function _withdrawDividend() internal virtual {
        uint256 withdrawable = withdrawableDividendOf(msg.sender);
        require(withdrawable > 0, "Nothing to withdraw");

        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();
        $._withdrawnDividends[msg.sender] += withdrawable;
        SafeERC20.safeTransfer($._rewardToken, msg.sender, withdrawable);

        emit DividendWithdrawn(msg.sender, withdrawable);
    }

    /**
     * @notice Calculate the total dividends earned by an account since contract inception.
     * @dev Returns the cumulative dividends earned, including both withdrawn and unwithdrawn amounts.
     * Uses magnified dividend per share and account-specific corrections to handle balance changes.
     *
     * @param account The address to query dividend earnings for.
     * @return The total dividends earned by the account (in reward token units).
     */
    function accumulativeDividendOf(address account) public view returns (uint256) {
        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();
        int256 magnified = int256($._magnifiedDividendPerShare * balanceOf(account)) +
            $._magnifiedDividendCorrections[account];

        if (magnified <= 0) return 0;
        return uint256(magnified) / $._MAGNITUDE;
    }

    /**
     * @notice Calculate the amount of dividends available for withdrawal by an account.
     * @dev Returns the difference between total accumulated dividends and already withdrawn dividends.
     *
     * @param account The address to query withdrawable dividends for.
     * @return The amount of dividends that can be withdrawn (in reward token units).
     */
    function withdrawableDividendOf(address account) public view returns (uint256) {
        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();

        uint256 accum = accumulativeDividendOf(account);
        uint256 already = $._withdrawnDividends[account];
        if (accum <= already) return 0;
        return accum - already;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);
        ProfitableERC20Storage storage $ = _getProfitableERC20Storage();

        if (value == 0) return;

        // Mint
        if (from == address(0)) {
            $._magnifiedDividendCorrections[to] -= int256($._magnifiedDividendPerShare * value);
            return;
        }

        // Burn
        if (to == address(0)) {
            $._magnifiedDividendCorrections[from] += int256($._magnifiedDividendPerShare * value);
            return;
        }

        // Transfer
        int256 correction = int256($._magnifiedDividendPerShare * value);
        $._magnifiedDividendCorrections[from] += correction;
        $._magnifiedDividendCorrections[to] -= correction;
    }
}
