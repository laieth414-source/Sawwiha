import serverless from 'serverless-http';
import { app } from '../../server';

// Serverless handler for Netlify Functions (Express adapter)
// Express routes like /api/ai/analyze, /api/health, /s/:slug are routed here via netlify.toml redirects
// In Netlify redirects, event.path may arrive as /.netlify/functions/api/api/ai/analyze or /api/ai/analyze.
// We strip the /.netlify/functions/api prefix if present so Express route matching is 100% resilient.
const serverlessHandler = serverless(app);

export const handler: any = async (event: any, context: any) => {
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '') || '/';
  }
  return serverlessHandler(event, context);
};
