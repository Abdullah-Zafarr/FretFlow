import { useContext } from 'react';
import { PracticeContext } from './PracticeContextDef';

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};
