import { fireEvent, render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import FormControls from './FormControls';

describe('component FormControls', () => {
  describe('when editMode is true', () => {
    it('renders the cancel and save buttons', () => {
      const { getByText } = render(
        <FormControls
          editMode
          cancelEdit={() => {}}
          captureSubmitForm={() => {}}
        />,
      );

      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Save')).toBeInTheDocument();
    });
    it('calls cancelEdit when the cancel button is clicked', () => {
      const cancelEdit = vi.fn();
      const { getByText } = render(
        <FormControls
          editMode
          cancelEdit={cancelEdit}
          captureSubmitForm={() => {}}
        />,
      );

      fireEvent.click(getByText('Cancel'));

      expect(cancelEdit).toHaveBeenCalled();
    });
    it('calls captureSubmitForm when the save button is clicked', () => {
      const captureSubmitForm = vi.fn();
      const { getByText } = render(
        <FormControls
          editMode
          cancelEdit={() => {}}
          captureSubmitForm={captureSubmitForm}
        />,
      );

      fireEvent.click(getByText('Save'));

      expect(captureSubmitForm).toHaveBeenCalled();
    });
  });
  describe('when editMode is false', () => {
    it('does not render the cancel and save buttons', () => {
      const { queryByText } = render(
        <FormControls
          editMode={false}
          cancelEdit={() => {}}
          captureSubmitForm={() => {}}
        />,
      );

      expect(queryByText('Cancel')).toBeNull();
      expect(queryByText('Save')).toBeNull();
    });
  });
});
