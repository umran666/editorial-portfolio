---
title: "DiffusionGemma: Controlled Model Interventions"
date: "2026-08-20"
summary: "A research thread for studying representation changes and controlled interventions in diffusion-based language models."
tags:
  - "diffusion"
  - "transformers"
  - "deep learning"
  - "model behavior"
techStack:
  - "Python"
  - "PyTorch"
  - "Transformers"
  - "Hugging Face"
  - "Diffusion"
featured: true
role: "Research notebook"
draft: false
---

## Research question

Diffusion-based language models expose an iterative generation process rather than a single left-to-right decoding path. That makes them a useful setting for asking how internal representations change when a controlled intervention is applied at different stages.

**DiffusionGemma** is a working research thread around that question. This page describes a method and an evaluation plan; it does not claim a completed ablation result.

## A possible intervention

For a latent state $\mathbf{z}$ and a direction $\mathbf{v}$ associated with a testable concept, an orthogonal projection removes the component of $\mathbf{z}$ parallel to $\mathbf{v}$:

$$\mathbf{z}' = \mathbf{z} - \frac{\mathbf{z} \cdot \mathbf{v}}{\|\mathbf{v}\|^2}\mathbf{v}$$

```python
import torch
import torch.nn.functional as F


def project_orthogonal(latent_state: torch.Tensor, concept_vector: torch.Tensor) -> torch.Tensor:
    """Remove one measured direction from a latent state."""
    direction = F.normalize(concept_vector, p=2, dim=-1)
    component = torch.sum(latent_state * direction, dim=-1, keepdim=True) * direction
    return latent_state - component
```

The code is only the intervention. A credible experiment would also need a way to define the direction, select intervention steps, preserve a control condition, and measure both target suppression and unrelated semantic drift.

## Evidence boundary

Claims about “concept erasure,” entropy changes, or semantic preservation require a recorded dataset, seed policy, noise schedule, baseline, and evaluation metrics. Until those are available, this remains a method note and a list of questions rather than a result report.
