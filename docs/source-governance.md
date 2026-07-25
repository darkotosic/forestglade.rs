# Official source governance

## Source hierarchy

The approved PGD documentation is the primary source of truth for official apartment
data. The catalogue is a secondary marketing source. Catalogue content may enrich
marketing copy, but it must never silently replace a conflicting PGD value. Every
conflict remains `POTREBNA_PROVERA` until resolved against an approved primary source.

## Locked A1–A31 fields

For apartments A1 through A31, the following are source-locked: apartment count,
`code`, `slug`, `floor`, `officialType`, `marketArea`, walls, spatial arrangement, and
all official room or apartment areas. Do not derive these values from renders or
marketing material. A routine content, sales, import, or seed operation must not alter
them.

## Verification states

- `VERIFIED` means the value has been checked against an identified approved source,
  is legible and unambiguous, and its source reference is recorded.
- `POTREBNA_PROVERA` means the value is unclear, incomplete, conflicts across sources,
  or lacks sufficient lineage. It must not be presented as a verified official fact.

Absence of a conflict is not itself verification. Marketing approval is not a
substitute for technical verification against PGD.

## OWNER override procedure

An exceptional change to a locked field requires all of the following:

1. An authenticated active `OWNER` initiates the change through an official-field
   workflow; direct database edits are prohibited.
2. The owner supplies an explicit override flag and a meaningful audit reason of at
   least 20 characters that explains why the previous value is being superseded.
3. The change records the source document, page, revision, actor, timestamp, previous
   value, and new value. If the evidence is not conclusive, its status remains
   `POTREBNA_PROVERA`.
4. A second-person review is required before a disputed value is marked `VERIFIED`.
5. Schema changes use a new Prisma migration. Official dataset changes receive code
   review and are reconciled through the deliberate official seed; never use
   `prisma db push` or an automatically destructive seed.

Audit reasons document provenance; they do not authorize storing source documents,
credentials, tokens, or other secrets in the audit log.
