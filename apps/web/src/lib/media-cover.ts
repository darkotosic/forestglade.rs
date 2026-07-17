import type { MediaAssetDto } from "./types";
export function selectApartmentCover(media:MediaAssetDto[]|undefined){const published=(media??[]).filter(item=>item.isPublished);return published.find(item=>item.isCover)??published.find(item=>item.placement==="APARTMENT_CATALOG")??published[0]??null;}
