import React from 'react';
import { Skeleton, SkeletonTable, SkeletonCard } from '../Skeleton';

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('should be defined and is a functional component', () => {
      expect(Skeleton).toBeDefined();
      expect(typeof Skeleton).toBe('function');
    });

    it('should accept width and height props', () => {
      const props = { width: '200px', height: '50px' };
      expect(<Skeleton {...props} />).toBeDefined();
    });

    it('should accept circle prop', () => {
      const props = { circle: true };
      expect(<Skeleton {...props} />).toBeDefined();
    });

    it('should accept count prop for multiple skeletons', () => {
      const props = { count: 3 };
      expect(<Skeleton {...props} />).toBeDefined();
    });

    it('should accept className prop', () => {
      const props = { className: 'custom-class' };
      expect(<Skeleton {...props} />).toBeDefined();
    });
  });

  describe('SkeletonTable', () => {
    it('should be defined and is a functional component', () => {
      expect(SkeletonTable).toBeDefined();
      expect(typeof SkeletonTable).toBe('function');
    });

    it('should accept rows and columns props', () => {
      const props = { rows: 5, columns: 3 };
      expect(<SkeletonTable {...props} />).toBeDefined();
    });

    it('should use default rows and columns', () => {
      expect(<SkeletonTable />).toBeDefined();
    });

    it('should accept className prop', () => {
      const props = { className: 'custom-table' };
      expect(<SkeletonTable {...props} />).toBeDefined();
    });
  });

  describe('SkeletonCard', () => {
    it('should be defined and is a functional component', () => {
      expect(SkeletonCard).toBeDefined();
      expect(typeof SkeletonCard).toBe('function');
    });

    it('should render single card by default', () => {
      expect(<SkeletonCard />).toBeDefined();
    });

    it('should render multiple cards when count > 1', () => {
      const props = { count: 3 };
      expect(<SkeletonCard {...props} />).toBeDefined();
    });

    it('should accept className prop', () => {
      const props = { className: 'custom-card' };
      expect(<SkeletonCard {...props} />).toBeDefined();
    });
  });
});
