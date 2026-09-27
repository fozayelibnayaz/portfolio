import path from 'node:path';

/**
 * Optional persistent-volume adapter. When PORTFOLIO_DATA_DIR is set (for
 * example /data on Railway), editable JSON and CMS uploads live on that
 * mounted volume instead of the disposable app/release directory.
 */
export function portfolioFilePath() {
  const dataDir=process.env.PORTFOLIO_DATA_DIR;
  return dataDir
    ? path.join(dataDir,'portfolio.json')
    : path.join(process.cwd(),'content','portfolio.json');
}

export function uploadsDirectory() {
  const dataDir=process.env.PORTFOLIO_DATA_DIR;
  return dataDir
    ? path.join(dataDir,'uploads')
    : path.join(process.cwd(),'public','uploads');
}
