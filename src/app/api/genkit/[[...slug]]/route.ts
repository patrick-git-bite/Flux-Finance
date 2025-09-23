import {getGenkitAPIRoute} from '@genkit-ai/next';
import '@/ai/flows/suggest-transaction-category';
import '@/ai/flows/generate-financial-insights';

export const {GET, POST} = getGenkitAPIRoute();
