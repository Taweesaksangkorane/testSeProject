# Architecture implementation index

This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

## Implementation Guide

### Global artifacts

- `unit_graph.yaml`: locate the assigned unit, trigger, dependencies, exported signatures, and dynamic Next.js entrypoint.
- `migration_boundary.yaml`: use `must_rewrite` as implementation scope; source anchors are not rewrite targets.
- `wire_contracts.yaml`: filter rows by `unit`; frozen request, response, and error shapes must remain stable.
- `shared_modules.yaml`: filter `used_by_units`; currently no module crosses two external units.
- `cross_unit_state.yaml`: filter writer/reader unit; currently no implicit cross-unit state was found.
- `seams.yaml`: filter `cut_between`; the declared legacy UI/API seam is authoritative.

### Unit: rs1-form-page

- External trigger: GET `/` and browser upload/review/edit/export actions.
- Must read: `units/rs1-form-page/behavior.yaml`, `units/rs1-form-page/bindings.yaml`, and advisory `units/rs1-form-page/unit_decomposition.yaml`.
- Relevant globals: all contracts reached through `depends_on`; the seam whose frozen side is this unit.
- Before DONE report: artifact paths read, preserved upload/review/export behavior, unresolved contracts, and browser/build evidence.

### Unit: extract-api

- External trigger: POST `/api/extract`.
- Must read: `units/extract-api/behavior.yaml`, `units/extract-api/bindings.yaml`, and advisory `units/extract-api/unit_decomposition.yaml`.
- Relevant globals: `wire_contracts.yaml` row `rs1-upload-extraction` and the declared legacy response seam.
- Before DONE report: artifact paths read, implemented `must_preserve` items, deferred PDF/OCR contracts, and test/build/API evidence.

### Unit: generate-docx-api

- External trigger: POST `/api/generate-docx`.
- Must read: `units/generate-docx-api/behavior.yaml`, `units/generate-docx-api/bindings.yaml`, and advisory `units/generate-docx-api/unit_decomposition.yaml`.
- Relevant globals: `wire_contracts.yaml` row `rs1-docx-generation`.
- Before DONE report: artifact paths read, preserved native-template behavior, unresolved contracts, and DOCX smoke evidence.

### Unit: convert-docx-pdf-api

- External trigger: POST `/api/convert-docx-pdf`.
- Must read: `units/convert-docx-pdf-api/behavior.yaml`, `units/convert-docx-pdf-api/bindings.yaml`, and advisory `units/convert-docx-pdf-api/unit_decomposition.yaml`.
- Relevant globals: `wire_contracts.yaml` row `rs1-pdf-conversion`.
- Before DONE report: artifact paths read, preserved validation/cleanup behavior, unresolved hosting constraint, and PDF smoke evidence.
