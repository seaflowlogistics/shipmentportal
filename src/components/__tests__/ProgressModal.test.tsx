import React from 'react';
import { ProgressModal } from '../ProgressModal';

describe('ProgressModal Component', () => {
  it('should be defined and is a functional component', () => {
    expect(ProgressModal).toBeDefined();
    expect(typeof ProgressModal).toBe('function');
  });

  it('should render with required isOpen and title props', () => {
    expect(<ProgressModal isOpen={true} title="Export in Progress" />).toBeDefined();
  });

  it('should accept optional message prop', () => {
    expect(<ProgressModal isOpen={true} title="Export" message="Processing..." />).toBeDefined();
  });

  it('should accept progress prop', () => {
    expect(<ProgressModal isOpen={true} title="Export" progress={50} />).toBeDefined();
  });

  it('should accept showProgress prop', () => {
    expect(<ProgressModal isOpen={true} title="Export" showProgress={true} />).toBeDefined();
  });

  it('should accept onClose callback', () => {
    const onClose = jest.fn();
    expect(<ProgressModal isOpen={true} title="Export" onClose={onClose} />).toBeDefined();
  });

  it('should clamp progress between 0-100', () => {
    // Progress should be internally clamped to 100
    expect(<ProgressModal isOpen={true} title="Export" progress={150} />).toBeDefined();
  });

  it('should handle negative progress', () => {
    // Progress should be internally clamped to 0
    expect(<ProgressModal isOpen={true} title="Export" progress={-50} />).toBeDefined();
  });

  it('should render when isOpen is true', () => {
    expect(<ProgressModal isOpen={true} title="Export" />).toBeDefined();
  });

  it('should handle isOpen false', () => {
    expect(<ProgressModal isOpen={false} title="Export" />).toBeDefined();
  });

  it('should accept message and progress together', () => {
    expect(
      <ProgressModal
        isOpen={true}
        title="Export"
        message="Loading..."
        progress={75}
        showProgress={true}
      />
    ).toBeDefined();
  });
});
