"use client";
import { useState } from "react";
const styles = ["Realistic","Anime","Logo","Poster","3D","Watercolor"];
const sizes = [{label:"Square",value:"1024x1024"},{label:"Portrait",value:"1024x1536"},{label:"Landscape",value:"1536x1024"}];
export default function Home() {
 const [prompt,setPrompt]=useState(""); const [style,setStyle]=useState("Realistic"); const [size,setSize]=useState("1024x1024");
 const [image,setImage]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function generate(){setError("");setImage("");if(prompt.trim().length<3){setError("Enter a prompt of at least 3 characters.");return;}setBusy(true);
  try {const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt.trim(),style,size})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Generation failed.");setImage(d.image);}
  catch(e){setError(e instanceof Error?e.message:"Something went wrong.");}finally{setBusy(false);}}
 return <main className="shell"><nav><a className="brand" href="#">✦ NagiGen <em>AI</em></a><span className="navnote">YOUR IMAGINATION, GENERATED</span></nav>
 <header><div className="eyebrow">✦ AI IMAGE STUDIO</div><h1>Imagine it.<br/><span>Bring it to life.</span></h1><p>Turn an idea into an image. Create art, anime, logos, posters and more.</p></header>
 <section className="workspace"><div className="controls"><label htmlFor="prompt">Describe your image</label><textarea id="prompt" maxLength={2000} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A cinematic portrait of an explorer on a neon-lit rainy street..."/>
 <div className="fields"><div><label htmlFor="style">Style</label><select id="style" value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(s=><option key={s}>{s}</option>)}</select></div><div><label htmlFor="size">Image size</label><select id="size" value={size} onChange={e=>setSize(e.target.value)}>{sizes.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div></div>
 <button disabled={busy} onClick={generate}>{busy?"Creating image…":"✦ Generate image →"}</button><small>Image provider API usage may incur charges.</small>{error&&<p className="error" role="alert">{error}</p>}</div>
 <div className="preview">{image?<div className="result"><img src={image} alt="Generated artwork"/><a href={image} download="nagigen-image.png" target="_blank" rel="noreferrer">Download image ↓</a></div>:<div className="empty"><div className="spark">✦</div><h2>{busy?"Creating your vision":"Your canvas awaits"}</h2><p>{busy?"The AI is creating your image.":"Your generated image will appear here."}</p><span>Realistic　 Anime　 Logos　 Posters</span></div>}</div></section>
 <section className="features"><article><b>01</b><h3>Many styles</h3><p>From realistic scenes to anime and graphic concepts.</p></article><article><b>02</b><h3>Simple workflow</h3><p>Describe, generate, then download your image.</p></article><article><b>03</b><h3>Built to grow</h3><p>Authentication, history and paid plans can be added next.</p></article></section>
 <footer>© {new Date().getFullYear()} NagiGen AI <span>Made for curious creators.</span></footer></main>;
}
