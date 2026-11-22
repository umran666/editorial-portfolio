---
title: "The KV Cache Is a Memory Problem Before It Is a Pruning Problem"
date: "2026-08-04"
coverImage: "/images/articles/kv-cache.svg"
excerpt: "A research note on KV-cache growth, attention-sink heuristics, and the measurements needed before cache compaction becomes a trustworthy optimization."
tags:
  - "kv-cache"
  - "transformers"
  - "efficiency"
  - "pytorch"
author: "Shaik Umran"
featured: false
draft: false
---

When a transformer generates one token at a time, the key-value cache grows with the sequence. The arithmetic is simple; the engineering trade-off is not. A cache policy must balance memory, bandwidth, latency, output quality, and the overhead of deciding what to retain.

For batch size $B$, sequence length $L$, key-value head count $H$, head dimension $D$, and $P$ bytes per element, a simplified cache estimate is:

$$\text{KV bytes} = 2 \times B \times L \times H \times D \times P$$

The expression is a capacity estimate, not a complete latency model. Layout, kernel behavior, paging, quantization, and batch scheduling all matter.

## A retention policy is a hypothesis

A common design sketch protects a small prefix, keeps a recent window, and scores the middle context. That can be a useful baseline, but terms such as “attention sink” and “local recency” should be treated as hypotheses to test for the target model and workload—not universal constants.

```python
import torch


def retention_mask(scores: torch.Tensor, keep_budget: int, prefix: int = 4, recent: int = 512) -> torch.Tensor:
    """Keep a prefix, a recent window, then the highest-scoring middle tokens."""
    seq_len = scores.shape[-1]
    mask = torch.zeros(seq_len, dtype=torch.bool, device=scores.device)
    prefix_end = min(prefix, seq_len)
    recent_start = max(prefix_end, seq_len - recent)
    mask[:prefix_end] = True
    mask[recent_start:] = True

    middle = torch.arange(prefix_end, recent_start, device=scores.device)
    remaining = max(0, keep_budget - int(mask.sum().item()))
    if middle.numel() and remaining:
        chosen = middle if remaining >= middle.numel() else middle[torch.topk(scores[middle], k=remaining).indices]
        mask[chosen] = True
    return mask
```

The guard matters: the requested budget can be smaller than the protected prefix plus recent window, and the middle can be empty. The function produces a mask; it does not prove that the retained context is sufficient.

## What a real experiment must report

A useful cache-compaction result needs at least a baseline policy, model and implementation revision, context lengths, batch shape, device, precision, latency measurement method, memory measurement method, and a quality metric. If the workload is a language-model continuation task, perplexity drift may be relevant; for instruction following or retrieval, task-level behavior may matter more.

Until those conditions are recorded together, the responsible conclusion is narrower: cache compaction is a promising systems question, and UniqKache is a place to test it—not evidence that a particular percentage of memory or quality has already been recovered.
