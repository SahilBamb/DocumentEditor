'use client';

import { useState } from 'react';
import { ExternalLink, HardDrive, FileText, BookOpen, MessageSquare, GitBranch } from 'lucide-react';
import { GlassButton } from '@/components/shared/GlassButton';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import documents from Google Drive',
    icon: <HardDrive size={20} />,
    color: '#4285F4',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync pages from Notion workspaces',
    icon: <FileText size={20} />,
    color: '#191919',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Connect Atlassian Confluence spaces',
    icon: <BookOpen size={20} />,
    color: '#1868DB',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in Slack channels',
    icon: <MessageSquare size={20} />,
    color: '#611f69',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link technical docs to repositories',
    icon: <GitBranch size={20} />,
    color: '#24292e',
  },
];

export function IntegrationsPanel() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      {INTEGRATIONS.map((integration) => {
        const isConnected = connected[integration.id] ?? false;
        return (
          <div
            key={integration.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              border: isConnected ? '1px solid var(--green-border)' : '1px solid var(--border-glass)',
              background: isConnected ? 'var(--green-tint)' : 'rgba(0,0,0,0.015)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: integration.color }}
            >
              {integration.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {integration.name}
                </p>
                {isConnected && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--green-tint)', color: 'var(--green-text)' }}
                  >
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {integration.description}
              </p>
            </div>
            <GlassButton
              size="sm"
              variant={isConnected ? 'ghost' : 'glass'}
              icon={isConnected ? undefined : <ExternalLink size={12} />}
              onClick={() => setConnected((prev) => ({ ...prev, [integration.id]: !prev[integration.id] }))}
              style={isConnected ? { color: 'var(--green-text)' } as React.CSSProperties : undefined}
            >
              {isConnected ? 'Connected ✓' : 'Connect'}
            </GlassButton>
          </div>
        );
      })}
    </div>
  );
}
