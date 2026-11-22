---
title: "Concept Ablation in Diffusion Language Models"
date: "2026-09-14"
coverImage: "/images/articles/diffusion-ablation.svg"
excerpt: "Quantifying orthogonal concept erasure, continuous representation steering, and generative entropy across denoising trajectories."
tags:
  - "diffusion"
  - "transformers"
  - "deep learning"
  - "research"
author: "Shaik Umran"
featured: true
draft: false
---

## Beyond Autoregressive Monopolies

Autoregressive language models generate text strictly sequentially, conditioned on previous tokens:

$$P(x_1, \dots, x_T) = \prod_{t=1}^T P(x_t \mid x_{<t})$$

While remarkably scalable, autoregression enforces an asymmetrical temporal bias: early errors compound inevitably, and bidirectional global editing requires re-prompting or expensive rejection sampling.

Diffusion models invert this dynamic by framing generation as continuous reverse denoising:

$$q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t} x_{t-1}, \beta_t \mathbf{I})$$

Because all token positions evolve simultaneously in continuous latent space, diffusion models expose a unique capability: **direct mathematical steering and targeted concept ablation without fine-tuning weights.**

## Orthogonal Projection in Latent Trajectories

In my research on **DiffusionGemma**, I study how semantic concepts organize geometrically in the model's intermediate representations. If a concept vector $\mathbf{v}_c$ represents a specific stylistic attribute or domain bias, we can ablate that concept at timestep $t$ by projecting the latent representation $\mathbf{z}_t$ onto the orthogonal complement of $\mathbf{v}_c$:

$$\mathbf{z}_t^{\text{ablated}} = \mathbf{z}_t - \frac{\mathbf{z}_t \cdot \mathbf{v}_c}{\|\mathbf{v}_c\|^2} \mathbf{v}_c$$

```python
import torch
import torch.nn.functional as F

def ablate_concept_step(
    latent: torch.Tensor, 
    concept_direction: torch.Tensor, 
    alpha: float = 1.0
) -> torch.Tensor:
    """Project intermediate diffusion latents away from a concept vector."""
    norm_v = F.normalize(concept_direction, p=2, dim=-1)
    parallel_component = torch.sum(latent * norm_v, dim=-1, keepdim=True) * norm_v
    return latent - (alpha * parallel_component)
```

## Observations and Future Questions

Our preliminary findings indicate that concept erasure early in the diffusion trajectory ($\text{timestep } t > 0.7 T$) completely restructures the semantic theme, whereas late-stage ablation ($t < 0.2 T$) merely modifies lexical choices without disrupting the underlying narrative.

The challenge remains balancing concept suppression against semantic collapse. When orthogonal projections remove too much variance from intermediate representations, the reverse diffusion process can experience sudden entropy spikes.
