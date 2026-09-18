# ⚔️ AI Battle Arena

> **A multi-model framework for generating, evaluating, and comparing LLM-generated solutions.**

AI Battle Arena is being developed as both a working AI application and a foundation for a final-year Software Engineering research project.

**Research title:** `AI-Based Framework for Comparative Evaluation of Large Language Model Generated Solutions`

## 🟢 Current Development Status

```text
                    AI BATTLE ARENA
                           │
              ┌────────────┴────────────┐
              │                         │
          MODEL LAYER               GRAPH LAYER
              │                         │
       ┌──────┼──────┐          ┌───────┼────────┐
       │      │      │          │       │        │
      Groq  Cohere OpenRouter  Standard Reasoning Coding
       │      │      │          │       │        │
       └──────┴──────┘          │       │        │
              │                 │       │        │
              └──────────────►  │       │        │
                                ▼       ▼        ▼
                              LIVE    NEXT     RESEARCH
                              NOW    PHASE     CORE
```

### Status Legend

| Symbol | Meaning |
|---|---|
| 🟢 | Working / implemented |
| 🟡 | In active development |
| ⚪ | Planned |
| 🔬 | Research-focused |
| ⚡ | Performance / infrastructure |

### Current Snapshot

- 🟢 Multi-model abstraction
- 🟢 Centralized Model Registry
- 🟢 6 registered models
- 🟢 Standard Mode graph
- 🟢 Parallel solver execution
- 🟢 AI Judge
- 🟢 Structured judge output
- 🟢 Tavily web-search tool
- 🟢 OpenRouter + Ling tool calling
- 🟢 Groq tool calling
- 🟢 SSE real-time events
- 🟢 `/models` API
- 🟢 Execution timing
- 🟡 Model roles (`fighter` / `judge`)
- 🟡 Frontend dynamic model selection
- 🟡 Reasoning Mode
- 🔬 Coding Mode
- 🔬 Objective code evaluation
- ⚪ Benchmark dataset
- ⚪ Experiment pipeline
- ⚪ Result persistence
- ⚪ Research analysis

# 🧠 Current Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   FRONTEND UI   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  /invoke (SSE) │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Battle / Graph │
                         │    Controller   │
                         └────────┬────────┘
                                  │
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
             ┌──────────┐   ┌───────────┐   ┌───────────┐
             │ STANDARD │   │ REASONING │   │  CODING   │
             │   GRAPH  │   │   GRAPH   │   │   GRAPH   │
             └────┬─────┘   └─────┬─────┘   └─────┬─────┘
                  │               │               │
                  └───────────────┼───────────────┘
                                  ▼
                         ┌─────────────────┐
                         │  MODEL REGISTRY │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
          ┌──────┐             ┌───────┐         ┌──────────┐
          │ Groq │             │Cohere │         │OpenRouter│
          └──────┘             └───────┘         └──────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  AI EVALUATION  │
                         │      JUDGE      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ FINAL COMPARISON│
                         └─────────────────┘
```

# ⚡ Standard Mode — Currently Live

```text
USER QUESTION
     │
     ▼
┌─────────────────┐
│ Standard Graph  │
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
    ┌─────────┐        ┌─────────┐
    │ Solver 1│        │ Solver 2│
    └────┬────┘        └────┬────┘
         │                  │
         └────────┬─────────┘
                  ▼
             ┌────────┐
             │  JUDGE │
             └────┬───┘
                  ▼
        ┌──────────────────┐
        │ Scores + Winner  │
        └──────────────────┘
```

The two solver branches are independent and execute concurrently before the judge runs.

# 📡 Real-Time Streaming Architecture

Today's SSE implementation separates **graph state** from **live progress events**.

```text
                    LangGraph
                       │
              ┌────────┴────────┐
              │                 │
         return {...}       writer({...})
              │                 │
              ▼                 ▼
          UPDATES             CUSTOM
              │                 │
              └────────┬────────┘
                       ▼
                 graph.stream()
                       │
                       ▼
                 graphAIInvoke()
                       │
                    onEvent()
                       │
                       ▼
                  Express SSE
                       │
                       ▼
                    Browser
```

Graph nodes use `getWriter()` to emit transient lifecycle events. These enter the LangGraph `custom` stream rather than graph state.

```ts
const writer = getWriter();

writer({
  event: "judge_started",
  data: { judge: judge.name }
});
```

The graph streams both channels:

```ts
streamMode: ["updates", "custom"]
```

| Stream | Purpose |
|---|---|
| `updates` | Graph state / node results |
| `custom` | Live events emitted with `writer()` |

# 📣 Current Event Lifecycle

```text
battle_started
      │
      ▼
solver_started × 2
      │
      ▼
solver_completed × 2
      │
      ▼
judge_started
      │
      ▼
judge_completed
      │
      ▼
battle_completed
      │
      ▼
battle_result
```

# 🔧 Model Layer

```text
                    ModelPlugin
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       GroqPlugin   CoherePlugin  OpenRouterPlugin
          │             │             │
          ▼             ▼             ▼
        Groq          Cohere       OpenRouter
```

The abstraction exposes common capabilities such as `generate()`, `generateStructured()`, tool calling, structured output, streaming, vision, and reasoning metadata.

# 🤖 Current Model Registry

| ID | Model | Provider | Current role |
|---|---|---|---|
| `groq-gpt-oss-20b` | GPT-OSS 20B | Groq | Fighter |
| `groq-gpt-oss-120b` | GPT-OSS 120B | Groq | Judge |
| `cohere` | Cohere | Cohere | Fighter |
| `openrouter-ling` | Ling 3.0 Flash VL | OpenRouter | Fighter |
| `openrouter-llama` | Llama 3.3 70B | OpenRouter | Fighter |
| `openrouter-nex-mini` | Nex-N2.5-Mini | OpenRouter | Fighter |

> The registry is being prepared to explicitly distinguish fighter and judge models.

# 🌐 Web Search / Tool Calling

```text
LLM
 │
 │ requests searchInternet
 ▼
searchInternetTool
 │
 ▼
executeSearchTool()
 │
 ▼
Tavily
 │
 ▼
Search Results
 │
 ▼
LLM final response
```

The search tool is intended for latest, current, recent, and time-sensitive questions. Search result content is trimmed before being returned to the model to reduce unnecessary context.

# 🦙 OpenRouter + Ling Tool Loop

```text
Ling
 │
 ├── normal response ───────────────► return
 │
 └── tool call
       │
       ▼
   parse arguments
       │
       ▼
   Tavily search
       │
       ▼
   search results
       │
       ▼
   fresh final prompt
       │
       ▼
   Ling final answer
```

The final request is sent without tools after search execution so the model can synthesize the retrieved information instead of repeatedly requesting the same tool.

# 🧑‍⚖️ AI Judge

```text
GPT-OSS 120B
      │
      ▼
Compare Solution 1 + Solution 2
      │
      ▼
Structured Evaluation
      │
      ├── Solution 1 score
      ├── Solution 2 score
      ├── Solution 1 reasoning
      ├── Solution 2 reasoning
      └── Winner
```

Current qualitative evaluation dimensions include correctness, relevance, quality, completeness, reasoning, efficiency, and overall usefulness. Coding Mode is intended to add objective execution evidence later.

# ⏱️ Performance

One development benchmark observed end-to-end battle latency around **17–18 seconds**, compared with an earlier observed run around **60 seconds**.

```text
Earlier observed
██████████████████████████████████████████████████ ~60s

Current observed
██████████████ ~17–18s
```

The change came from multiple engineering improvements, especially parallel solver execution, tool/search optimization, search-result trimming, model/tool-call fixes, and structured judging.

> These are development observations, not formal benchmark results. Formal performance evaluation is planned later.

# 🔬 Research Architecture

```text
              AI SOLVERS
             /     |     \
            /      |      \
        Model A  Model B  Model C
            \      |      /
             \     |     /
              ▼    ▼    ▼
          GENERATED SOLUTIONS
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
 AI QUALITATIVE JUDGE    OBJECTIVE EXECUTION
       │                     │
       │                 ┌───┼───────────┐
       │                 ▼   ▼           ▼
       │               Tests Runtime   Memory
       │                 │
       │                 ▼
       │             Pass / Fail
       │
       └──────────┬──────────┘
                  ▼
          COMPARATIVE ANALYSIS
```

The research design deliberately separates AI-based qualitative assessment from objective execution-based evidence.

# 💻 Coding Mode — Research Core

```text
Problem
  │
  ├──────────────┐
  ▼              ▼
AI Solvers    Test Generator
  │              │
  ▼              ▼
Solutions      Test Cases
  │              │
  │         ┌────┴─────┐
  │         ▼          ▼
  │       Oracle     Executor
  │         │          │
  └─────────┴────┬─────┘
                 ▼
          Objective Results
                 │
                 ▼
        AI + Execution Judge
                 │
                 ▼
        Comparative Evaluation
```

Planned objective measurements:

- Public test pass rate
- Hidden test pass rate
- Edge-case performance
- Stress-test behavior
- Runtime
- Memory usage
- Compilation/runtime failures
- Failure type
- Robustness

# 🧪 Research Evaluation Dimensions

```text
┌──────────────────────────────┐
│       AI SOLUTION QUALITY    │
├──────────────────────────────┤
│ ✓ Correctness                │
│ ✓ Reasoning quality          │
│ ✓ Code quality               │
│ ✓ Efficiency                 │
│ ✓ Robustness                 │
│ ✓ Instruction adherence      │
└──────────────────────────────┘
```

# 🗺️ Development Roadmap

```text
                         NOW
                          │
                          ▼
                 ┌────────────────┐
                 │ Standard Mode  │
                 │     🟢 LIVE    │
                 └───────┬────────┘
                         │
                         ▼
                 ┌────────────────┐
                 │ Model Selection│
                 │      🟡        │
                 └───────┬────────┘
                         │
                         ▼
                 ┌────────────────┐
                 │ Reasoning Mode │
                 │      🟡        │
                 └───────┬────────┘
                         │
                         ▼
                 ┌────────────────┐
                 │  Coding Mode   │
                 │   🔬 CORE      │
                 └───────┬────────┘
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          Tests        Oracle     Executor
             │           │           │
             └───────────┼───────────┘
                         ▼
                  Objective Metrics
                         │
                         ▼
                  Experiment Engine
                         │
                         ▼
                    Research Data
                         │
                         ▼
                       PAPER
```

# 📊 Progress Map

```text
Architecture              ████████████████████  🟢
Model abstraction         ████████████████████  🟢
Model registry            ██████████████████░░  🟢
Standard graph            ████████████████████  🟢
Parallel execution        ████████████████████  🟢
Web search                ████████████████████  🟢
Tool calling              ████████████████████  🟢
AI judging                ████████████████████  🟢
SSE streaming             ████████████████████  🟢
Frontend model selection  ████████░░░░░░░░░░░░  🟡
Reasoning mode            █████░░░░░░░░░░░░░░░  🟡
Coding mode               ██░░░░░░░░░░░░░░░░░░  🔬
Objective execution      ░░░░░░░░░░░░░░░░░░░░  ⚪
Benchmarking              ░░░░░░░░░░░░░░░░░░░░  ⚪
Experiments               ░░░░░░░░░░░░░░░░░░░░  ⚪
```

# 🧩 Current Engineering Takeaways

### Provider abstraction
Different providers expose different APIs and capabilities. The `ModelPlugin` layer keeps graph logic provider-agnostic.

### Tool-calling differences
Provider/model tool-call formats and behavior are not identical, so provider-specific handling remains behind the common interface.

### State vs events

```text
State  → what the graph ultimately produces
Writer → what the application needs to know live
```

### Parallelism
Independent solver branches can execute concurrently before the judge requires both results.

### Search is not truth
Web retrieval does not guarantee factual correctness. Retrieved evidence can be weak, outdated, conflicting, or misunderstood.

### Coding evaluation
The planned research evaluation combines:

```text
LLM evaluation
      +
actual execution
      +
objective metrics
```

# 🧪 Research Experiment Direction

A future experiment can compare AI-judge assessments with execution outcomes for the same generated solutions:

```text
                Solution A
                   │
          ┌────────┴────────┐
          ▼                 ▼
      AI Judge          Executor
          │                 │
          ▼                 ▼
       Score A          Result A

                Solution B
                   │
          ┌────────┴────────┐
          ▼                 ▼
      AI Judge          Executor
          │                 │
          ▼                 ▼
       Score B          Result B
```

A case such as:

```text
AI Judge:     A > B
Execution:    B > A
```

can become research data for studying disagreement between qualitative model-based evaluation and objective execution evidence.

# 📝 Development Log

**Current phase:** Core infrastructure → specialized evaluation modes

**Current live capability:** Standard multi-model battle with AI judging, web search/tool calling, structured evaluation, timing, and SSE progress events.

**Next development focus:**

1. Explicit fighter/judge model roles
2. Dynamic frontend model selection
3. Reasoning Mode
4. Coding Mode architecture
5. Objective execution pipeline

# ⚠️ Not Implemented Yet

- ❌ Coding test-case generation
- ❌ Oracle/reference execution pipeline
- ❌ Sandboxed code executor
- ❌ Runtime/memory measurement pipeline
- ❌ Hidden test evaluation
- ❌ Automated benchmark dataset
- ❌ Persistent experiment database
- ❌ Statistical experiment analysis
- ❌ Final research-paper experiments

# 📚 Research Paper Connection

The application is being developed toward:

> **AI-Based Framework for Comparative Evaluation of Large Language Model Generated Solutions**

The implementation provides the experimental platform, while the research work will focus on:

```text
LLM-generated solutions
        ↓
multi-dimensional evaluation
        ↓
AI-based judgment
        +
objective execution evidence
        ↓
comparative analysis
```

The project is moving from an AI demo toward an experimental evaluation framework for systematically comparing LLM-generated solutions under controlled evaluation conditions.

# 🚀 Development Philosophy

```text
Don't just generate.
        ↓
Evaluate.
        ↓
Don't just evaluate.
        ↓
Validate.
        ↓
Don't just validate.
        ↓
Measure.
        ↓
Don't just measure.
        ↓
Compare.
```

# ⭐ Current Status

```text
┌───────────────────────────────────────────────┐
│                                               │
│       AI BATTLE ARENA                         │
│                                               │
│       STANDARD MODE        🟢 LIVE            │
│       SSE STREAMING        🟢 LIVE            │
│       TOOL CALLING         🟢 LIVE            │
│       AI JUDGE             🟢 LIVE            │
│       MODEL REGISTRY       🟢 LIVE            │
│                                               │
│       REASONING MODE       🟡 NEXT            │
│       CODING MODE          🔬 RESEARCH CORE   │
│                                               │
│       STATUS: ACTIVE DEVELOPMENT              │
│                                               │
└───────────────────────────────────────────────┘
```

*Last updated: September 2026*
