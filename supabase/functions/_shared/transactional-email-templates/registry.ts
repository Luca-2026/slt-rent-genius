import type * as React from 'npm:react@18.3.1';
import { template as returnReminder } from './return-reminder.tsx';
export interface TemplateEntry { component: React.ComponentType<any>; subject: string | ((data: Record<string, any>) => string); displayName?: string; previewData?: Record<string, any>; to?: string }
export const TEMPLATES: Record<string, TemplateEntry> = { 'rental-return-reminder': returnReminder };