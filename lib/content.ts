import fs from 'node:fs';
import path from 'node:path';
import defaultContent from '../content/default.json';
import type { PortfolioContent } from './types';
import { portfolioFilePath } from './storage';

export function getContent(): PortfolioContent {
  const file=portfolioFilePath();
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as PortfolioContent; }
  catch {
    // Seed an attached persistent disk from the checked-in, editable portfolio
    // the first time a service boots with PORTFOLIO_DATA_DIR.
    if(process.env.PORTFOLIO_DATA_DIR){
      try {
        fs.mkdirSync(path.dirname(file),{recursive:true});
        const seed=fs.readFileSync(path.join(process.cwd(),'content','portfolio.json'),'utf8');
        try { fs.writeFileSync(file,seed,{flag:'wx'}); }
        catch(error) { if((error as NodeJS.ErrnoException).code!=='EEXIST') throw error; }
        return JSON.parse(fs.readFileSync(file,'utf8')) as PortfolioContent;
      } catch { return defaultContent as PortfolioContent; }
    }
    return defaultContent as PortfolioContent;
  }
}

export function saveContent(content: PortfolioContent) {
  const file=portfolioFilePath();
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}
