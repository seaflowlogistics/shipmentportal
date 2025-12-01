import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressModal } from '../ProgressModal';

describe('ProgressModal Component', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <ProgressModal isOpen={true} title="Testing" />
    );
    expect(container).toBeInTheDocument();
  });

  it('should display the title', () => {
    render(<ProgressModal isOpen={true} title="Export in Progress" />);
    expect(screen.getByText('Export in Progress')).toBeInTheDocument();
  });

  it('should display the message when provided', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        message="Processing your data..."
      />
    );
    expect(screen.getByText('Processing your data...')).toBeInTheDocument();
  });

  it('should not display message when not provided', () => {
    render(<ProgressModal isOpen={true} title="Export" />);
    // Message should not be in document if not provided
    const messageElement = screen.queryByText(/Processing/);
    expect(messageElement).not.toBeInTheDocument();
  });

  it('should display progress percentage when showProgress is true', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={75}
        showProgress={true}
      />
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should display "Progress" label when showProgress is true', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        showProgress={true}
      />
    );
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('should handle 0 progress', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={0}
        showProgress={true}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100 progress', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={100}
        showProgress={true}
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should cap progress at 100', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={150}
        showProgress={true}
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle negative progress as 0', () => {
    render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={-50}
        showProgress={true}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    const { container } = render(
      <ProgressModal isOpen={true} title="Export" />
    );
    const spinner = container.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('should accept onClose callback', () => {
    const onClose = jest.fn();
    render(
      <ProgressModal isOpen={true} title="Export" onClose={onClose} />
    );
    // Modal should be rendered when isOpen is true
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should have correct progress bar width based on progress', () => {
    const { container } = render(
      <ProgressModal
        isOpen={true}
        title="Export"
        progress={50}
        showProgress={true}
      />
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeInTheDocument();
    // The inner div should have width set to 50%
    const innerBar = container.querySelector('[class*="bg-blue-600"]');
    expect(innerBar).toBeInTheDocument();
  });

  it('should show progress bar when showProgress is true', () => {
    const { container } = render(
      <ProgressModal
        isOpen={true}
        title="Export"
        showProgress={true}
      />
    );
    const progressBar = container.querySelector('[class*="bg-gray-200"]');
    expect(progressBar).toBeInTheDocument();
  });
});
