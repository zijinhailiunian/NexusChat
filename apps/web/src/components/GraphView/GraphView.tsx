import { useMemo } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useChatStore } from '../../store/chatStore';
import { htmlToText, truncate } from '../../utils/id';

interface Props {
  onClose: () => void;
}

/** Killer feature: turn the whole main-stream + drawers into a knowledge graph. */
export function GraphView({ onClose }: Props) {
  const nodes = useChatStore((s) => s.nodes);
  const rootNodeIds = useChatStore((s) => s.rootNodeIds);
  const drawers = useChatStore((s) => s.drawers);

  const { rfNodes, rfEdges } = useMemo(() => {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    rootNodeIds.forEach((id, idx) => {
      const n = nodes[id];
      if (!n) return;
      rfNodes.push({
        id,
        position: { x: 0, y: idx * 110 },
        data: { label: `${n.role === 'user' ? '🧑' : '🤖'} ${truncate(htmlToText(n.content), 28)}` },
        style: {
          background: n.role === 'user' ? '#dbeafe' : '#ffffff',
          border: '1px solid #3b82f6',
          borderRadius: 12,
          fontSize: 12,
          width: 200,
        },
      });
      if (n.parent_id && nodes[n.parent_id]) {
        rfEdges.push({ id: `e-${n.parent_id}-${id}`, source: n.parent_id, target: id });
      }
    });

    Object.values(drawers).forEach((drawer, dIdx) => {
      const colX = 280 + dIdx * 250;
      drawer.node_ids.forEach((id, idx) => {
        const n = nodes[id];
        if (!n) return;
        rfNodes.push({
          id,
          position: { x: colX, y: idx * 90 + 40 },
          data: { label: `${n.role === 'user' ? '❔' : '💡'} ${truncate(htmlToText(n.content), 24)}` },
          style: {
            background: '#fafafa',
            border: '1px dashed #94a3b8',
            borderRadius: 10,
            fontSize: 11,
            width: 180,
          },
        });
        if (n.parent_id && nodes[n.parent_id]) {
          rfEdges.push({
            id: `e-${n.parent_id}-${id}`,
            source: n.parent_id,
            target: id,
            animated: idx === 0,
            style: { stroke: '#94a3b8' },
          });
        }
      });
    });

    // provenance edges (merge-up sources)
    Object.values(nodes).forEach((n) => {
      n.source_refs.forEach((ref) => {
        if (nodes[ref]) {
          rfEdges.push({
            id: `src-${ref}-${n.id}`,
            source: ref,
            target: n.id,
            label: '融合',
            animated: true,
            style: { stroke: '#22c55e', strokeDasharray: '4 4' },
          });
        }
      });
    });

    return { rfNodes, rfEdges };
  }, [nodes, rootNodeIds, drawers]);

  return (
    <div className="graph-modal">
      <div className="graph-header">
        <strong>🕸 全局图谱视野</strong>
        <button className="btn btn-primary" onClick={onClose}>
          关闭
        </button>
      </div>
      <div className="graph-canvas">
        {rfNodes.length === 0 ? (
          <div className="empty-state">还没有内容，先去主线聊几句吧。</div>
        ) : (
          <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
