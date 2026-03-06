import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: unknown) => void;
    };
    __MIGRATION_REPORT__?: {
      filePath: string;
      importChanges: number;
      methodChanges: number;
    }[];
  }
}

const vscode = typeof window !== 'undefined' && window.acquireVsCodeApi
  ? window.acquireVsCodeApi()
  : { postMessage: (_message: unknown) => undefined };

type ReportItem = {
  filePath: string;
  importChanges: number;
  methodChanges: number;
};

const App: React.FC = () => {
  const [report] = React.useState<ReportItem[]>(window.__MIGRATION_REPORT__ ?? []);

  const totalFiles = report.length;
  const totalImportChanges = report.reduce(
    (sum, r) => sum + r.importChanges,
    0
  );
  const totalMethodChanges = report.reduce(
    (sum, r) => sum + r.methodChanges,
    0
  );

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        color: '#e5e7eb',
        backgroundColor: '#111827',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>SDK Migrator</h1>
      <p style={{ marginBottom: 16, color: '#9ca3af' }}>
        Preview of proposed changes from legacy SDK to new SDK.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <StatCard label="Files touched" value={totalFiles} />
        <StatCard label="Import updates" value={totalImportChanges} />
        <StatCard label="Method renames" value={totalMethodChanges} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 16,
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div>
            <strong>Apply migration</strong>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>
              Writes changes to disk for all listed files.
            </p>
          </div>
          <button
            onClick={() =>
              vscode.postMessage({ type: 'confirmApply' })
            }
            style={{
              backgroundColor: '#4f46e5',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <strong>Files &amp; changes</strong>
            <button
              onClick={() =>
                vscode.postMessage({ type: 'requestDetails' })
              }
              style={{
                background: 'transparent',
                border: '1px solid #4b5563',
                color: '#e5e7eb',
                padding: '4px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Ask LLM for edge cases
            </button>
          </div>

          {report.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>
              No changes detected. Adjust your rules or run again.
            </p>
          ) : (
            <div
              style={{
                maxHeight: 320,
                overflow: 'auto',
                borderRadius: 6,
                border: '1px solid #374151',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead
                  style={{
                    backgroundColor: '#111827',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '6px 8px',
                        borderBottom: '1px solid #374151',
                      }}
                    >
                      File
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '6px 8px',
                        borderBottom: '1px solid #374151',
                      }}
                    >
                      Import changes
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '6px 8px',
                        borderBottom: '1px solid #374151',
                      }}
                    >
                      Method renames
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item) => (
                    <tr key={item.filePath}>
                      <td
                        style={{
                          padding: '6px 8px',
                          borderBottom: '1px solid #1f2937',
                          maxWidth: 320,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.filePath}
                      >
                        {item.filePath}
                      </td>
                      <td
                        style={{
                          padding: '6px 8px',
                          borderBottom: '1px solid #1f2937',
                          textAlign: 'right',
                        }}
                      >
                        {item.importChanges}
                      </td>
                      <td
                        style={{
                          padding: '6px 8px',
                          borderBottom: '1px solid #1f2937',
                          textAlign: 'right',
                        }}
                      >
                        {item.methodChanges}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div
    style={{
      backgroundColor: '#1f2937',
      borderRadius: 8,
      padding: 12,
      minWidth: 140,
    }}
  >
    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
  </div>
);

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}


