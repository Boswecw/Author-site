import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
  console.error('[HOOK] handleError:', error);
  
  return {
    message: 'Internal server error',
    code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
  };
};