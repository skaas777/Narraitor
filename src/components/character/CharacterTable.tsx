/**
 * CharacterTable - Table view for character management
 * Displays characters with sorting, filtering, and actions
 */

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Pencil,
  Trash2,
  Play,
  Star,
  Plus,
} from 'lucide-react';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { ActiveStateLabel } from '@/components/shared/cards';
import type { StoreCharacter } from '@/state/characterStore';
import type { EntityID } from '@/types/common.types';
import { formatDate } from '@/lib/utils';

interface CharacterTableProps {
  characters: StoreCharacter[];
  currentCharacterId: EntityID | null;
  onView: (characterId: EntityID) => void;
  onPlay: (characterId: EntityID) => void;
  onEdit: (characterId: EntityID) => void;
  onDelete: (characterId: EntityID) => void;
}

/**
 * CharacterTable - A data table component for comparing and managing multiple characters
 *
 * Displays characters in a row-based format with columns for key metrics like
 * level and type. Includes action buttons for gameplay and CRUD operations.
 *
 * @param props - Component properties
 * @param props.characters - Array of Character objects to display in the table
 * @param props.currentCharacterId - ID of the currently active character
 * @param props.onView - Callback to view character details
 * @param props.onPlay - Callback to start playing as character
 * @param props.onEdit - Callback to edit character
 * @param props.onDelete - Callback for deleting a character from the list
 */
export function CharacterTable({
  characters,
  currentCharacterId,
  onView,
  onPlay,
  onEdit,
  onDelete,
}: CharacterTableProps) {
  const handleViewCharacter = React.useCallback(
    (characterId: EntityID) => {
      onView(characterId);
    },
    [onView]
  );

  const handlePlayCharacter = React.useCallback(
    (characterId: EntityID, e: React.MouseEvent) => {
      e.stopPropagation();
      onPlay(characterId);
    },
    [onPlay]
  );

  const handleEditCharacter = React.useCallback(
    (characterId: EntityID, e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(characterId);
    },
    [onEdit]
  );

  const handleDeleteCharacter = React.useCallback(
    (characterId: EntityID, e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(characterId);
    },
    [onDelete]
  );

  const columns: ColumnDef<StoreCharacter>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: "名称",
        cell: ({ row }) => (
          <div
            className="component-character-table-name"
            onClick={() => handleViewCharacter(row.original.id)}
          >
            <span className="component-character-table-thumb" aria-hidden="true">
              <CharacterPortrait
                portrait={
                  row.original.portrait || { type: 'placeholder', url: null }
                }
                characterName={row.original.name}
                size="large"
              />
            </span>
            <span>{row.getValue('name') as string}</span>
            <ActiveStateLabel
              isActive={currentCharacterId === row.original.id}
              testId="character-table-active-label"
            />
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'level',
        header: "等级",
        cell: ({ row }) => <div>等级 {row.getValue('level')}</div>,
        enableSorting: true,
      },
      {
        id: 'type',
        header: "类型",
        accessorFn: (row) =>
          row.background?.isKnownFigure ? 'known' : 'original',
        cell: ({ row }) => {
          const isKnownFigure = row.original.background?.isKnownFigure;
          return (
            <Badge
              icon={
                isKnownFigure ? (
                  <Star aria-hidden="true" />
                ) : (
                  <Plus aria-hidden="true" />
                )
              }
              variant={isKnownFigure ? 'warning-static' : 'default-static'}
            >
              {isKnownFigure ? "知名人物" : "原创"}
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'createdAt',
        header: "创建时间",
        cell: ({ row }) => <div>{formatDate(row.getValue('createdAt'))}</div>,
        enableSorting: true,
      },
      {
        id: 'actions',
        header: "操作",
        cell: ({ row }) => {
          return (
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handlePlayCharacter(row.original.id, e)}
                aria-label={`扮演 ${row.original.name}`}
                title="开始游戏"
              >
                <Play />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewCharacter(row.original.id)}
                aria-label={`查看 ${row.original.name}`}
                title="查看"
              >
                <Eye />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleEditCharacter(row.original.id, e)}
                aria-label={`编辑 ${row.original.name}`}
                title="编辑"
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDeleteCharacter(row.original.id, e)}
                aria-label={`删除 ${row.original.name}`}
                title="删除"
              >
                <Trash2 />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      currentCharacterId,
      handleViewCharacter,
      handlePlayCharacter,
      handleEditCharacter,
      handleDeleteCharacter,
    ]
  );

  if (characters.length === 0) {
    return (
      <div>
        <p>还没有角色。创建一个角色即可开始。</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={characters}
      pagination={{
        pageSize: 10,
        showPagination: true,
      }}
      searchable={{
        enabled: true,
        placeholder: "搜索角色……",
      }}
      ariaLabel="角色表格"
    />
  );
}
