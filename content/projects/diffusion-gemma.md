---
title: "DiffusionGemma: Behavioral Introspection & Concept Ablation"
date: "2026-08-20"
summary: "Experimental research into model behavior, concept ablation, and behavioral shifts in diffusion-based language models with controlled quantitative evaluation."
tags:
  - "diffusion"
  - "transformers"
  - "deep learning"
  - "model ablation"
techStack:
  - "Python"
  - "PyTorch"
  - "Transformers"
  - "Hugging Face"
  - "Diffusion"
githubUrl: "https://huggingface.co/Umranz"
liveDemoUrl: "https://huggingface.co/Umranz"
featured: true
role: "Independent ML Researcher"
metrics: "Concept Ablation · Diffusion Trajectories · Behavioral Drift"
draft: false
---

## Research Motivation

While autoregressive decoding dominates generative text models, diffusion-based text models frame generation as iterative denoising over continuous token embeddings or discrete latent spaces. This continuous framing enables targeted model introspection: rather than steering outputs through token masking, we can observe and ablate intermediate representation trajectories.

**DiffusionGemma** investigates concept ablation, representation disentanglement, and behavioral changes across diffusion trajectories.

## Experimental Framework

### 1. Controlled Concept Ablation
Concept erasure is performed by projecting intermediate latent representations onto the orthogonal complement of targeted concept subspaces. By isolating direction vectors corresponding to specific semantic domains, we measure:
- **Ablation Retention:** How completely the target concept is neutralized across iterative denoising steps.
- **Collateral Semantic Drift:** Whether unrelated reasoning domains remain unperturbed during generation.

```python
import torch
import torch.nn.functional as F

def project_orthogonal(latent_state: torch.Tensor, concept_vector: torch.Tensor) -> torch.Tensor:
    """Projects latent states onto the orthogonal complement of the concept vector."""
    concept_norm = F.normalize(concept_vector, p=2, dim=-1)
    projection = torch.sum(latent_state * concept_norm, dim=-1, keepdim=True) * concept_norm
    return latent_state - projection
```

### 2. Quantitative Evaluation
- Measured cross-entropy divergence across benchmark datasets before and after concept steering.
- Explored model stability across varied noise schedules (cosine vs linear schedulers) during discrete text recovery.
