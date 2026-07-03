import { ApartmentAdminClient } from "./apartment-admin-client";
export function generateStaticParams(){return Array.from({length:31},(_,i)=>({slug:`a${i+1}`}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params; return <ApartmentAdminClient slug={slug}/>}
