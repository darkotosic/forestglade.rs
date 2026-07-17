import assert from "node:assert/strict";import test from "node:test";import {parseCatalogFilename} from "../catalog-filename-parser";
for(const [name,slug] of [["stan 01.jpg","a1"],["stan-31.jpg","a31"],["A08-katalog.png","a8"],["apartman_17.webp","a17"],["catalog-page-10.jpg","a1"],["catalog-page-40.jpg","a31"]])test(name,()=>assert.equal(parseCatalogFilename(name).slug,slug));
for(const name of ["catalog-page-9.jpg","stan-32.jpg","render-final.jpg"])test(`${name} unresolved`,()=>assert.equal(parseCatalogFilename(name).slug,null));
