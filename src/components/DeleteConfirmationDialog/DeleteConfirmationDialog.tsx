import React from 'react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog/ConfirmationDialog';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmButtonText = "删除",
  cancelButtonText = "取消",
  isDeleting = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      variant="destructive"
      message={
        <>
          <p>{description}</p>
          <p>{itemName}</p>
        </>
      }
      confirmText={confirmButtonText}
      cancelText={cancelButtonText}
      confirmAriaLabel={`${confirmButtonText}${itemName}`}
      cancelAriaLabel={cancelButtonText}
      isLoading={isDeleting}
      loadingText="正在删除…"
    />
  );
};

export default DeleteConfirmationDialog;
