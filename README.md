# 🏦 EverVault MVP

Un vault DeFi simplifié permettant aux utilisateurs de déposer des USDC et recevoir des parts tokenisées (evUSDC) en échange.

**Déployé sur Sepolia Testnet**

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Fonctionnalités

- ✅ **Dépôt USDC** - Déposez vos USDC et recevez des parts (evUSDC)
- ✅ **Retrait** - Brûlez vos parts pour récupérer vos USDC (0.5% de frais)
- ✅ **TVL en temps réel** - Visualisez le Total Value Locked
- ✅ **Connexion Wallet** - Support MetaMask via RainbowKit

---

## 🏗️ Architecture

```
EverVault_MVP/
├── backend/                    # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── EverVault.sol       # Version complète (avec Aave)
│   │   └── EverVaultSimple.sol # MVP déployé
│   └── scripts/
│       └── deploy-simple.ts    # Script de déploiement
│
└── frontend/                   # Application Web (Next.js)
    ├── components/
    │   ├── DepositForm.tsx     # Formulaire de dépôt
    │   ├── WithdrawForm.tsx    # Formulaire de retrait
    │   └── TVLDisplay.tsx      # Affichage du TVL
    └── app/
        └── page.tsx            # Page principale
```

---

## 🛠️ Stack Technique

### Backend
- **Solidity** 0.8.28
- **Hardhat** - Framework de développement
- **OpenZeppelin** - Contrats sécurisés (ERC20, ReentrancyGuard, Ownable)

### Frontend
- **Next.js** 16 - Framework React
- **Wagmi v2** - Hooks Ethereum
- **RainbowKit** - Connexion wallet
- **TailwindCSS** - Styling
- **Viem** - Utilitaires Ethereum

---

## 🚀 Installation

### Prérequis
- Node.js >= 18
- MetaMask
- SepoliaETH (pour les frais de gas)
- USDC Sepolia (pour tester)

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Variables d'environnement

**Backend** (`backend/.env`)
```env
SEPOLIA_PRIVATE_KEY=0xVOTRE_CLE_PRIVEE
```

**Frontend** (`frontend/.env.local`)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x58E3cf7e9FD485CD5f36c5e330a4eCb178bA1B03
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id
```

---

## 📦 Déploiement

### Smart Contract (Sepolia)

```bash
cd backend
npx hardhat run scripts/deploy-simple.ts --network sepolia
```

### Frontend (Vercel)

1. Connectez votre repo GitHub à Vercel
2. Définissez `frontend` comme Root Directory
3. Ajoutez les variables d'environnement
4. Déployez !

---

## 🔗 Adresses Déployées (Sepolia)

| Contrat | Adresse |
|---------|---------|
| EverVaultSimple | `0x58E3cf7e9FD485CD5f36c5e330a4eCb178bA1B03` |
| USDC (Circle) | `0x1c7D4B196Cb0C7b01d743Fbc6116a902379C7238` |

---

## 🎯 Comment ça marche ?

### Dépôt
1. L'utilisateur approuve le contrat à utiliser ses USDC
2. L'utilisateur dépose ses USDC
3. Le contrat mint des parts (evUSDC) en ratio 1:1

### Retrait
1. L'utilisateur spécifie le nombre de parts à retirer
2. Le contrat brûle les parts
3. L'utilisateur reçoit ses USDC (moins 0.5% de frais)

---

## 🔮 Évolutions Futures

- [ ] Intégration Aave pour générer du yield
- [ ] Multi-vault (ETH, WBTC...)
- [ ] Gouvernance décentralisée (DAO)
- [ ] Stratégies de réinvestissement automatique

---

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE)

---

## 👨‍💻 Auteur

**Christophe Chollet**

Projet réalisé dans le cadre de la formation Alyra.

---

## 🙏 Remerciements

- [Alyra](https://alyra.fr) - Formation Blockchain
- [OpenZeppelin](https://openzeppelin.com) - Contrats sécurisés
- [RainbowKit](https://rainbowkit.com) - Connexion wallet
