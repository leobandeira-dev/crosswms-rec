
import { useState } from 'react';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Hook for handling print validation and confirmation dialogs
 * Follows Single Responsibility Principle - only handles print validation logic
 */
export const usePrintValidation = () => {
  const [volumeExistsDialogOpen, setVolumeExistsDialogOpen] = useState(false);
  const [pendingPrintVolume, setPendingPrintVolume] = useState<Volume | null>(null);
  const [existingVolumesCount, setExistingVolumesCount] = useState(0);

  /**
   * Shows confirmation dialog for existing volumes
   */
  const showExistingVolumesDialog = (volume: Volume, count: number) => {
    setPendingPrintVolume(volume);
    setExistingVolumesCount(count);
    setVolumeExistsDialogOpen(true);
  };

  /**
   * Closes the confirmation dialog
   */
  const closeDialog = () => {
    setVolumeExistsDialogOpen(false);
    setPendingPrintVolume(null);
    setExistingVolumesCount(0);
  };

  /**
   * Gets the pending volume for confirmation
   */
  const getPendingVolume = () => pendingPrintVolume;

  return {
    volumeExistsDialogOpen,
    pendingPrintVolume,
    existingVolumesCount,
    showExistingVolumesDialog,
    closeDialog,
    getPendingVolume,
    setVolumeExistsDialogOpen
  };
};
