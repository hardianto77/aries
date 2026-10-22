import React from 'react';
import userEvent from '@testing-library/user-event';
import { AccessRoleIds } from 'aries-data-provider';
import { OGDialog, OGDialogContent } from '@aries/client';
import { render, screen, within } from '@testing-library/react';
import AccessRolesPicker from '../AccessRolesPicker';

const onRoleChange = jest.fn();

jest.mock('aries-data-provider/react-query', () => ({
  useGetAccessRolesQuery: () => {
    const { AccessRoleIds: roleIds } = jest.requireActual('aries-data-provider');
    return {
      data: [{ accessRoleId: roleIds.AGENT_VIEWER }, { accessRoleId: roleIds.AGENT_EDITOR }],
      isLoading: false,
    };
  },
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

describe('AccessRolesPicker', () => {
  beforeEach(() => {
    onRoleChange.mockClear();
  });

  it('keeps its menu within the modal focus and pointer scope', async () => {
    render(
      <OGDialog open onOpenChange={jest.fn()}>
        <OGDialogContent>
          <AccessRolesPicker
            selectedRoleId={AccessRoleIds.AGENT_VIEWER}
            onRoleChange={onRoleChange}
          />
        </OGDialogContent>
      </OGDialog>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'com_ui_role_viewer_desc' }));

    const dialog = screen.getByRole('dialog');
    const menu = within(dialog).getByRole('menu');
    await userEvent.click(within(menu).getByText('com_ui_role_editor'));

    expect(onRoleChange).toHaveBeenCalledWith(AccessRoleIds.AGENT_EDITOR);
  });
});
