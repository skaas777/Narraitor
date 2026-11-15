'use client';

import { ConfirmationDialog } from '@/components/ConfirmationDialog/ConfirmationDialog';

interface GameSessionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'start-new' | 'character-switch' | 'exit';
  characterName?: string;
  currentProgress?: number;
}

const copyConfig: Record<GameSessionConfirmationDialogProps['type'], {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
}> = {
  'start-new': {
    title: "开始新的冒险记录？",
    description:
      "重新开始将结束当前的冒险记录，并开启一段全新的冒险。你的进度已保存，但你会失去当前在故事中的位置。",
    confirmText: "开始新的冒险记录",
    cancelText: "保留当前冒险记录",
  },
  'character-switch': {
    title: "切换角色？",
    description:
      "切换角色将结束当前冒险记录，并以所选角色开始新的冒险。你现有的进度已保存，之后可以返回继续。",
    confirmText: "切换角色",
    cancelText: "继续使用当前角色",
  },
  'exit': {
    title: "离开故事？",
    description:
      "你的进度会自动保存，因此你可以随时从当前位置继续。确定现在要离开吗？",
    confirmText: "离开故事",
    cancelText: "继续游玩",
  },
};

export function GameSessionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  characterName,
  currentProgress = 0,
}: GameSessionConfirmationDialogProps) {
  const config = copyConfig[type];
  const variant = type === 'character-switch' ? 'info' : 'warning';

  const descriptionWithContext =
    type === 'start-new'
      ? `${config.description}${currentProgress > 0 ? `（目前已有 ${currentProgress} 个故事片段）。` : ''}`
      : `${config.description.replace('所选角色', characterName || '所选角色')}${
          currentProgress > 0 ? `（目前已有 ${currentProgress} 个故事片段）。` : ''
        }`;

  const confirmText =
    type === 'character-switch' && characterName
      ? `扮演 ${characterName}`
      : config.confirmText;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={config.title}
      message={descriptionWithContext}
      variant={variant}
      confirmText={confirmText}
      cancelText={config.cancelText}
    />
  );
}
