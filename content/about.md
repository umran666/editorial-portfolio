---
siteTitle: "Shaik Umran — AI Research Lab Journal"
siteSubtitle: "Tokenization, inference memory, and model behavior"
authorName: "Shaik Umran"
authorRole: "Independent AI/ML Researcher & Software Engineer"
bio: "I study AI systems by opening up the layers that are easy to hide: how text becomes tokens, how inference memory grows, and what changes when a model is intervened on."
email: "shaikumran487@gmail.com"
avatarUrl: "/images/avatar.jpg"
social:
  github: "https://github.com/umran666"
  huggingface: "https://huggingface.co/Umranz"
  linkedin: "https://linkedin.com/in/shaik-umran-2729bb359"
  rss: "/rss.xml"
skills:
  - "Python & Rust"
  - "Tokenizers & NLP"
  - "Transformers & LLMs"
  - "Inference Memory & KV Caches"
  - "Diffusion Models & Ablation"
  - "PyTorch & Hugging Face"
experience:
  - role: "Independent AI/ML Researcher"
    company: "Independent work"
    period: "2024 — Present"
    description: "Building, testing, and documenting small research tools around tokenization, inference efficiency, and model behavior."
  - role: "B.Tech in Computer Science & Engineering"
    company: "Mohan Babu University"
    period: "2023 — 2027 (Expected)"
    description: "Studying computer science foundations alongside hands-on work in machine learning systems."
---

## What this journal records

Most people meet a language model at the prompt box. I usually start one layer lower: what the text became before the model saw it, where memory went during generation, and what changed inside a model after a controlled intervention.

This is a lab journal, not a catalogue of finished products. Each entry should make clear whether it is an implementation, an experiment, a design hypothesis, or a result that has been measured carefully enough to share.

### Current threads

- **UniqToken** — a tokenizer research toolkit with Unigram and BPE training, CEM/SuperBPE extensions, Unicode-aware preprocessing, byte fallback, offsets, and a bundled Rust extension.
- **UniqKache** — an investigation into adaptive key-value cache compaction and the memory costs of long-context inference.
- **DiffusionGemma** — a research thread on controlled interventions in diffusion-based language models and the behavior they change.

I write down what survives contact with the implementation: the useful result, the failed assumption, the missing measurement, and the next experiment. When evidence is incomplete, the note should say so.

If you are working on tokenizers, model efficiency, or model behavior, [send me a note](mailto:shaikumran487@gmail.com).
