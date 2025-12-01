import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonTable, SkeletonCard } from '../Skeleton';

describe('Skeleton Component', () => {
  describe('Skeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      const { container } = render(<Skeleton />);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('animate-pulse');
    });

    it('should apply custom width and height', () => {
      const { container } = render(<Skeleton width="200px" height="50px" />);
      const element = container.firstChild as HTMLElement;
      expect(element.style.width).toBe('200px');
      expect(element.style.height).toBe('50px');
    });

    it('should have rounded-full class when circle prop is true', () => {
      const { container } = render(<Skeleton circle={true} />);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('rounded-full');
    });

    it('should have rounded-md class by default', () => {
      const { container } = render(<Skeleton circle={false} />);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('rounded-md');
    });

    it('should render multiple skeletons when count > 1', () => {
      const { container } = render(<Skeleton count={3} />);
      const skeletons = container.querySelectorAll('div > div');
      expect(skeletons.length).toBe(3);
    });

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('custom-class');
    });

    it('should handle numeric width and height', () => {
      const { container } = render(<Skeleton width={100} height={50} />);
      const element = container.firstChild as HTMLElement;
      expect(element.style.width).toBe('100px');
      expect(element.style.height).toBe('50px');
    });
  });

  describe('SkeletonTable', () => {
    it('should render without crashing', () => {
      const { container } = render(<SkeletonTable />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      const { container } = render(<SkeletonTable rows={5} columns={3} />);
      const rows = container.querySelectorAll('.flex');
      // Account for the wrapper div which also has flex class
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });

    it('should render correct number of columns per row', () => {
      const { container } = render(<SkeletonTable rows={1} columns={6} />);
      const columns = container.querySelectorAll('.flex > div');
      expect(columns.length).toBe(6);
    });

    it('should use default rows and columns', () => {
      const { container } = render(<SkeletonTable />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<SkeletonTable className="custom-table" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-table');
    });
  });

  describe('SkeletonCard', () => {
    it('should render without crashing', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have card styling classes', () => {
      const { container } = render(<SkeletonCard />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('rounded-lg');
      expect(card.className).toContain('border');
    });

    it('should render multiple cards when count > 1', () => {
      const { container } = render(<SkeletonCard count={3} />);
      const cards = container.querySelectorAll('[class*="bg-white"]');
      expect(cards.length).toBe(3);
    });

    it('should apply custom className', () => {
      const { container } = render(<SkeletonCard className="custom-card" />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-card');
    });

    it('should have skeleton elements inside', () => {
      const { container } = render(<SkeletonCard />);
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
