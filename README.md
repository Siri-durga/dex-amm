# \# 🦄 DEX AMM Project

# 

# A simplified \*\*Decentralized Exchange (DEX)\*\* implementation based on the \*\*Automated Market Maker (AMM)\*\* model, inspired by \*\*Uniswap V2\*\*.  

# This project enables trustless token swaps and liquidity provisioning using smart contracts, without relying on centralized intermediaries or order books.

# 

# ---

# 

# \## 📌 Overview

# 

# This DEX allows users to:

# 

# \- Add and remove liquidity for a token pair

# \- Swap between two ERC-20 tokens

# \- Earn trading fees as a liquidity provider

# 

# Pricing is governed by the \*\*constant product invariant\*\*:

# 

# x \* y = k

# 

# yaml

# Copy code

# 

# A \*\*0.3% trading fee\*\* is charged on each swap and distributed to liquidity providers by increasing pool reserves.

# 

# ---

# 

# \## ✨ Features

# 

# \- Initial and subsequent liquidity provisioning

# \- Proportional liquidity removal

# \- Token swaps using constant product AMM formula

# \- 0.3% trading fee for LP rewards

# \- Internal LP token minting and burning

# \- Event-driven transparency

# \- Solidity 0.8+ safety features

# 

# ---

# 

# \## 🏗 Architecture

# 

# \### Smart Contracts

# 

# contracts/

# ├── DEX.sol

# ├── MockERC20.sol

# 

# yaml

# Copy code

# 

# \#### `DEX.sol`

# Core AMM contract responsible for:

# \- Liquidity pool management

# \- Swap execution

# \- LP share accounting

# \- Reserve tracking

# \- Fee mechanics

# 

# \#### `MockERC20.sol`

# \- Simple ERC-20 token implementation

# \- Used for local testing and development

# 

# ---

# 

# \### 🔑 Design Decisions

# 

# \- Reserves are tracked internally (not via `balanceOf`)

# \- LP tokens are managed through internal mappings

# \- Solidity `^0.8.0` used for built-in overflow checks

# \- Events emitted for all state-changing operations

# \- No external price oracles (pure AMM pricing)

# 

# ---

# 

# \## 📐 Mathematical Model

# 

# \### Constant Product Formula

# 

# x \* y = k

# 

# yaml

# Copy code

# 

# Where:

# \- `x` = reserve of Token A

# \- `y` = reserve of Token B

# \- `k` = invariant value

# 

# Swaps preserve `k`, which increases slightly due to fees.

# 

# ---

# 

# \### 💸 Fee Calculation (0.3%)

# 

# amountInWithFee = amountIn \* 997

# 

# yaml

# Copy code

# 

# \- Only \*\*99.7%\*\* of the input amount participates in pricing

# \- Remaining \*\*0.3%\*\* stays in the pool as LP reward

# 

# ---

# 

# \### 🪙 Liquidity Provider (LP) Token Logic

# 

# \#### Initial Liquidity (First Provider)

# 

# liquidityMinted = sqrt(amountA \* amountB)

# 

# markdown

# Copy code

# 

# \- First provider sets the initial price ratio

# 

# \#### Subsequent Liquidity Addition

# 

# liquidityMinted = (amountA \* totalLiquidity) / reserveA

# 

# markdown

# Copy code

# 

# \- Ensures proportional ownership

# 

# \#### Liquidity Removal

# 

# amountA = (liquidityBurned \* reserveA) / totalLiquidity

# amountB = (liquidityBurned \* reserveB) / totalLiquidity

# 

# yaml

# Copy code

# 

# ---

# 

# \### 🔄 Swap Output Calculation

# 

# amountInWithFee = amountIn \* 997

# numerator = amountInWithFee \* reserveOut

# denominator = (reserveIn \* 1000) + amountInWithFee

# amountOut = numerator / denominator

# 

# yaml

# Copy code

# 

# ---

# 

# \## ⚙️ Setup Instructions

# 

# \### Prerequisites

# 

# \- Docker

# \- Docker Compose

# \- Git

# \- Node.js (for local runs)

# 

# ---

# 

# \## 🚀 Installation (Docker)

# 

# \### 1. Clone Repository

# ```bash

# git clone https://github.com/Siri-durga/dex-amm.git

# cd dex-amm

# 2\. Start Docker Environment

# bash

# Copy code

# docker-compose up -d

# 3\. Compile Contracts

# bash

# Copy code

# docker-compose exec app npm run compile

# 4\. Run Tests

# bash

# Copy code

# docker-compose exec app npm test

# 5\. Check Coverage

# bash

# Copy code

# docker-compose exec app npm run coverage

# 6\. Stop Docker

# bash

# Copy code

# docker-compose down

# 🧪 Running Locally (Without Docker)

# bash

# Copy code

# npm install

# npm run compile

# npm test

# 📍 Contract Deployment

# Intended for local development and evaluation

# 

# No public testnet or mainnet deployment

# 

# Uses mock tokens for testing

# 

# ⚠️ Known Limitations

# Supports only one trading pair (Token A ↔ Token B)

# 

# No front-end interface

# 

# No slippage protection

# 

# LP tokens are not ERC-20 compliant

# 

# No flash swap support

# 

# 🔐 Security Considerations

# Solidity 0.8+ prevents overflow/underflow

# 

# Validates non-zero inputs for swaps and liquidity

# 

# Correct reserve synchronization after each operation

# 

# Events emitted for transparency

# 

# Uses OpenZeppelin ERC-20 standards

# 

# ⚠️ This project is for educational purposes only and has not been audited.

# Do not use in production environments.

# 

# 📄 License

# MIT License

# 

# 🙌 Acknowledgements

# Inspired by Uniswap V2

# 

# Built using Solidity, Hardhat, and Docker

# 

# OpenZeppelin for ERC-20 standards

# 



