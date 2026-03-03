<p align="center">
  <img src="https://raw.githubusercontent.com/JoshTheCyberSecuritySpecialist/ppl-ai-tutor/main/docs/banner.svg" width="100%" />
</p>

---

# ✈️ PPL AI Tutor  
### Enterprise AI Tutoring Platform for Private Pilot Training

---

## 🏷 Platform Status

![Build](https://img.shields.io/github/actions/workflow/status/JoshTheCyberSecuritySpecialist/ppl-ai-tutor/deploy.yml?branch=main)
![Docker](https://img.shields.io/badge/containerized-Docker-blue)
![Cloud](https://img.shields.io/badge/deployed-Azure%20Container%20Apps-0078D4)
![Backend](https://img.shields.io/badge/backend-FastAPI-059669)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Overview

PPL AI Tutor is a production-ready AI tutoring system designed to assist Private Pilot License (PPL) students with structured aviation knowledge, regulatory guidance, and scenario-based learning.

This platform demonstrates full AI lifecycle ownership:

- Containerized backend service  
- Cloud deployment automation  
- Model version tracking  
- Structured logging  
- Evaluation workflows  
- CI/CD automation  
- Secure cloud authentication  

---

# 🏗 System Architecture

User
↓ HTTPS
Frontend (React + Vite)
↓
FastAPI Backend
↓
LLM Inference Engine
↓
Structured Logging
↓
Model Version Layer
↓
Cloud Monitoring


---

# ⚙️ Tech Stack

## Backend
- FastAPI  
- Python 3.11  
- Uvicorn  
- Structured logging  

## Frontend
- React (Vite)  
- Modern SPA architecture  

## DevOps / Infrastructure
- Docker  
- GitHub Actions (CI/CD)  
- Azure Container Apps  
- Azure Container Registry  

---

# 🧠 Model Strategy

The system uses a Large Language Model (LLM) tailored for aviation tutoring.

## Design Principles

- Domain-focused prompt engineering  
- Controlled response structure  
- Version-tagged model releases  
- Evaluation-based regression detection  
- Logged inference metadata  

## Model Versioning Example

```json
{
  "answer": "VFR weather minimums require...",
  "model_version": "v1.0.0"
}

# 📡 API Documentation

## Base URL

```
https://your-container-app.azurecontainerapps.io
```

---

## 🔹 Health Check

**GET** `/health`

### Response

```json
{
  "status": "ok"
}
```

---

## 🔹 Ask Tutor

**POST** `/ask`

### Request Body

```json
{
  "question": "Explain VFR weather minimums."
}
```

### Response

```json
{
  "answer": "VFR weather minimums require...",
  "model_version": "v1.0.0",
  "latency_ms": 842
}
```

---

## 🔹 Analytics Summary

**GET** `/analytics/summary`

### Response

```json
{
  "total_requests": 124,
  "average_latency_ms": 913,
  "model_version": "v1.0.0"
}
```

---

# 📊 Evaluation Workflow

Evaluation scripts are located in:

```
evaluation/
```

Used to:

- Run predefined aviation test cases  
- Validate consistency across versions  
- Detect regression in response quality  

Run evaluation:

```
python evaluation/evaluate.py
```

---

# 🐳 Containerization

Build container:

```
docker build -t ppl-ai-tutor ./backend
```

Run locally:

```
docker run -p 8000:8000 ppl-ai-tutor
```

---

# 🔄 CI/CD Pipeline

Workflow location:

```
.github/workflows/deploy.yml
```

On push to `main`, the pipeline performs:

- Repository checkout  
- Azure authentication  
- Docker image build  
- Push to Azure Container Registry  
- Update Azure Container App  
- Deploy updated version  

Deployment triggers automatically on push to `main`.

---

# ☁️ Cloud Deployment

**Target Platform:** Azure Container Apps  

### Features

- Secure HTTPS endpoint  
- Managed container environment  
- Role-based access control  
- Service principal authentication  
- Automated deployment  

---

# 📁 Repository Structure

```
backend/          → FastAPI AI service
frontend/         → React frontend
docs/             → Architecture & assets
evaluation/       → Model validation scripts
.github/          → CI/CD workflows
docker-compose.yml
README.md
```

---

# 🔐 Security Practices

- Environment variable isolation  
- No secrets committed to repository  
- Service principal authentication for CI/CD  
- Role-based cloud access control  
- HTTPS enforced  

---

# ✅ Production Readiness Checklist

| Capability | Status |
|------------|--------|
| Containerized Backend | ✅ |
| Cloud Deployment | ✅ |
| CI/CD Pipeline | ✅ |
| Model Version Tagging | ✅ |
| Structured Logging | ✅ |
| Evaluation Scripts | ✅ |
| Secure Secrets Handling | ✅ |
| API Documentation | ✅ |
| Monitoring Integration | ⏳ |
| Load Testing | ⏳ |

---

# 📈 Engineering Highlights

This project demonstrates:

- End-to-end AI system architecture  
- Model lifecycle ownership  
- Containerized inference services  
- Cloud-native deployment  
- DevOps automation  
- Evaluation-driven iteration  

---

# 👤 Author

Joshua Bruner  
Cybersecurity Engineer | AI Systems Builder  
NextWave Digital Solutions  

---

# 📜 License

MIT License
