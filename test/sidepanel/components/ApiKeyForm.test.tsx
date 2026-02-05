import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiKeyForm from '../../../entrypoints/sidepanel/components/ApiKeyForm';

vi.mock('../../../entrypoints/lib/storage', () => ({
  setApiKey: vi.fn().mockResolvedValue(undefined),
}));

import { setApiKey } from '../../../entrypoints/lib/storage';

describe('ApiKeyForm', () => {
  afterEach(cleanup);

  it('renders the form', () => {
    render(<ApiKeyForm onSaved={() => {}} />);
    expect(screen.getByText('Anthropic API Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows error for empty submission', async () => {
    render(<ApiKeyForm onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('API key is required')).toBeInTheDocument();
  });

  it('shows error for invalid key prefix', async () => {
    render(<ApiKeyForm onSaved={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('sk-ant-...'), {
      target: { value: 'invalid-key' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('API key must start with sk-ant-')).toBeInTheDocument();
  });

  it('saves valid key and calls onSaved', async () => {
    const onSaved = vi.fn();
    render(<ApiKeyForm onSaved={onSaved} />);
    fireEvent.change(screen.getByPlaceholderText('sk-ant-...'), {
      target: { value: 'sk-ant-valid-key-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(setApiKey).toHaveBeenCalledWith('sk-ant-valid-key-123');
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it('clears error when input changes', async () => {
    render(<ApiKeyForm onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('API key is required')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('sk-ant-...'), {
      target: { value: 'x' },
    });
    expect(screen.queryByText('API key is required')).not.toBeInTheDocument();
  });
});
