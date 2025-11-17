import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Label from '../Label';

describe('Label Component', () => {
  it('should render children text', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Label className="custom-class">Test</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
  });

  it('should render as label element', () => {
    const { container } = render(<Label>Test</Label>);
    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
  });
});
