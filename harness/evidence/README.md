# Evidence

Raw proof, captured — never written by hand. Every file here was produced by a script
from an execution identified by a run id.

```text
evidence/
├── logs/
│   ├── <suite>-<RUN_ID>.spec.txt          full console transcript of a suite
│   ├── server-inmemory-<RUN_ID>.log       next start log (demo server)
│   ├── server-db-unreachable-<RUN_ID>.log next start log (DB-mode server)
│   ├── build-<RUN_ID>.log                 only when the runner performed a build
│   └── adhoc/                             transcripts of exploratory runs (non-conforming
│                                          run ids, kept for traceability, not cited)
├── api-responses/<RUN_ID>/                raw HTTP from a demo-mode server
│   ├── addScore-valid.{headers.txt,body.json}
│   ├── addScore-blocked-name.body.json
│   ├── addScore-missing-name.{headers.txt,body.json}
│   ├── addScore-get-405.headers.txt
│   ├── addScore-options-preflight.headers.txt
│   ├── highestScore-demo.body.json
│   ├── highestScore-invalid-page.body.json
│   ├── page-shell.headers.txt
│   └── dotfile-and-404-probes.txt
└── database-results/<RUN_ID>/             raw HTTP from a DB-mode server
    ├── highestScore-degraded.txt          includes the wall time of the first failure
    ├── latestScore-degraded.txt
    ├── addScore-degraded.txt
    └── server-log-tail.txt
```

## Regenerating

```bash
npm run build
HARNESS_RUN_ID=RUN-2026-001 npm run test:evidence
```

The script (`automation/scripts/capture-evidence.sh`) starts both servers, records the
responses with `curl`, stops everything and leaves the ports free. It never interprets
the results — interpretation belongs to the test cases that cite these files.

## Why there are no screenshots or videos

There is no browser binary in this environment and none can be downloaded here, so no
screenshot exists for this project's UI. Rather than create an empty folder that
implies otherwise, the visual cases are marked `NOT_EXECUTED` in
[`../test-cases/manual/browser-and-visual.md`](../test-cases/manual/browser-and-visual.md).
When someone can run them, the outputs belong in:

| Folder | Contents |
| --- | --- |
| `evidence/screenshots/<RUN_ID>/` | one PNG per visual case (`TC-200-desktop-1024.png`, …) |
| `evidence/videos/<RUN_ID>/` | short recordings of motion/touch cases, referenced from the case's *Evidence* field |

## Rules

1. Evidence is generated, not authored. If you find yourself typing a response body,
   you are about to fabricate evidence — capture it instead.
2. A test case cites evidence by path; evidence never restates the case.
3. Files keep the run id in the folder or file name, so a later run never overwrites an
   earlier one silently.
4. Nothing here contains credentials: probes use the public API, and the database
   degradation run deliberately points at an unreachable address.
