---
title: "Concept Ablation in Diffusion Language Models: A Method Note"
date: "2026-09-14"
coverImage: "/images/articles/diffusion-ablation.svg"
excerpt: "Why diffusion trajectories make controlled representation interventions interesting, and what an ablation study must measure before it can claim erasure."
tags:
  - "diffusion"
  - "transformers"
  - "deep learning"
  - "model behavior"
author: "Shaik Umran"
featured: true
draft: false
---

Autoregressive language models generate a sequence from left to right. A diffusion language model instead exposes an iterative denoising process, which creates more intervention points but also more ways to confuse a change in representation with a change in output.

The useful question is not whether a vector can be subtracted. It is whether the intervention changes the target behavior while leaving unrelated behavior stable enough to interpret.

## Orthogonal projection as a testable intervention

For a latent state $\mathbf{z}_t$ and a direction $\mathbf{v}$, one simple intervention removes the component parallel to that direction:

$$\mathbf{z}_t' = \mathbf{z}_t - \frac{\mathbf{z}_t \cdot \mathbf{v}}{\|\mathbf{v}\|^2}\mathbf{v}$$

```python
import torch
import torch.nn.functional as F


def ablate_direction(latent: torch.Tensor, direction: torch.Tensor, strength: float = 1.0) -> torch.Tensor:
    """Apply a scaled projection away from one measured direction."""
    unit = F.normalize(direction, p=2, dim=-1)
    component = torch.sum(latent * unit, dim=-1, keepdim=True) * unit
    return latent - strength * component
```

This is a mechanism, not an erasure result. The direction may not represent one clean concept, and the same direction can behave differently at different denoising steps.

## A defensible evaluation plan

A useful experiment would define the target concept independently of the intervention, compare against an untouched control, vary the intervention step and strength, and measure both target suppression and collateral change. The report should include the model revision, prompts or dataset, seeds, noise schedule, decoding settings, and evaluation method.

Without those details, claims about semantic collapse, entropy spikes, or early-versus-late ablation remain hypotheses. DiffusionGemma is therefore best presented as a research thread and method notebook until a complete, reproducible result is available.
