---
title: "UniqKache: Adaptive KV-Cache Eviction for Transformers"
date: "2026-07-10"
summary: "Research into dynamic key-value cache compaction, memory footprint reduction, and long-context inference optimization in autoregressive transformers."
tags:
  - "kv-cache"
  - "transformers"
  - "efficiency"
  - "pytorch"
techStack:
  - "Python"
  - "PyTorch"
  - "KV-Cache"
  - "CUDA"
  - "Optimization"
githubUrl: "https://github.com/umran666"
liveDemoUrl: "https://github.com/umran666"
featured: true
role: "Core Researcher"
metrics: "40% Memory Compaction · Sub-0.1 Perplexity Drift"
draft: false
---

## The Memory Bandwidth Bottleneck

During autoregressive generation in Large Language Models, memory bandwidth consumed by Key-Value (KV) cache retrieval quickly exceeds compute intensity. For long contexts (32k+ tokens), the KV-cache occupies dozens of gigabytes of VRAM per batch, forcing low batch sizes and inflating inference latency.

**UniqKache** investigates adaptive token eviction heuristics that prune redundant KV pairs on-the-fly while preserving attention mass on critical positional sinks and semantic anchors.

## Architecture & Pruning Heuristics

1. **Attention Sink Preservation:** Initial prompt tokens and recent local context tokens are strictly protected to preserve baseline attention distributions.
2. **Dynamic Mass Scoring:** Mid-sequence tokens are evaluated via cumulative attention weights; tokens below an entropy threshold are dynamically pruned from cache tensors.
3. **Pipelined Cache Compaction:** In-place tensor slicing minimizes GPU memory fragmentation during continuous streaming.
