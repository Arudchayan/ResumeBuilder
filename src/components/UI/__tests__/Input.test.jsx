import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input Component', () => {
  it('should render input with value', () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should enforce maxLength', () => {
    const { container } = render(<Input value="" onChange={() => {}} maxLength={10} />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should apply custom className', () => {
    const { container } = render(<Input value="" onChange={() => {}} className="custom-class" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should render as disabled when disabled prop is true', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
