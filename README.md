
# MagicBlock Engine Example

This repository contains an example for a fully featured game running 100% serverless using Solana's devnet and MagicBlock's devnet.

# Code organization

### Backend

The `backend` folder contains all smart contract code, it uses MagicBlock's BOLT.

The smart contracts should already be deployed on devnet. But you can deploy them locally or on a different cluster using:

```bash
cd backend
bolt deploy
```

### Frontend

The `frontend` folder contains an implementation for a React based web UI to interact with the smart contracts.

You can try it locally by running:

```bash
cd frontend
npm install
npm run dev
```
