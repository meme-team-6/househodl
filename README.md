# 🏠 HouseHodl

**Crypto-native group expense management with automated pooling, voting, and DeFi yield.**

Turn messy receipts and group chats into clear, trackable balances. HouseHodl helps you manage group finances automatically with crypto, earning you interest on your money in the background.

## 🌟 Features

- **💰 Automated Yield Generation** - Earn interest on pooled funds through DeFi protocols
- **🗳️ Transparent Voting** - Democratic expense approval with on-chain transparency
- **🔗 Multi-chain Support** - Works across Ethereum and other EVM networks
- **📱 Mobile-first Design** - Beautiful, responsive interface for all devices
- **🔐 Wallet Integration** - Seamless Web3 authentication via Dynamic
- **📊 Real-time Tracking** - Live expense tracking and balance updates

## Design
- High level product planning document - UX, technical architecture, and narrative: [ETHGlobal Planning]([docs/design.md](https://www.figma.com/board/I8Tadon67fnLFuR52SoXgF/ETHGlobal-NYC-2025?node-id=373-1074&t=g3f2y5yKKC7sKoyM-0))
- Wireframing & Visual Design: [HouseHodl Design](https://www.figma.com/design/B2dvThl3Ic79Xh4tpsxCNs/Househodl---Prototypes---Visual-Design?node-id=74-52&t=SZ8PzRN8Ufeth6V4-1)

## 🏗️ Architecture

This is a monorepo containing all Househodl components:

```
househodl/
├── apps/
│   └── frontend/          # React frontend application
├── contracts/
│   └── househodl/         # Solidity smart contracts (Foundry)
├── infra/                 # Infrastructure as code (Pulumi)
├── services/
│   └── api/               # Backend API service
└── packages/              # Shared packages and utilities
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/househodl.git
   cd househodl
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development servers**
   ```bash
   pnpm dev
   ```

This will start all development services:
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Smart contracts: Local Anvil node



## 🔧 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Dynamic Labs** - Web3 wallet integration

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety

### Smart Contracts
- **Solidity** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Security libraries

### Infrastructure
- **Pulumi** - Infrastructure as code
- **TypeScript** - Configuration language

### DevOps
- **Turbo** - Monorepo build system
- **pnpm** - Package management
- **GitHub Actions** - CI/CD pipelines

## 🏠 Use Cases

Perfect for groups who want to manage shared expenses efficiently:

- **🏡 Hacker Houses** - Split rent, utilities, and shared supplies
- **✈️ Travel Groups** - Manage trip expenses and accommodation costs
- **💻 Crypto Teams** - Handle project expenses with native crypto payments
- **🎉 Event Organizers** - Coordinate hackathon and conference costs
- **🎓 Student Clubs** - Manage club events and competition fees
- **🏢 Small Businesses** - Automated expense approval workflows

## 🔐 Environment Setup

### Frontend Environment Variables
```bash
# apps/frontend/.env.local
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_API_URL=http://localhost:3000
```

### API Environment Variables
```bash
# services/api/.env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### Smart Contract Environment Variables
```bash
# contracts/househodl/.env
PRIVATE_KEY=your_private_key
RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Frontend tests
pnpm -C apps/frontend test

# Smart contract tests
pnpm -C contracts/househodl test

# API tests
pnpm -C services/api test
```

## 🚀 Deployment

### Development
```bash
pnpm dev
```

### Production
```bash
# Build all packages
pnpm build

# Deploy infrastructure
pnpm deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
