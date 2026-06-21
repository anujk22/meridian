# Meridian

Meridian is an evidence-grounded, multi-agent career decision simulator. Its built-in demo turns a graduating CS student's job-versus-startup-versus-research decision into a transparent model with retrieval-augmented generation, independent perspective memos, adversarial review, uncertainty, live what-if controls, and a conditional verdict.

## Run

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:4173/`.

### Use LM Studio as the council brain

1. Open LM Studio and load one chat/instruct model.
2. In **Developer**, start the local server on port `1234`.
3. Optionally load `nomic-embed-text-v1.5` too for runtime semantic retrieval. Keyword retrieval remains available without it.
4. Start Meridian, choose **Live local**, select the discovered model, and enter the observatory.

You can confirm LM Studio is reachable with:

```bash
curl http://127.0.0.1:1234/v1/models
```

The Vite localhost proxy sends live council generation to `/v1/chat/completions` and retrieval queries to `/v1/embeddings`. Live mode retrieves evidence first, runs Harbor, Aster, and Lumen as separate grounded calls, and then gives all three memos to Vesper for cross-examination. No prompt, result, or evidence leaves this machine. Curated mode remains available for a deterministic recording.

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

The 31 source excerpts and provenance records live in `src/evidence/corpus.ts`. The semantic index in `src/evidence/evidence-index.json` was produced with the loaded LM Studio embedding model:

```bash
bun scripts/build-evidence-index.ts
```

Built-in queries use the precomputed semantic index. New queries use the localhost LM Studio embeddings endpoint and fall back to local keyword overlap if embeddings are unavailable. Generated factual claims may cite only IDs that were retrieved for that agent; unknown or missing citations fail validation.

## Architecture

Live mode follows `retrieve → three independent advocates → Vesper cross-examination → deterministic simulation`. The curated debate and live council both emit bounded `ModelMutation` values into one `DecisionModel`. `computeDecision` is the only path to scenario shares, floor and ceiling values, leader selection, and sensitivity output. Displayed percentages are never stored in scenario or model content.
