# Meridian

Meridian is a cinematic, local-first life decision simulator. Its built-in demo turns a graduating CS student's job-versus-startup-versus-research decision into a transparent model with evidence, uncertainty, adversarial review, live what-if controls, and a conditional verdict.

## Run

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:4173/`.

### Use LM Studio as the council brain

1. Open LM Studio and load one chat/instruct model.
2. In **Developer**, start the local server on port `1234`.
3. Optionally load `nomic-embed-text-v1.5` too for semantic evidence retrieval.
4. Start Meridian, choose **Live local**, select the discovered model, and enter the observatory.

You can confirm LM Studio is reachable with:

```bash
curl http://127.0.0.1:1234/v1/models
```

The Vite localhost proxy sends live council generation to `/v1/chat/completions` and retrieval queries to `/v1/embeddings`. No prompt, result, or evidence leaves this machine. The curated mode remains available for a deterministic recording.

- Recording mode: `http://127.0.0.1:4173/?recording=1`
- Fast deterministic QA: `http://127.0.0.1:4173/?recording=1&speed=20`

Recording mode hides presenter controls. During the deliberation, `Space` pauses or resumes and `R` returns to intake.

## Verify

```bash
bun run test
bun run test:e2e
bun run build
bun run lint
bun audit
```

The browser test checks the full demo, all three recommendation flips, 1440×900 and 1440×810 layouts, reduced motion, console errors, and non-local runtime traffic.

## Local evidence

The source excerpts and provenance metadata live in `src/evidence/corpus.ts`. The semantic index in `src/evidence/evidence-index.json` was produced with the loaded LM Studio embedding model:

```bash
bun scripts/build-evidence-index.ts
```

Built-in queries use the precomputed semantic index. New queries use the localhost LM Studio embeddings endpoint and fall back to local keyword overlap if embeddings are unavailable.

## Architecture

The scripted debate and what-if controls both emit `ModelMutation` values into one `DecisionModel`. `computeDecision` is the only path to scenario shares, floor and ceiling values, leader selection, and sensitivity output. Displayed percentages are never stored in scenario content.
