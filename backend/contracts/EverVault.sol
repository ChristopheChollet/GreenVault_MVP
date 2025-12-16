// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";

contract EverVault is ERC20, ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Adresses immutable des tokens/protocoles
    IERC20 public immutable USDC;
    IPool public immutable AAVE_LENDING;
    IERC20 public immutable WBTC;

    // Allocations (80% Aave, 20% WBTC)
    uint256 public constant AAVE_ALLOCATION = 8000;
    uint256 public constant WBTC_ALLOCATION = 2000;
    uint256 public constant TOTAL_ALLOCATION = 10000;

    // Frais de retrait (0.5%)
    uint256 public constant WITHDRAWAL_FEE = 50;

    // Valeur totale verrouillée (en USDC)
    uint256 public totalValueLocked;

    // Adresse pour recevoir les frais
    address public feeRecipient;

    // Erreurs personnalisées
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientShares();
    error InsufficientAaveBalance(uint256 required, uint256 available);
    error ConversionFailed();

    // Événements
    event Deposited(address indexed user, uint256 usdcAmount, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 usdcAmount);
    event AllocationExecuted(string asset, uint256 amount);
    event Reinvested(uint256 amount);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address _usdc, address _aaveLending, address _wbtc)
        ERC20("MultiAssetVault", "MAV")
        Ownable(msg.sender)
    {
        if (_usdc == address(0) || _aaveLending == address(0) || _wbtc == address(0)) {
            revert ZeroAddress();
        }
        USDC = IERC20(_usdc);
        AAVE_LENDING = IPool(_aaveLending);
        WBTC = IERC20(_wbtc);
        feeRecipient = msg.sender;
    }

    // Dépôt de USDC (avec allocation automatique)
    function deposit(uint256 usdcAmount) external nonReentrant whenNotPaused returns (uint256) {
        if (usdcAmount == 0) revert ZeroAmount();

        // CEI Pattern: Checks-Effects-Interactions
        totalValueLocked += usdcAmount;
        _mint(msg.sender, usdcAmount);

        USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);
        _allocateFunds(usdcAmount);

        emit Deposited(msg.sender, usdcAmount, usdcAmount);
        return usdcAmount;
    }

    // Alloue les fonds entre Aave et WBTC
    function _allocateFunds(uint256 amount) internal {
        // 80% à Aave
        uint256 aaveAmount = (amount * AAVE_ALLOCATION) / TOTAL_ALLOCATION;
        USDC.safeIncreaseAllowance(address(AAVE_LENDING), aaveAmount);
        AAVE_LENDING.supply(address(USDC), aaveAmount, address(this), 0);
        emit AllocationExecuted("AAVE_USDC", aaveAmount);

        // 20% à WBTC (simulé pour le MVP)
        uint256 wbtcAmount = (amount * WBTC_ALLOCATION) / TOTAL_ALLOCATION;
        emit AllocationExecuted("WBTC", wbtcAmount);
    }

    // Réinvestit les intérêts générés par Aave
    function reinvest() external nonReentrant whenNotPaused {
        (, uint256 aaveBalance, , , , ) = AAVE_LENDING.getUserAccountData(address(this));
        uint256 expectedBalance = (totalValueLocked * AAVE_ALLOCATION) / TOTAL_ALLOCATION;
        uint256 interest = aaveBalance > expectedBalance ? aaveBalance - expectedBalance : 0;
        if (interest > 0) {
            totalValueLocked += interest;
            USDC.safeIncreaseAllowance(address(AAVE_LENDING), interest);
            AAVE_LENDING.supply(address(USDC), interest, address(this), 0);
            emit Reinvested(interest);
        }
    }

    // Retourne la valeur totale des actifs (USDC + Aave)
    function getTotalAssets() public view returns (uint256) {
        uint256 usdcBalance = USDC.balanceOf(address(this));
        (, uint256 aaveBalance, , , , ) = AAVE_LENDING.getUserAccountData(address(this));
        return usdcBalance + aaveBalance;
    }

    // Retourne le prix d'une part (en USDC)
    function getPricePerShare() public view returns (uint256) {
        uint256 totalAssets = getTotalAssets();
        uint256 supply = totalSupply();
        return supply == 0 ? 1e18 : (totalAssets * 1e18) / supply;
    }

    // Retrait de parts (avec frais de 0.5%)
    function withdraw(uint256 shares) external nonReentrant whenNotPaused returns (uint256) {
        if (shares == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < shares) revert InsufficientShares();

        (, uint256 aaveBalance, , , , ) = AAVE_LENDING.getUserAccountData(address(this));
        uint256 requiredAaveBalance = (shares * AAVE_ALLOCATION) / TOTAL_ALLOCATION;
        if (aaveBalance < requiredAaveBalance) {
            revert InsufficientAaveBalance(requiredAaveBalance, aaveBalance);
        }

        uint256 usdcAmount = shares;
        uint256 feeAmount = (usdcAmount * WITHDRAWAL_FEE) / 10000;
        usdcAmount -= feeAmount;

        _burn(msg.sender, shares);
        USDC.safeTransfer(msg.sender, usdcAmount);
        if (feeAmount > 0) {
            USDC.safeTransfer(feeRecipient, feeAmount);
        }

        emit Withdrawn(msg.sender, shares, usdcAmount);
        return usdcAmount;
    }

    // Fonctions admin
    function setFeeRecipient(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(feeRecipient, _recipient);
        feeRecipient = _recipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Fonction pour les tests (simule une allocation WBTC)
    function addMockAllocation(uint256 amount, string memory assetName) external onlyOwner {
        emit AllocationExecuted(assetName, amount);
    }
}
