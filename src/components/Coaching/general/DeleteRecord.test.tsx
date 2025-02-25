import { fireEvent, render, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';

import { describe, it, vi } from 'vitest';
import DeleteRecord from './DeleteRecord';

describe('component DeleteRecord', () => {
  it('renders a delete button', async () => {
    const { getByText } = render(
      <MockAllProviders>
        <DeleteRecord deleteFunction={vi.fn()} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText('Danger Zone!')).toBeInTheDocument();
      expect(getByText('Delete Record')).toBeInTheDocument();
    });
  });

  it('opens the modal with correct message', async () => {
    const deleteFunction = vi.fn();
    const { getByText } = render(
      <MockAllProviders>
        <DeleteRecord deleteFunction={deleteFunction} />
      </MockAllProviders>,
    );
    act(() => {
      fireEvent.click(getByText('Delete Record'));
    });
    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this record?'),
      ).toBeInTheDocument();
      expect(getByText('This action cannot be undone')).toBeInTheDocument();
    });
  });

  it('calls delete function when confirm button is clicked', async () => {
    const deleteFunction = vi.fn();
    const { getByText } = render(
      <MockAllProviders>
        <DeleteRecord deleteFunction={deleteFunction} />
      </MockAllProviders>,
    );
    act(() => {
      fireEvent.click(getByText('Delete Record'));
    });
    await waitFor(() => {
      fireEvent.click(getByText('Confirm'));
    });
    expect(deleteFunction).toHaveBeenCalled();
  });
});
