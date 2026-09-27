'use client';
import { FormEvent, useState } from 'react';
export default function ContactForm({ email, provider='mailto', endpoint='' }: { email:string; provider?:string; endpoint?:string }) {
  const [status,setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error,setError] = useState('');
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const formElement=e.currentTarget;const fd=new FormData(formElement);const payload={name:String(fd.get('name')||''),email:String(fd.get('sender')||''),subject:String(fd.get('subject')||'Portfolio enquiry'),message:String(fd.get('message')||'')};
    if(provider==='endpoint'&&endpoint){setStatus('sending');setError('');try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!res.ok)throw new Error(`Submission failed (${res.status}).`);setStatus('sent');formElement.reset()}catch(err:any){setError(err.message||'Could not send. Please email me directly.');setStatus('error')}return;}
    const subject=encodeURIComponent(payload.subject);const body=encodeURIComponent(`Hi Fozayel,\n\n${payload.message}\n\n— ${payload.name}\n${payload.email}`);window.location.href=`mailto:${email}?subject=${subject}&body=${body}`;setStatus('sent');
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required placeholder="Name" /></label><label>Email address<input name="sender" autoComplete="email" type="email" required placeholder="you@example.com" /></label></div>
    <label>What would you like to work on?<select name="subject" defaultValue=""><option value="" disabled>Select a topic</option><option>Web development</option><option>Analytics & reporting</option><option>WordPress</option><option>Something else</option></select></label>
    <label>Message<textarea name="message" required rows={4} placeholder="A little about your project…" /></label>
    <div className="form-bottom"><button type="submit" className="button button-primary" disabled={status==='sending'}>{status==='sending'?'Sending…':status==='sent'?'Message ready':'Send a message'} <span aria-hidden="true">↗</span></button><span className="form-note" aria-live="polite">{status==='error'?error:provider==='endpoint'&&endpoint?'Sends securely through the configured contact endpoint.':'Opens your email app with a prepared message.'}</span></div>
  </form>;
}
