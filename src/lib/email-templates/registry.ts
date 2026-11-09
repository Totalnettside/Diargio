import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
import { template as sellerNoticeTemplate } from './seller-notice'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as welcomeTemplate } from './welcome'
import { template as sellerNoticeTemplate } from './seller-notice'
import { template as listingReviewTemplate } from './listing-review'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'listing-review': listingReviewTemplate,
  'welcome': welcomeTemplate,
  'seller-notice': sellerNoticeTemplate,
  // Add templates here as they are created, e.g.:
  // 'welcome': welcomeTemplate,
}
