'use client';
import { useState, useEffect, useRef } from 'react';

const T = {
  bg:"#0F0D0C", surface:"#161210", card:"#1C1815", border:"#272220",
  borderLight:"#333028", gold:"#C4955A", goldLight:"#D4A870", wine:"#8B3A52",
  cream:"#F0E8DC", muted:"#8A8078", mutedLight:"#B8AFA5", green:"#5A7A62",
  blue:"#4A6B8A", purple:"#6A5A8A",
};

const BUCKETS = [
  {id:"mentor_minutes",label:"Mentor Minutes",emoji:"🎓",color:T.gold},
  {id:"practice_preach",label:"Practice > Preach",emoji:"⚡",color:"#D4A060"},
  {id:"respectfully_no",label:"Respectfully No",emoji:"🛑",color:T.wine},
  {id:"gym_healing",label:"Healing w/ Food",emoji:"🥗",color:T.green},
  {id:"gym_workouts",label:"Workout Journey",emoji:"💪",color:"#6A9A72"},
  {id:"skincare_science",label:"Science of Skin",emoji:"🧪",color:T.blue},
  {id:"substack",label:"Substack Rewinds",emoji:"📚",color:T.purple},
];

const HUBS = [
  {id:"dashboard",label:"Command Center",icon:"⚡"},
  {id:"content",label:"Content",icon:"📱"},
  {id:"brand",label:"Vixens N Darlings",icon:"👗"},
  {id:"college",label:"College + Future",icon:"🎓"},
  {id:"science",label:"Science",icon:"🔬"},
  {id:"ai",label:"AI Lab",icon:"🤖"},
];

const store = {
  async get(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null}catch{return null}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v))}catch{}},
};

const SYSTEM = `You are Tiff's creative content partner and personal AI. Here's who Tiff is:
- College senior at Arizona State, admitted to Thunderbird Global MBA. Law school waitlist. Figuring it out in real time.
- Building @tunedinwithtiff on TikTok: buckets are Mentor Minutes (career wisdom), Practice>Preach (living what she preaches), Respectfully No (boundaries, for women told to shrink). Best content: unscripted interview tips + articulation videos — real, raw, no script.
- Also @gym (healing relationship with food, workout journey) and @education (skincare science, substack rewinds).
- Building Vixens N Darlings: empowerment marketplace — could be clothing, podcast, planners, charms, phone cases, a community forum. Vision still forming.
- Brand voice: big sister who has their shit together but secretly doesn't. Direct. Warm. Witty. Never preachy.
- Audience: women told to shrink, shush, calm down. Ambitious, emotional, building something real.
- The fork in the road (Thunderbird vs law vs brand) IS content. The not-knowing IS content.
Be her real creative partner. Push back when needed. Give specific, concrete ideas.`;

async function askClaude(msg, history=[], maxTokens=1200){
  const r = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({system:SYSTEM, messages:[...history,{role:"user",content:msg}], max_tokens:maxTokens})
  });
  const d = await r.json();
  return d.content?.[0]?.text || "Something went wrong.";
}

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
function Card({children,style,onClick,accent}){
  const [h,sH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
    style={{background:T.card,border:`1px solid ${h&&onClick?T.gold:accent||T.border}`,borderRadius:14,
      padding:"18px 20px",cursor:onClick?"pointer":"default",transition:"all .2s",...style}}>{children}</div>;
}

function Btn({children,onClick,variant="primary",style,disabled,sm}){
  const v={primary:{bg:T.gold,color:"#0F0D0C"},ghost:{bg:"transparent",color:T.muted,border:`1px solid ${T.border}`},
    wine:{bg:T.wine,color:T.cream},soft:{bg:T.surface,color:T.mutedLight,border:`1px solid ${T.border}`},
    danger:{bg:"#5A2020",color:"#FFAAAA"}}[variant];
  return <button onClick={onClick} disabled={disabled}
    style={{background:v.bg,color:v.color,border:v.border||"none",borderRadius:8,
      padding:sm?"4px 10px":"8px 16px",fontSize:sm?11:13,fontFamily:"'DM Sans',sans-serif",
      fontWeight:500,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,
      transition:"all .15s",whiteSpace:"nowrap",...style}}>{children}</button>;
}

function Inp({value,onChange,placeholder,style,multi,rows=3,onKeyDown}){
  const base={background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,color:T.cream,
    fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"9px 13px",outline:"none",
    width:"100%",transition:"border-color .15s",lineHeight:1.6,...style};
  const h={onFocus:e=>e.currentTarget.style.borderColor=T.gold,
    onBlur:e=>e.currentTarget.style.borderColor=T.border,onKeyDown};
  return multi?<textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} {...h}/>
    :<input value={value} onChange={onChange} placeholder={placeholder} style={base} {...h}/>;
}

function Tag({label,color,small}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${color}22`,color,
    border:`1px solid ${color}44`,borderRadius:20,padding:small?"2px 8px":"3px 10px",fontSize:small?10:11,fontWeight:500}}>{label}</span>;
}

function SubNav({items,active,set}){
  return <div style={{display:"flex",gap:4,marginBottom:22,flexWrap:"wrap"}}>
    {items.map(i=><button key={i.id} onClick={()=>set(i.id)} style={{
      background:active===i.id?T.gold:"transparent",color:active===i.id?"#0F0D0C":T.muted,
      border:`1px solid ${active===i.id?T.gold:T.border}`,borderRadius:7,padding:"5px 13px",fontSize:12,
      fontFamily:"'Syne',sans-serif",fontWeight:600,cursor:"pointer",transition:"all .15s",letterSpacing:".02em"
    }}>{i.label}</button>)}
  </div>;
}

function BucketPill({id,selected,onClick}){
  const b=BUCKETS.find(x=>x.id===id)||BUCKETS[0];
  return <button onClick={onClick} style={{background:selected?`${b.color}22`:"transparent",
    color:selected?b.color:T.muted,border:`1px solid ${selected?b.color+"66":T.border}`,
    borderRadius:20,padding:"3px 11px",fontSize:11,fontFamily:"'DM Sans',sans-serif",
    cursor:"pointer",transition:"all .15s",fontWeight:selected?500:400}}>{b.emoji} {b.label}</button>;
}

function BucketBar({bucket,set}){
  return <div style={{display:"flex",gap:5,marginBottom:18,flexWrap:"wrap"}}>
    {BUCKETS.map(b=><BucketPill key={b.id} id={b.id} selected={bucket===b.id} onClick={()=>set(b.id)}/>)}
  </div>;
}

function Heading({children}){
  return <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:T.cream,marginBottom:20}}>{children}</div>;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({tasks,toggleTask,openCapture}){
  const [brief,setBrief]=useState(null);
  const [loading,setLoading]=useState(false);
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  useEffect(()=>{store.get("brief").then(b=>{if(b?.date===today)setBrief(b.text)});},[]);

  const gen=async()=>{
    setLoading(true);
    const pending=tasks.filter(t=>!t.done).slice(0,5).map(t=>t.title).join(", ")||"nothing queued";
    try{
      const txt=await askClaude(`Generate Tiff's morning brief for ${today}. Under 260 words, punchy, big sister energy.

Format exactly:
☀️ GOOD MORNING, TIFF
[2 sentences — energizing, acknowledges where she's at]

📋 YOUR FOCUS TODAY
Open tasks: ${pending}. Give her a prioritized view.

📱 TRENDING CONTENT ANGLES
• [Career/empowerment angle]
• [Current event tie-in relevant to her niche]
• [Something connecting to Vixens N Darlings]

💡 HOOK OF THE DAY
[One specific hook she could post today + which bucket]

🔥 REMINDER
[1 line. Her voice. Something she'd actually say.]`,[]);
      setBrief(txt);
      store.set("brief",{text:txt,date:today});
    }catch{setBrief("Couldn't load — try again.");}
    setLoading(false);
  };

  const pending=tasks.filter(t=>!t.done);
  const done=tasks.filter(t=>t.done);

  return <div style={{display:"flex",gap:20}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:18}}>
      <Card accent={T.gold+"33"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:T.cream,lineHeight:1}}>{today}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:3,fontFamily:"'Syne',sans-serif",letterSpacing:".08em"}}>MORNING BRIEF</div>
          </div>
          <Btn onClick={gen} disabled={loading}>{loading?"Brewing...":brief?"↺ Refresh":"✨ Generate"}</Btn>
        </div>
        {brief?<div style={{fontSize:13,color:T.mutedLight,lineHeight:1.8,whiteSpace:"pre-line"}}>{brief}</div>
          :<div style={{textAlign:"center",padding:"24px 0",color:T.muted}}>
            <div style={{fontSize:32,marginBottom:8}}>☀️</div>
            <div style={{fontSize:13}}>Generate your daily brief — trends, priorities, a hook.</div>
          </div>}
      </Card>
      <Card>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Syne',sans-serif",letterSpacing:".1em",marginBottom:12}}>QUICK CAPTURE</div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>openCapture("task")} style={{flex:1}}>+ Task</Btn>
          <Btn onClick={()=>openCapture("content")} variant="wine" style={{flex:1}}>+ Content Idea</Btn>
          <Btn onClick={()=>openCapture("note")} variant="ghost" style={{flex:1}}>+ Note</Btn>
        </div>
      </Card>
    </div>
    <div style={{width:300,flexShrink:0}}>
      <Card style={{height:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:T.cream}}>Today's Focus</div>
          <span style={{fontSize:11,color:T.muted}}>{pending.length} left</span>
        </div>
        {pending.length===0?<div style={{textAlign:"center",padding:"28px 0",color:T.muted,fontSize:13}}>Clear queue — add something or take the win.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:1}}>
            {pending.map(t=><div key={t.id} onClick={()=>toggleTask(t.id)}
              style={{display:"flex",alignItems:"flex-start",gap:9,padding:"9px 6px",borderRadius:7,cursor:"pointer",
                borderBottom:`1px solid ${T.border}`,transition:"background .1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.surface}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:15,height:15,borderRadius:4,marginTop:2,border:`2px solid ${T.borderLight}`,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:T.cream}}>{t.title}</div>
                {t.hub&&t.hub!=="dashboard"&&<div style={{fontSize:10,color:T.muted,marginTop:2}}>
                  {HUBS.find(h=>h.id===t.hub)?.icon} {HUBS.find(h=>h.id===t.hub)?.label}</div>}
              </div>
            </div>)}
          </div>}
        {done.length>0&&<div style={{marginTop:12,fontSize:11,color:T.muted}}>✓ {done.length} done today</div>}
        <Btn onClick={()=>openCapture("task")} variant="soft" style={{width:"100%",marginTop:14}}>+ Add Task</Btn>
      </Card>
    </div>
  </div>;
}

// ── CONTENT HUB ───────────────────────────────────────────────────────────────
function ContentHub(){
  const [sub,setSub]=useState("iterate");
  const [bucket,setBucket]=useState("mentor_minutes");
  const [hooks,setHooks]=useState([]);
  const [ideas,setIdeas]=useState([]);
  const [chat,setChat]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const [newHook,setNewHook]=useState("");
  const [newIdea,setNewIdea]=useState({title:"",notes:""});
  const [working,setWorking]=useState({works:"",doesnt:"",metrics:""});
  const [scraperIn,setScraperIn]=useState("");
  const [scraperOut,setScraperOut]=useState("");
  const [scraperLoading,setScraperLoading]=useState(false);
  const chatRef=useRef(null);
  const B=BUCKETS.find(b=>b.id===bucket);

  useEffect(()=>{
    Promise.all([store.get("hooks"),store.get("c_ideas"),store.get("c_working"),store.get("c_chat")])
      .then(([h,i,w,c])=>{if(h)setHooks(h);if(i)setIdeas(i);if(w)setWorking(w);if(c)setChat(c)});
  },[]);
  useEffect(()=>{store.set("hooks",hooks)},[hooks]);
  useEffect(()=>{store.set("c_ideas",ideas)},[ideas]);
  useEffect(()=>{store.set("c_working",working)},[working]);
  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"})},[chat]);

  const addHook=()=>{if(!newHook.trim())return;setHooks(p=>[{id:Date.now(),text:newHook,bucket,at:new Date().toISOString()},...p]);setNewHook("")};
  const addIdea=()=>{if(!newIdea.title.trim())return;setIdeas(p=>[{id:Date.now(),...newIdea,bucket,at:new Date().toISOString()},...p]);setNewIdea({title:"",notes:""})};

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoading)return;
    const msg=chatIn;setChatIn("");setChatLoading(true);
    const next=[...chat,{role:"user",content:msg}];setChat(next);
    try{
      const res=await askClaude(`Bucket context: ${B?.label}. ${msg}`,chat.slice(-10));
      const final=[...next,{role:"assistant",content:res}];setChat(final);store.set("c_chat",final);
    }catch{setChat(p=>[...p,{role:"assistant",content:"Ran into an issue — try again."}])}
    setChatLoading(false);
  };

  const scrape=async()=>{
    if(!scraperIn.trim())return;setScraperLoading(true);
    try{
      const res=await askClaude(`Extract content ideas from this text for Tiff's specific buckets.
Give: 1) Core insight, 2) 3 hooks in her voice, 3) Which bucket(s) and why, 4) One specific video angle.
Source: ${scraperIn}`,[]);
      setScraperOut(res);
    }catch{setScraperOut("Couldn't process — try again.")}
    setScraperLoading(false);
  };

  const SUBS=[{id:"iterate",label:"✨ Iterate w/ AI"},{id:"hooks",label:"🪝 Hooks DB"},
    {id:"ideas",label:"💡 Ideas Bank"},{id:"working",label:"📊 What's Working"},
    {id:"extractor",label:"🎬 Extractor"},{id:"dataDoc",label:"📋 Data Doc"}];

  if(sub==="iterate") return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)"}}>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <BucketBar bucket={bucket} set={setBucket}/>
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,paddingBottom:4}}>
      {chat.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:T.muted}}>
        <div style={{fontSize:34,marginBottom:10}}>✨</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.cream,marginBottom:5}}>Your AI Content Partner</div>
        <div style={{fontSize:13,marginBottom:18}}>Pitch ideas, get hooks, iterate scripts — I know your brand.</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",maxWidth:580,margin:"0 auto"}}>
          {["Give me 5 hooks for Mentor Minutes","Help me write a Respectfully No script",
            "What content can I make about not knowing my future?","Is my brand direction clear? Let's talk.",
            "Turn this idea into a video: [paste idea]"].map(s=><button key={s} onClick={()=>setChatIn(s)}
            style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 13px",
              color:T.muted,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.gold}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted}}
          >{s}</button>)}
        </div>
      </div>}
      {chat.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
        <div style={{maxWidth:"72%",background:m.role==="user"?T.wine:T.card,
          border:`1px solid ${m.role==="user"?T.wine+"88":T.border}`,
          borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
          padding:"11px 15px",fontSize:13,color:T.cream,lineHeight:1.7,whiteSpace:"pre-line"}}>{m.content}</div>
      </div>)}
      {chatLoading&&<div style={{display:"flex",gap:5,padding:14,alignItems:"center"}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.gold,display:"inline-block",animation:"pulse 1.4s ease-in-out infinite"}}/>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.gold,display:"inline-block",animation:"pulse 1.4s ease-in-out .2s infinite"}}/>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.gold,display:"inline-block",animation:"pulse 1.4s ease-in-out .4s infinite"}}/>
      </div>}
      <div ref={chatRef}/>
    </div>
    <div style={{display:"flex",gap:8,marginTop:10,alignItems:"flex-end"}}>
      <Inp value={chatIn} onChange={e=>setChatIn(e.target.value)}
        placeholder={`Working on ${B?.label}... pitch an idea, ask for hooks, iterate`}
        multi rows={2} style={{flex:1}}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}}}/>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <Btn onClick={sendChat} disabled={chatLoading||!chatIn.trim()}>Send</Btn>
        {chat.length>0&&<Btn onClick={()=>{setChat([]);store.set("c_chat",[])}} variant="ghost" sm>Clear</Btn>}
      </div>
    </div>
  </div>;

  if(sub==="hooks") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <BucketBar bucket={bucket} set={setBucket}/>
    <div style={{display:"flex",gap:8,marginBottom:18}}>
      <Inp value={newHook} onChange={e=>setNewHook(e.target.value)} placeholder={`Hook for ${B?.label}...`} style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addHook()}/>
      <Btn onClick={addHook}>Save Hook</Btn>
    </div>
    {hooks.filter(h=>h.bucket===bucket).length===0
      ?<Card style={{textAlign:"center",padding:36}}><div style={{fontSize:28,marginBottom:8}}>🪝</div><div style={{color:T.muted,fontSize:13}}>No hooks saved for {B?.label} yet</div></Card>
      :<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {hooks.filter(h=>h.bucket===bucket).map(h=><Card key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14}}>
          <div style={{fontSize:14,color:T.cream,flex:1,fontStyle:"italic"}}>"{h.text}"</div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:10,color:T.muted}}>{new Date(h.at).toLocaleDateString()}</span>
            <Btn onClick={()=>setHooks(p=>p.filter(x=>x.id!==h.id))} variant="danger" sm>✕</Btn>
          </div>
        </Card>)}
      </div>}
  </div>;

  if(sub==="ideas") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <BucketBar bucket={bucket} set={setBucket}/>
    <Card style={{marginBottom:18}}>
      <div style={{fontSize:10,color:T.muted,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:10}}>NEW IDEA</div>
      <Inp value={newIdea.title} onChange={e=>setNewIdea(p=>({...p,title:e.target.value}))} placeholder="Idea title or hook..." style={{marginBottom:7}}/>
      <Inp value={newIdea.notes} onChange={e=>setNewIdea(p=>({...p,notes:e.target.value}))} placeholder="Notes, angles, rough script..." multi rows={3}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><Btn onClick={addIdea}>Save Idea</Btn></div>
    </Card>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {ideas.filter(i=>i.bucket===bucket).map(i=><Card key={i.id}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <div style={{fontSize:14,color:T.cream,fontWeight:500}}>{i.title}</div>
          <Btn onClick={()=>setIdeas(p=>p.filter(x=>x.id!==i.id))} variant="danger" sm>✕</Btn>
        </div>
        {i.notes&&<div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>{i.notes}</div>}
        <div style={{marginTop:7}}><Tag label={B?.label} color={B?.color} small/></div>
      </Card>)}
      {ideas.filter(i=>i.bucket===bucket).length===0&&<div style={{textAlign:"center",padding:32,color:T.muted,fontSize:13}}>No ideas for {B?.label} yet</div>}
    </div>
  </div>;

  if(sub==="working") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <div style={{display:"flex",gap:18,marginBottom:16}}>
      <Card style={{flex:1}}>
        <div style={{fontSize:10,color:T.green,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:9}}>✓ WHAT'S WORKING</div>
        <Inp value={working.works} onChange={e=>setWorking(p=>({...p,works:e.target.value}))} placeholder="Formats, hooks, topics landing..." multi rows={6}/>
      </Card>
      <Card style={{flex:1}}>
        <div style={{fontSize:10,color:T.wine,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:9}}>✗ WHAT'S NOT</div>
        <Inp value={working.doesnt} onChange={e=>setWorking(p=>({...p,doesnt:e.target.value}))} placeholder="Honest log. No judgment." multi rows={6}/>
      </Card>
    </div>
    <Card>
      <div style={{fontSize:10,color:T.muted,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:9}}>📊 METRICS</div>
      <Inp value={working.metrics} onChange={e=>setWorking(p=>({...p,metrics:e.target.value}))} placeholder="View counts, follower growth, notes..." multi rows={4}/>
    </Card>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn onClick={()=>store.set("c_working",working)}>Save</Btn></div>
  </div>;

  if(sub==="extractor") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <div style={{fontSize:13,color:T.mutedLight,marginBottom:14}}>Paste a transcript, article, or video description — Claude extracts ideas for your exact buckets.</div>
    <div style={{display:"flex",gap:18}}>
      <div style={{flex:1}}>
        <Inp value={scraperIn} onChange={e=>setScraperIn(e.target.value)} placeholder="Paste transcript, article, podcast notes..." multi rows={12}/>
        <Btn onClick={scrape} disabled={scraperLoading||!scraperIn.trim()} style={{marginTop:9,width:"100%"}}>
          {scraperLoading?"Extracting...":"🎬 Extract Content Ideas"}
        </Btn>
      </div>
      <div style={{flex:1}}>
        {scraperOut?<Card style={{whiteSpace:"pre-line",fontSize:13,color:T.mutedLight,lineHeight:1.75,height:"100%"}}>{scraperOut}</Card>
          :<Card style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,height:"100%"}}>
            <div style={{color:T.muted,fontSize:13}}>Ideas will appear here</div></Card>}
      </div>
    </div>
  </div>;

  if(sub==="dataDoc") return <div><SubNav items={SUBS} active={sub} set={setSub}/><DataDoc/></div>;
  return <div><SubNav items={SUBS} active={sub} set={setSub}/></div>;
}

function DataDoc(){
  const [doc,setDoc]=useState({
    mission:"For women told to shrink — this is the big sister voice they needed.\n\nTiff Lavoie. College senior. Brand builder. Building in public.",
    voice:"Big sister who has their shit together but secretly doesn't.\nDirect. Warm. Witty. Never preachy.\n\n• \"Respectfully, no.\"\n• \"You were never too much. You were just in the wrong room.\"\n• \"Build in public. Stumble in public. Grow in public.\"",
    buckets:"🎓 Mentor Minutes — career wisdom, mentorship stories\n⚡ Practice>Preach — living what she preaches\n🛑 Respectfully No — boundaries, self-advocacy\n\n🥗 Healing w/ Food — @gym\n💪 Workout Journey — @gym\n\n🧪 Science of Skin — @education\n📚 Substack Rewinds — @education",
    confinements:"• Not toxic positivity — keep it real\n• Not LinkedIn-polished — unscripted converts better\n• Not giving advice she hasn't lived\n• Not hiding the uncertainty — it's the story",
    audience:"Women told to shrink, shush, calm down. Ambitious, emotional, building something.\nNeeds: permission, validation, tactical advice, a mirror.",
  });
  useEffect(()=>{store.get("data_doc").then(d=>{if(d)setDoc(d)})},[]);
  const S=[{key:"mission",label:"🎯 MISSION",rows:4},{key:"audience",label:"👥 AUDIENCE",rows:5},
    {key:"voice",label:"🎤 BRAND VOICE",rows:8},{key:"buckets",label:"🪣 CONTENT BUCKETS",rows:8},
    {key:"confinements",label:"🚫 CONFINEMENTS",rows:6}];
  return <div>
    <div style={{fontSize:13,color:T.muted,marginBottom:16}}>Your source of truth for all content. Keep it updated.</div>
    {S.map(s=><Card key={s.key} style={{marginBottom:14}}>
      <div style={{fontSize:10,color:T.gold,fontFamily:"'Syne',sans-serif",letterSpacing:".1em",marginBottom:9}}>{s.label}</div>
      <Inp value={doc[s.key]} onChange={e=>setDoc(p=>({...p,[s.key]:e.target.value}))} multi rows={s.rows}/>
    </Card>)}
    <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={()=>store.set("data_doc",doc)}>Save</Btn></div>
  </div>;
}

// ── BRAND HUB ─────────────────────────────────────────────────────────────────
function BrandHub(){
  const [sub,setSub]=useState("clarity");
  const [docs,setDocs]=useState({
    clarity:"## Where I'm Stuck\n[Write it out — what's the core confusion?]\n\n## What I Know For Sure\n• Women's empowerment is the through-line\n• The brand should feel like a community\n\n## Possible Directions\n1. Clothing brand first, build community around it\n2. Content/community first, merch is secondary\n3. Platform-first: the forum/space IS the product\n\n## The Question I Need to Answer\n[What's the one decision that would unlock clarity?]",
    bizPlan:"## Business Overview\n\n## Revenue Streams\n1. \n2. \n3. \n\n## Timeline\n- Now: \n- 6 months: \n- 1 year: ",
    marketing:"## Channels\n\n## Messaging\n\n## Launch Strategy",
    strategy:"## Differentiation\n\n## Key Partnerships\n\n## Competitive Landscape",
    files:"## Important Links & Files\n[Paste drive links, Canva links, etc.]",
  });
  const [ai,setAI]=useState({q:"",a:"",loading:false});
  useEffect(()=>{store.get("brand_docs").then(d=>{if(d)setDocs(d)})},[]);
  const SUBS=[{id:"clarity",label:"🔍 Brand Clarity"},{id:"bizPlan",label:"📋 Biz Plan"},
    {id:"marketing",label:"📣 Marketing"},{id:"strategy",label:"♟️ Strategy"},
    {id:"files",label:"📁 Files"},{id:"aiHelper",label:"✨ AI Helper"}];
  const ask=async()=>{
    if(!ai.q.trim())return;setAI(p=>({...p,loading:true}));
    const res=await askClaude(`Help Tiff with Vixens N Darlings. She's stuck — vision could be clothing, podcast, planners, charms, phone cases, a forum. Give concrete next steps, not vague inspiration. Push back if needed. Question: ${ai.q}`,[]);
    setAI(p=>({...p,a:res,loading:false}));
  };
  if(sub==="aiHelper") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <Heading>Brand Strategy AI</Heading>
    <div style={{display:"flex",gap:18}}>
      <div style={{flex:1}}>
        <Inp value={ai.q} onChange={e=>setAI(p=>({...p,q:e.target.value}))} placeholder="Ask anything about VnD..." multi rows={8}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}>
          <Btn onClick={ask} disabled={ai.loading||!ai.q.trim()}>{ai.loading?"Thinking...":"Ask"}</Btn>
        </div>
      </div>
      <div style={{flex:1}}>
        {ai.a?<Card style={{whiteSpace:"pre-line",fontSize:13,color:T.mutedLight,lineHeight:1.75}}>{ai.a}</Card>
          :<Card style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48}}>
            <div style={{color:T.muted,fontSize:13,textAlign:"center"}}><div style={{fontSize:30,marginBottom:8}}>👗</div>Strategy, clarity, naming — ask anything.</div></Card>}
      </div>
    </div>
  </div>;
  return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <Heading>Vixens N Darlings</Heading>
    <Card>
      <div style={{fontSize:10,color:T.wine,fontFamily:"'Syne',sans-serif",letterSpacing:".1em",marginBottom:10}}>{SUBS.find(s=>s.id===sub)?.label}</div>
      <Inp value={docs[sub]||""} onChange={e=>setDocs(p=>({...p,[sub]:e.target.value}))} multi rows={16}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn onClick={()=>store.set("brand_docs",docs)}>Save</Btn></div>
    </Card>
  </div>;
}

// ── COLLEGE HUB ───────────────────────────────────────────────────────────────
function CollegeHub(){
  const [sub,setSub]=useState("internships");
  const [lists,setLists]=useState({internships:[],scholarships:[],certs:[]});
  const [newItem,setNewItem]=useState({title:"",status:"Researching",deadline:""});
  const [decisions,setDecisions]=useState("## The Fork\n- Thunderbird Global MBA (admitted ✓)\n- Law school (waitlist)\n- Brand / Vixens N Darlings full-time\n\n## What matters most to me:\n\n## Pros/Cons:\n\n## I need to decide by:");
  useEffect(()=>{
    Promise.all([store.get("internships"),store.get("scholarships"),store.get("certs"),store.get("decisions")])
      .then(([i,s,c,d])=>{setLists({internships:i||[],scholarships:s||[],certs:c||[]});if(d)setDecisions(d)});
  },[]);
  const SM={internships:["Researching","Applied","Interview","Offer","Rejected"],
    scholarships:["Researching","Applied","Won","Rejected"],certs:["Planned","In Progress","Completed"]};
  const SC={Researching:T.muted,Applied:T.blue,Interview:T.gold,Offer:T.green,Won:T.green,Rejected:T.wine,"In Progress":T.gold,Planned:T.muted,Completed:T.green};
  const SUBS=[{id:"internships",label:"💼 Internships"},{id:"scholarships",label:"💰 Scholarships"},
    {id:"certs",label:"📜 Certs"},{id:"decisions",label:"🗺️ Post-Grad"}];
  const add=()=>{
    if(!newItem.title.trim())return;
    const item={id:Date.now(),...newItem,at:new Date().toISOString()};
    const updated={...lists,[sub]:[item,...lists[sub]]};setLists(updated);store.set(sub,updated[sub]);
    setNewItem({title:"",status:SM[sub][0],deadline:""});
  };
  if(sub==="decisions") return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <Heading>Post-Grad Decisions</Heading>
    <Card><Inp value={decisions} onChange={e=>setDecisions(e.target.value)} multi rows={16}/>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn onClick={()=>store.set("decisions",decisions)}>Save</Btn></div></Card>
  </div>;
  const items=lists[sub]||[];
  return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <Heading>{SUBS.find(s=>s.id===sub)?.label}</Heading>
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <Inp value={newItem.title} onChange={e=>setNewItem(p=>({...p,title:e.target.value}))} placeholder="Name..." style={{flex:"1 1 180px"}}/>
        <select value={newItem.status} onChange={e=>setNewItem(p=>({...p,status:e.target.value}))}
          style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.cream,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer"}}>
          {(SM[sub]||[]).map(s=><option key={s}>{s}</option>)}
        </select>
        <Inp value={newItem.deadline} onChange={e=>setNewItem(p=>({...p,deadline:e.target.value}))} placeholder="Deadline" style={{flex:"1 1 120px"}}/>
        <Btn onClick={add}>Add</Btn>
      </div>
    </Card>
    {items.map(item=><Card key={item.id} style={{marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{fontSize:14,color:T.cream}}>{item.title}</div>
          <Tag label={item.status} color={SC[item.status]||T.muted} small/>
        </div>
        {item.deadline&&<div style={{fontSize:11,color:T.muted,marginTop:3}}>📅 {item.deadline}</div>}
      </div>
      <Btn onClick={()=>{const u={...lists,[sub]:items.filter(x=>x.id!==item.id)};setLists(u);store.set(sub,u[sub])}} variant="danger" sm>✕</Btn>
    </Card>)}
    {items.length===0&&<div style={{textAlign:"center",padding:36,color:T.muted,fontSize:13}}>Nothing added yet.</div>}
  </div>;
}

// ── SCIENCE HUB ───────────────────────────────────────────────────────────────
function ScienceHub(){
  const [sub,setSub]=useState("skincare");
  const [notes,setNotes]=useState({skincare:"",nutrition:"",health:"",workouts:"",cycle:"",hair:""});
  const [ai,setAI]=useState({q:"",a:"",loading:false});
  useEffect(()=>{store.get("sci_notes").then(n=>{if(n)setNotes(n)})},[]);
  const SUBS=[{id:"skincare",label:"✨ Skincare"},{id:"nutrition",label:"🥗 Nutrition"},
    {id:"health",label:"💊 Health + Vitamins"},{id:"workouts",label:"💪 Workouts"},
    {id:"cycle",label:"🌙 Hormones + Cycle"},{id:"hair",label:"💇 Haircare"}];
  const ask=async()=>{
    if(!ai.q.trim())return;setAI(p=>({...p,loading:true}));
    const res=await askClaude(`Tiff asking about ${sub} for personal health + potential education content. Give: 1) Science-backed answer, 2) One content angle for her education account. Question: ${ai.q}`,[]);
    setAI(p=>({...p,a:res,loading:false}));
  };
  return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <div style={{display:"flex",gap:18}}>
      <div style={{flex:1}}>
        <Heading>{SUBS.find(s=>s.id===sub)?.label} Notes</Heading>
        <Card>
          <Inp value={notes[sub]} onChange={e=>setNotes(p=>({...p,[sub]:e.target.value}))} placeholder={`Notes on ${sub}...`} multi rows={12}/>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><Btn onClick={()=>store.set("sci_notes",notes)}>Save</Btn></div>
        </Card>
      </div>
      <div style={{width:320,flexShrink:0}}>
        <Heading>🔬 Ask the Science</Heading>
        <Card>
          <Inp value={ai.q} onChange={e=>setAI(p=>({...p,q:e.target.value}))} placeholder={`Ask anything about ${sub}...`} multi rows={4}/>
          <Btn onClick={ask} disabled={ai.loading||!ai.q.trim()} style={{marginTop:9,width:"100%"}}>{ai.loading?"Researching...":"Ask"}</Btn>
          {ai.a&&<div style={{marginTop:12,fontSize:12,color:T.mutedLight,lineHeight:1.75,whiteSpace:"pre-line"}}>{ai.a}</div>}
        </Card>
      </div>
    </div>
  </div>;
}

// ── AI HUB ────────────────────────────────────────────────────────────────────
function AIHub(){
  const [sub,setSub]=useState("prompts");
  const [items,setItems]=useState({prompts:[],ideas:[],workflows:[]});
  const [newItem,setNewItem]=useState({title:"",content:""});
  useEffect(()=>{store.get("ai_hub").then(d=>{if(d)setItems(d)})},[]);
  const SUBS=[{id:"prompts",label:"📝 Prompts"},{id:"ideas",label:"💡 AI Ideas"},{id:"workflows",label:"⚙️ Workflows"}];
  const add=()=>{
    if(!newItem.title.trim())return;
    const item={id:Date.now(),...newItem,at:new Date().toISOString()};
    const updated={...items,[sub]:[item,...items[sub]]};setItems(updated);store.set("ai_hub",updated);
    setNewItem({title:"",content:""});
  };
  return <div>
    <SubNav items={SUBS} active={sub} set={setSub}/>
    <Heading>{SUBS.find(s=>s.id===sub)?.label}</Heading>
    <Card style={{marginBottom:16}}>
      <Inp value={newItem.title} onChange={e=>setNewItem(p=>({...p,title:e.target.value}))} placeholder="Name..." style={{marginBottom:7}}/>
      <Inp value={newItem.content} onChange={e=>setNewItem(p=>({...p,content:e.target.value}))} placeholder="Content, instructions, details..." multi rows={3}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><Btn onClick={add}>Save</Btn></div>
    </Card>
    {items[sub].map(item=><Card key={item.id} style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontSize:14,color:T.cream,fontWeight:500,marginBottom:5}}>{item.title}</div>
        <Btn onClick={()=>{const updated={...items,[sub]:items[sub].filter(x=>x.id!==item.id)};setItems(updated);store.set("ai_hub",updated)}} variant="danger" sm>✕</Btn>
      </div>
      {item.content&&<div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>{item.content}</div>}
    </Card>)}
    {items[sub].length===0&&<div style={{textAlign:"center",padding:36,color:T.muted,fontSize:13}}>Nothing saved yet.</div>}
  </div>;
}

// ── CAPTURE MODAL ─────────────────────────────────────────────────────────────
function CaptureModal({type,onClose,onSave,curHub}){
  const [text,setText]=useState("");
  const [bucket,setBucket]=useState("mentor_minutes");
  const [hub,setHub]=useState(curHub||"dashboard");
  const save=()=>{if(!text.trim())return;onSave({type,text,bucket,hub});onClose()};
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000BB",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:26,width:480,maxWidth:"90vw"}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.cream,marginBottom:16}}>
        {type==="task"?"New Task":type==="content"?"Content Idea":"Quick Note"}
      </div>
      <Inp value={text} onChange={e=>setText(e.target.value)}
        placeholder={type==="task"?"What needs to get done?":type==="content"?"Hook, idea, script snippet...":"Capture the thought..."}
        multi rows={3}/>
      {type==="content"&&<div style={{marginTop:13}}>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:7}}>BUCKET</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {BUCKETS.map(b=><BucketPill key={b.id} id={b.id} selected={bucket===b.id} onClick={()=>setBucket(b.id)}/>)}
        </div>
      </div>}
      {type==="task"&&<div style={{marginTop:13}}>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Syne',sans-serif",letterSpacing:".08em",marginBottom:7}}>HUB</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {HUBS.map(h=><button key={h.id} onClick={()=>setHub(h.id)} style={{
            background:hub===h.id?`${T.gold}22`:"transparent",color:hub===h.id?T.gold:T.muted,
            border:`1px solid ${hub===h.id?T.gold+"66":T.border}`,borderRadius:20,padding:"3px 11px",
            fontSize:11,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all .15s"
          }}>{h.icon} {h.label}</button>)}
        </div>
      </div>}
      <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
        <Btn onClick={save}>Save</Btn>
      </div>
    </div>
  </div>;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function SecondBrain(){
  const [hub,setHub]=useState("dashboard");
  const [tasks,setTasks]=useState([]);
  const [capture,setCapture]=useState(null);
  const [collapsed,setCollapsed]=useState(false);

  useEffect(()=>{
    // Inject fonts
    if(!document.getElementById("brain-fonts")){
      const link=document.createElement("link");
      link.id="brain-fonts";
      link.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap";
      link.rel="stylesheet";
      document.head.appendChild(link);
    }
    // Inject base styles
    if(!document.getElementById("brain-styles")){
      const style=document.createElement("style");
      style.id="brain-styles";
      style.textContent=`
        *{box-sizing:border-box}
        body{background:#0F0D0C;margin:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0f0d0c}
        ::-webkit-scrollbar-thumb{background:#2e2824;border-radius:4px}
        textarea{resize:vertical}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
      `;
      document.head.appendChild(style);
    }
    store.get("tasks").then(t=>{if(t)setTasks(t)});
  },[]);

  const handleSave=({type,text,bucket,hub:th})=>{
    if(type==="task"){
      const item={id:Date.now(),title:text,hub:th,done:false,at:new Date().toISOString()};
      const u=[item,...tasks];setTasks(u);store.set("tasks",u);
    } else if(type==="content"){
      const item={id:Date.now(),title:text,bucket,at:new Date().toISOString()};
      store.get("c_ideas").then(e=>store.set("c_ideas",[item,...(e||[])]));
    }
  };

  const toggleTask=id=>{const u=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);setTasks(u);store.set("tasks",u)};
  const pending=tasks.filter(t=>!t.done).length;

  return <div style={{display:"flex",height:"100vh",background:T.bg,color:T.cream,fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>
    {/* SIDEBAR */}
    <div style={{width:collapsed?58:210,background:T.surface,borderRight:`1px solid ${T.border}`,
      padding:collapsed?"24px 8px":"24px 12px",display:"flex",flexDirection:"column",
      transition:"width .22s ease",flexShrink:0,overflow:"hidden"}}>
      <div style={{marginBottom:24,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between",paddingLeft:collapsed?0:3}}>
        {!collapsed&&<div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:T.gold,letterSpacing:".02em"}}>Tiff's Brain</div>
          <div style={{fontSize:9,color:T.muted,marginTop:2,fontFamily:"'Syne',sans-serif",letterSpacing:".1em"}}>SECOND BRAIN v2</div>
        </div>}
        <button onClick={()=>setCollapsed(p=>!p)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:14,padding:3,flexShrink:0}}>
          {collapsed?"→":"←"}
        </button>
      </div>
      {HUBS.map(h=><button key={h.id} onClick={()=>setHub(h.id)} style={{
        display:"flex",alignItems:"center",gap:collapsed?0:9,justifyContent:collapsed?"center":"flex-start",
        padding:collapsed?"9px 0":"8px 9px",borderRadius:8,marginBottom:2,width:"100%",
        background:hub===h.id?`${T.gold}18`:"transparent",
        border:hub===h.id?`1px solid ${T.gold}33`:"1px solid transparent",
        color:hub===h.id?T.gold:T.muted,fontSize:13,fontFamily:"'DM Sans',sans-serif",
        fontWeight:hub===h.id?500:400,cursor:"pointer",textAlign:"left",transition:"all .15s",
        overflow:"hidden",whiteSpace:"nowrap"
      }}><span style={{fontSize:15,flexShrink:0}}>{h.icon}</span>{!collapsed&&h.label}</button>)}
      {!collapsed&&<div style={{marginTop:"auto",paddingTop:14,borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>setCapture("task")} style={{width:"100%",background:`${T.gold}15`,
          border:`1px solid ${T.gold}33`,borderRadius:8,padding:"7px 9px",color:T.gold,fontSize:12,
          fontFamily:"'DM Sans',sans-serif",cursor:"pointer",marginBottom:5}}>+ Quick Capture</button>
        <div style={{fontSize:11,color:T.muted,paddingLeft:3}}>{pending} task{pending!==1?"s":""} pending</div>
      </div>}
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflow:"auto",padding:"28px 30px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:T.cream,lineHeight:1}}>
            {HUBS.find(h=>h.id===hub)?.icon} {HUBS.find(h=>h.id===hub)?.label}
          </div>
          <div style={{display:"flex",gap:7}}>
            <Btn onClick={()=>setCapture("content")} variant="wine" sm>+ Content Idea</Btn>
            <Btn onClick={()=>setCapture("task")} variant="soft" sm>+ Task</Btn>
          </div>
        </div>
        {hub==="dashboard"&&<Dashboard tasks={tasks} toggleTask={toggleTask} openCapture={setCapture}/>}
        {hub==="content"&&<ContentHub/>}
        {hub==="brand"&&<BrandHub/>}
        {hub==="college"&&<CollegeHub/>}
        {hub==="science"&&<ScienceHub/>}
        {hub==="ai"&&<AIHub/>}
      </div>
    </div>

    {capture&&<CaptureModal type={capture==="note"?"note":capture} onClose={()=>setCapture(null)} onSave={handleSave} curHub={hub}/>}
  </div>;
}
