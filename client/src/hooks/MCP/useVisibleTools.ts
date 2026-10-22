import { useMemo } from 'react';
import { Constants, splitMCPToolKey, buildServerNameAliases } from 'aries-data-provider';
import type { TPlugin } from 'aries-data-provider';
import type { MCPServerInfo } from '~/common';

interface VisibleToolsResult {
  toolIds: string[];
  mcpServerNames: string[];
}

/**
 * Custom hook to calculate visible tool IDs based on selected tools.
 * Separates regular Aries tools from MCP servers.
 *
 * @param selectedToolIds - Array of selected tool IDs
 * @param regularTools - Array of regular Aries tools
 * @param mcpServersMap - Map of all MCP servers
 * @returns Object containing separate arrays of visible tool IDs for regular and MCP tools
 */
export function useVisibleTools(
  selectedToolIds: string[] | undefined,
  regularTools: TPlugin[] | undefined,
  mcpServersMap: Map<string, MCPServerInfo>,
): VisibleToolsResult {
  return useMemo(() => {
    const knownServerNames = Array.from(mcpServersMap.keys());
    /** Tool ids embed the normalized server name while the servers map is
     *  keyed by the raw config name — resolve either spelling back to raw so
     *  an attached special-character server is not misread as an unknown
     *  orphan (legacy documents may still carry raw-keyed ids). */
    const aliases = buildServerNameAliases(knownServerNames);
    const candidates = [...knownServerNames, ...aliases.keys()];
    const mcpServers = new Set<string>();
    const regularToolIds: string[] = [];

    for (const toolId of selectedToolIds ?? []) {
      // MCP tools/servers
      if (toolId.includes(Constants.mcp_delimiter)) {
        const [, serverName] = splitMCPToolKey(toolId, candidates);
        if (serverName) {
          mcpServers.add(aliases.get(serverName) ?? serverName);
        }
      }
      // Legacy MCP server check (just server name)
      else if (mcpServersMap.has(toolId)) {
        mcpServers.add(toolId);
      }
      // Regular Aries tools
      else if (regularTools?.some((t) => t.pluginKey === toolId)) {
        regularToolIds.push(toolId);
      }
    }

    return {
      toolIds: regularToolIds.sort((a, b) => a.localeCompare(b)),
      mcpServerNames: Array.from(mcpServers).sort((a, b) => a.localeCompare(b)),
    };
  }, [regularTools, mcpServersMap, selectedToolIds]);
}
