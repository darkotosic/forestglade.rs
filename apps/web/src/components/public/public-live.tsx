"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { publicFetch } from "@/lib/api";
import { statusLabels } from "@/lib/admin-api";
import type { AdminApartmentDto, MediaAssetDto } from "@/lib/types";
export function PublicApartmentStatus({slug,fallback="Slobodan"}:{slug:string;fallback?:string}){const[s,setS]=useState(fallback);useEffect(()=>{publicFetch<{ok:true;apartment:AdminApartmentDto}>(`/apartments/${slug}`).then(d=>d?.apartment?.status&&setS(statusLabels[d.apartment.status]??d.apartment.status))},[slug]);return <>{s}</>}
export function PublicApartmentMedia({slug}:{slug:string}){const[m,setM]=useState<MediaAssetDto[]>([]);useEffect(()=>{publicFetch<{ok:true;media:MediaAssetDto[]}>(`/media?apartmentSlug=${slug}`).then(d=>setM(d?.media??[]))},[slug]); if(!m.length)return null; return <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 md:grid-cols-3">{m.map(x=><Image unoptimized key={x.id} src={x.secureUrl} alt={x.alt??x.title} width={800} height={600} className="rounded-2xl"/> )}</div>}
export function HomeLiveMedia(){return <LiveMedia placements="HOME_HERO,PROJECT_GALLERY"/>}
export function GalleryLiveMedia(){return <LiveMedia placements="PROJECT_GALLERY,EXTERIOR,INTERIOR"/>}
function LiveMedia({placements}:{placements:string}){const[m,setM]=useState<MediaAssetDto[]>([]);useEffect(()=>{Promise.all(placements.split(',').map(p=>publicFetch<{ok:true;media:MediaAssetDto[]}>(`/media?placement=${p}`))).then(r=>setM(r.flatMap(x=>x?.media??[])))},[placements]); if(!m.length)return null; return <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">{m.map(x=>x.type==='VIDEO'||x.type==='VIRTUAL_TOUR'?<video key={x.id} src={x.secureUrl} controls className="rounded-2xl"/>:<Image unoptimized key={x.id} src={x.secureUrl} alt={x.alt??x.title} width={800} height={600} className="rounded-2xl"/> )}</section>}
