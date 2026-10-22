import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsSubmitting } from '@aries/chat/react';
import { PermissionBits } from 'aries-data-provider';
import type t from 'aries-data-provider';
import { useAuthContext, useLocalize } from '~/hooks';
import { useListAgentsQuery } from '~/data-provider';

const MAX_ROWS = 8;

/**
 * Terminal-style AGENTS section for the sidebar. Lists the account's agents with a
 * status dot and badge: every row reads IDLE, and the badge flips to WORKING for
 * the whole section while a run is streaming (a per-agent mapping would need a
 * server signal that does not exist yet). Clicking a row opens a new chat aimed at
 * that agent.
 *
 * Purely a navigation surface: it renders nothing for guests (no agents to list)
 * and hides itself entirely when the account has no agents, so the sidebar keeps
 * its existing shape everywhere else.
 */
export default function PerchAgentsSection() {
  const navigate = useNavigate();
  const localize = useLocalize();
  const { isAuthenticated } = useAuthContext();
  const isSubmitting = useIsSubmitting(0);

  const { data } = useListAgentsQuery(
    { requiredPermission: PermissionBits.VIEW },
    { enabled: isAuthenticated, staleTime: 30000 },
  );

  const agents = useMemo(() => {
    const list: t.Agent[] = data?.data ?? [];
    return list.slice(0, MAX_ROWS);
  }, [data]);

  if (!isAuthenticated || agents.length === 0) {
    return null;
  }

  const status = isSubmitting ? 'working' : 'idle';
  const badge = isSubmitting ? 'WORKING' : 'IDLE';

  return (
    <section className="perch-agents-section" aria-label={localize('com_ui_perch_agents')}>
      <h2 className="perch-agents-heading">{localize('com_ui_perch_agents')}</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id}>
            <button
              type="button"
              className="perch-agent-row"
              data-status={status}
              title={agent.name ?? undefined}
              onClick={() => navigate(`/c/new?agent_id=${agent.id}`)}
            >
              <span className="perch-agent-dot" aria-hidden="true" />
              <span className="perch-agent-name">{agent.name}</span>
              <span className="perch-agent-badge">{badge}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
