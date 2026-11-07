import { Navigate } from 'react-router-dom';

// Preserve existing bookmarks after moving the gallery into Device.
export function MachinesPage() {
  return <Navigate to="/device?tab=machines" replace />;
}
