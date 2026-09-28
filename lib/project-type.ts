export type ProjectTypeId='web-commerce'|'data-ai'|'apps-systems';

export const PROJECT_TYPES:{id:ProjectTypeId;label:string;eyebrow:string;description:string}[]=[
  {id:'web-commerce',label:'Web & commerce',eyebrow:'01 / DIGITAL PRODUCTS',description:'Websites, storefronts and polished product experiences.'},
  {id:'data-ai',label:'Data & intelligence',eyebrow:'02 / SIGNAL & INSIGHT',description:'Analytics, machine learning and data-led tools.'},
  {id:'apps-systems',label:'Apps & systems',eyebrow:'03 / TOOLS THAT WORK',description:'Applications, APIs, utilities and connected systems.'},
];

const rules:Record<ProjectTypeId,string[]>={
  'web-commerce':['website','web app','web development','e-commerce','commerce','storefront','online store','shop','wordpress','woocommerce','webflow','wix','landing page','frontend','front end','react','next.js','tailwind','bootstrap','design system','cms','pwa','ui/ux'],
  'data-ai':['analytics','business intelligence','machine learning','deep learning','artificial intelligence','data science','data analytics','forecast','prediction','classification','detection','computer vision','natural language','time series','dataset','pandas','numpy','scikit','power bi','looker studio','visualization','statistics','neural network','model training','ai','ml'],
  'apps-systems':['api','backend','back end','cli','command line','system','management','tracking','tracker','automation','developer tool','utility','network','security','ticket counter','mobile app','react native','flutter','database','inventory','workflow','integration','monitoring','service','platform'],
};

function escapeRegex(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function hasTerm(text:string,term:string){
  if(term.length<=2)return new RegExp(`\\b${escapeRegex(term)}\\b`,'i').test(text);
  return text.includes(term);
}

/** Lightweight, deterministic classifier for portfolio cards; weights titles and explicit categories above README prose. */
export function classifyProject(project:Record<string,any>):ProjectTypeId{
  const title=String(project.name||'').toLowerCase();
  const category=String(project.category||'').toLowerCase();
  const stack=String(project.stack||'').toLowerCase();
  const description=[project.shortDescription,project.description,project.blurb].filter(Boolean).join(' ').toLowerCase();
  const tags=[...(Array.isArray(project.technologies)?project.technologies:[]),...(Array.isArray(project.topics)?project.topics:[])].join(' ').toLowerCase();
  const readme=Array.isArray(project.readmeSections)?project.readmeSections.map((s:any)=>[s.heading,...(s.paragraphs||[]),...(s.bullets||[])].join(' ')).join(' ').toLowerCase():'';
  const scores:Record<ProjectTypeId,number>={'web-commerce':0,'data-ai':0,'apps-systems':0};
  const fields:[string,number][]=[[title,4],[category,5],[stack,3],[tags,2],[description,1],[readme,.7]];
  for(const [id,terms] of Object.entries(rules) as [ProjectTypeId,string[]][]){
    for(const term of terms){
      for(const [text,weight] of fields){if(text&&hasTerm(text,term)){scores[id]+=weight;break}}
    }
  }
  const priority:ProjectTypeId[]=['data-ai','web-commerce','apps-systems'];
  return priority.reduce((best,id)=>scores[id]>scores[best]?id:best,'apps-systems');
}
