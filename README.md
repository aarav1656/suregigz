# 🚀 SureGigz

**SureGigz** is a decentralized freelancing platform that eliminates trust barriers between clients and freelancers by combining the power of **smart contracts**, **AI-driven deliverable evaluation**, **escrow-backed payments**, and **Zero-Knowledge (ZK)-based dispute resolution**.

Whether you're a freelancer, a client, or a neutral validator, SureGigz offers a trustless, transparent, and fair marketplace for work.

---

## 📌 Table of Contents

- [🔗 Deployed Contract](#-deployed-contract)
- [❌ Problem](#-problem)
- [✅ Our Solution](#-our-solution)
- [⚙️ How It Works](#️-how-it-works)
- [🧠 AI-Powered Work Evaluation](#-ai-powered-work-evaluation)
- [🔒 ZK-Based Dispute Resolution](#-zk-based-dispute-resolution)
- [💡 Why SureGigz?](#-why-suregigz)
- [🛠 Tech Stack](#-tech-stack)
- [🧱 System Architecture](#-system-architecture)
- [🗺 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [📢 Stay Updated](#-stay-updated)

---

## 🔗 Deployed Contract

- **Network:** NEAR Testnet  
- **Transaction Hash:** [`EqTMeTZ6ZasYQdDHP7TNRcJcJ7jmA9smsDQYL9ifFFLF`](https://testnet.nearblocks.io/txns/EqTMeTZ6ZasYQdDHP7TNRcJcJ7jmA9smsDQYL9ifFFLF)  
- **Explorer:** [NearBlocks Testnet](https://testnet.nearblocks.io/)

---

## ❌ Problem

Traditional freelancing platforms are plagued by:

1. **Mistrust Between Clients and Freelancers**
2. **Centralized Arbitration**
3. **Subjective Work Evaluation**
4. **Payment Insecurity**
5. **Unverifiable Reputation**

---

## ✅ Our Solution

SureGigz is built on four pillars:

- 🔐 **Attestation-Based Smart Contracts**  
- 🤖 **AI-Powered Deliverable Evaluation**  
- 🧑‍⚖️ **ZK-Based Dispute Resolution**  
- 💸 **Escrow-Backed Payments**

These combined form a fully trustless freelance job lifecycle.

---

## ⚙️ How It Works

### 1. Client Posts a Job
- Job details, timeline, and payment are recorded on-chain.
- Escrow smart contract locks funds.

### 2. Freelancer Accepts the Job
- Agrees to attested job terms.

### 3. Submission & AI Review
- Freelancer submits work.
- AI checks relevance vs job description.

### 4. Approval or Dispute
- If AI score is high, payment is released.
- Otherwise, a dispute is triggered.

### 5. ZK-Based Resolution
- Validators + AI decide fairly and anonymously.
- Outcome releases funds accordingly.

---

## 🧠 AI-Powered Work Evaluation

SureGigz uses NLP-based AI to assess work quality by comparing:

- ✅ Relevance to job description  
- ✅ Coverage of required deliverables  
- ✅ Language clarity and depth  

This ensures freelancers are rewarded for quality, not persuasion.

---

## 🔒 ZK-Based Dispute Resolution

Using **ZKPass** and anonymous identity verification:

- Validators prove qualification privately.
- AI + Validators resolve disputes.
- Validator reputation grows based on accuracy, not popularity.

---

## 💡 Why SureGigz?

| Feature                  | Traditional Platforms | SureGigz               |
|--------------------------|-----------------------|-------------------------|
| Trustless Payments       | ❌                    | ✅                      |
| AI Work Validation       | ❌                    | ✅                      |
| Decentralized Resolution | ❌                    | ✅ (via ZK validators)  |
| Escrow-Backed Payments   | ✅ (centralized)      | ✅ (on-chain)           |
| Verifiable Reputation    | ❌                    | ✅ (via attestations)   |

---

## 🛠 Tech Stack

- **Blockchain:** NEAR Protocol (Testnet)
- **Smart Contracts:** Rust + NEAR SDK
- **AI Evaluation Engine:** Python (Transformers/NLP)
- **Zero Knowledge:** ZKPass, Semaphore/ZK-KYC
- **Frontend:** React + TailwindCSS
- **Wallet:** NEAR Wallet (Web-based)

---

## 🧱 System Architecture

📊 **Visual Diagram:**  
[👉 View on Excalidraw](https://excalidraw.com/#json=rmUGMw3UnsQ_H3_WgVANR,GcDpMcxS2TjCPHTLngpMYw)

```mermaid
graph TD
A[Client Posts Job] --> B[Escrow Smart Contract]
B --> C[Freelancer Accepts Job]
C --> D[Work Submission]
D --> E[AI Evaluation Engine]
E --> F{Score Sufficient?}
F -- Yes --> G[Auto Payment Release]
F -- No --> H[ZK-Based Dispute]
H --> I[Validators + AI Decision]
I --> J[Payment Settled]
