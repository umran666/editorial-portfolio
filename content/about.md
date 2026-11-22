---
siteTitle: "Shaik Umran — Research & Engineering Journal"
siteSubtitle: "Language Models, Tokenizer Architectures & Diffusion Research"
authorName: "Shaik Umran"
authorRole: "AI/ML Researcher & Software Engineer"
bio: "I build and study the parts of AI systems that are easy to hide: tokenization, inference memory, and model behavior under controlled changes."
email: "shaikumran487@gmail.com"
avatarUrl: "/images/avatar.jpg"
social:
  github: "https://github.com/umran666"
  huggingface: "https://huggingface.co/Umranz"
  linkedin: "https://linkedin.com/in/shaik-umran-2729bb359"
  twitter: "https://x.com/umran_shaik"
  portfolio: "https://portfolio-theta-rust-tv2yg490pa.vercel.app/"
  rss: "/rss.xml"
skills:
  - "Python & SQL"
  - "Machine Learning & Deep Learning"
  - "NLP, Transformers & LLMs"
  - "Tokenizer Engineering (BPE, Unigram, SuperBPE)"
  - "Retrieval-Augmented Generation (RAG)"
  - "PyTorch, Hugging Face & LangChain"
  - "Diffusion Models & Concept Ablation"
  - "KV-Cache Optimization & Long-Context Efficiency"
experience:
  - role: "Independent AI/ML Researcher"
    company: "Autonomous Research Lab"
    period: "2024 — Present"
    description: "Architected UniqToken from scratch, engineered adaptive KV-cache management algorithms (UniqKache), and performed empirical concept ablation on diffusion models (DiffusionGemma)."
  - role: "B.Tech in Computer Science & Engineering (CGPA: 9.11/10)"
    company: "Mohan Babu University"
    period: "2023 — 2027 (Expected)"
    description: "Specializing in computational linguistics, deep learning foundations, and high-performance algorithms."
---

## What I keep coming back to

Most people meet a language model at the prompt box. I usually start one layer lower: what the text became before the model saw it, where memory went during generation, and what changed inside a diffusion model after a controlled intervention.

That is the common thread across my work. I like systems that can be opened up, measured, and argued with. The projects here are small research tools and experiments rather than claims of finished solutions.

### Three working threads

- **UniqToken** — a tokenizer toolkit for comparing BPE, Unigram, and SuperBPE, with Unicode-aware preprocessing, byte fallback, and benchmark tooling.
- **UniqKache** — experiments around dynamic key-value cache compaction and the memory costs of long-context inference.
- **DiffusionGemma** — controlled concept-ablation experiments focused on how changes inside a diffusion model affect its behavior.

I build these projects in Python and Rust, then write down what survived contact with the implementation. Some notes are about an idea; others are about a failure, a trade-off, or a result that needs more evidence.

If you are working on tokenizers, model efficiency, or diffusion systems, [send me a note](mailto:shaikumran487@gmail.com).
