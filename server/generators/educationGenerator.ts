/**
 * Education Domain Architectural Adviser & Dynamic Generator
 * Implements domain guidelines without enforcing a static template or fixed layout.
 * Two different education prompts will generate distinct layouts, palettes, and components.
 */

import { buildComprehensiveSiteHtml } from '../siteGenerator';
import { getDomainGuidance } from '../domainGuidance';

export function generateEducationSite(prompt: string, analysis?: any): string {
  const guidance = getDomainGuidance('education_school', prompt);

  // Provide domain-enriched analysis if not already present
  const enrichedAnalysis = {
    ...analysis,
    siteType: analysis?.siteType || guidance.domainName,
    suggestedTitle: analysis?.suggestedTitle || (prompt.length > 25 ? prompt.substring(0, 25) : prompt) || 'منصة تعليمية',
    features: analysis?.features || guidance.recommendedInteractiveFeatures,
  };

  return buildComprehensiveSiteHtml({
    title: enrichedAnalysis.suggestedTitle,
    siteType: enrichedAnalysis.siteType,
    prompt,
    analysis: enrichedAnalysis,
  });
}
