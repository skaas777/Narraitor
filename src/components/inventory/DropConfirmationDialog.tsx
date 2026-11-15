'use client';

import React from 'react';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InventoryItem } from '@/types/inventory.types';

export interface DropConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: InventoryItem | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  quantityError: string | null;
  storeError: { title: string; message: string } | null;
}

export function DropConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  item,
  quantity,
  onQuantityChange,
  quantityError,
  storeError,
}: DropConfirmationDialogProps) {
  if (!item) return null;

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="丢弃物品"
      showCloseButton={false}
      footer={
        <div>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            autoFocus
          >
            取消
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            variant="destructive"
          >
            丢弃
          </Button>
        </div>
      }
    >
      <div>
        <p>
          确定要丢弃 <strong>{item.name}</strong>?
        </p>

        {storeError && (
          <Alert variant="destructive">
            <AlertTitle>{storeError.title}</AlertTitle>
            <AlertDescription>{storeError.message}</AlertDescription>
          </Alert>
        )}

        {item.stackable && item.quantity > 1 && (
          <div>
            <Label htmlFor="drop-quantity">
              丢弃数量
            </Label>
            <Input
              id="drop-quantity"
              type="number"
              min={1}
              max={item.quantity}
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              aria-invalid={!!quantityError}
              aria-describedby={quantityError ? "quantity-error" : undefined}
            />
            <p>可用： {item.quantity}</p>
            {quantityError && (
              <p id="quantity-error" >
                {quantityError}
              </p>
            )}
          </div>
        )}
      </div>
    </SimpleModal>
  );
}
