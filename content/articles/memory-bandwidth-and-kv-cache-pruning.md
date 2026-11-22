---
title: "Inference Economics: Taming the KV-Cache Bottleneck"
date: "2026-08-04"
coverImage: "/images/articles/kv-cache.svg"
excerpt: "Why memory bandwidth dictates modern transformer scaling, and how dynamic attention sink heuristics reclaim GPU VRAM without perplexity spikes."
tags:
  - "kv-cache"
  - "transformers"
  - "efficiency"
  - "pytorch"
author: "Shaik Umran"
featured: false
draft: false
---

## The Arithmetic Intensity Trap

When deploying 7B+ parameter transformer models for production inference, engineers often look at FLOP counts to estimate latency. In practice, autoregressive token generation is almost completely **memory-bandwidth bound**.

During the decode phase, each new token requires reading the entire previous Key-Value (KV) cache from high-bandwidth memory (HBM) into SRAM:

$$\text{KV Cache Size} = 2 \times B \times L \times H \times D \times P$$

Where $B$ is batch size, $L$ is sequence length, $H$ is key-value head count, $D$ is head dimension, and $P$ is precision bytes (2 for FP16/BF16). At a sequence length of 32,768 tokens, a 16-batch workload can easily exceed 40 GB of VRAM solely for the KV cache.

## UniqKache: Dynamic Cache Compaction

In **UniqKache**, we study which tokens genuinely matter to attention heads as context length expands. The attention distribution in deep transformer layers exhibits two consistent phenomena:

1. **Massive Attention Sinks:** The initial 4 to 8 prompt tokens capture disproportionately massive attention scores, regardless of their semantic content. If these initial tokens are evicted, generation immediately degenerates into high-perplexity loops.
2. **Local Recency Bias:** The most recent $K$ tokens dictate grammatical coherence and immediate prompt dependencies.
3. **Mid-Context Sparsity:** Tokens between the attention sinks and the recent window exhibit sparse, episodic activation.

```python
import torch

def compute_eviction_mask(
    attention_scores: torch.Tensor, 
    sink_tokens: int = 4, 
    recent_tokens: int = 512, 
    keep_budget: int = 1024
) -> torch.Tensor:
    """Computes boolean retention mask preserving sinks, recency, and top-k attention mass."""
    seq_len = attention_scores.shape[-1]
    mask = torch.zeros(seq_len, dtype=torch.bool, device=attention_scores.device)
    
    # 1. Protect Sinks & Recency
    mask[:sink_tokens] = True
    mask[max(0, seq_len - recent_tokens):] = True
    
    # 2. Score remaining middle context
    middle_indices = torch.arange(sink_tokens, max(sink_tokens, seq_len - recent_tokens), device=attention_scores.device)
    if len(middle_indices) > 0:
        middle_scores = attention_scores[middle_indices]
        remaining_budget = max(0, keep_budget - sink_tokens - recent_tokens)
        if remaining_budget < len(middle_indices):
            top_k_middle = torch.topk(middle_scores, k=remaining_budget).indices
            mask[middle_indices[top_k_middle]] = True
        else:
            mask[middle_indices] = True
            
    return mask
```

## Practical Implications

By enforcing dynamic cache compaction, UniqKache enables sustained 32k+ token context reasoning on single commodity consumer GPUs (e.g., RTX 4090) without requiring multi-GPU pipeline parallelism or expensive H100 clusters.
