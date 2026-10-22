import { FileText } from 'lucide-react';
import { EmptyState } from '@aries/client';
import { ResourceType } from 'aries-data-provider';
import { useGetAllEffectivePermissionsQuery } from 'aries-data-provider/react-query';
import type { TPromptGroup } from 'aries-data-provider';
import ChatGroupItem from './ChatGroupItem';
import { useLocalize } from '~/hooks';

export default function List({
  groups = [],
  isChatRoute,
}: {
  groups?: TPromptGroup[];
  isChatRoute?: boolean;
}) {
  const localize = useLocalize();
  const { data: permissionsMap } = useGetAllEffectivePermissionsQuery(ResourceType.PROMPTGROUP, {
    enabled: groups.length > 0,
  });

  const renderContent = () => {
    if (groups.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title={localize('com_ui_no_prompts_title')}
          description={localize('com_ui_add_first_prompt')}
          className="my-2"
        />
      );
    }

    return groups.map((group) => (
      <ChatGroupItem
        key={group._id}
        group={group}
        isChatRoute={isChatRoute}
        permissionBits={group._id ? permissionsMap?.[group._id] : 0}
      />
    ));
  };

  return (
    <section className="grow" aria-label={localize('com_ui_prompt_groups')}>
      <div>{renderContent()}</div>
    </section>
  );
}
