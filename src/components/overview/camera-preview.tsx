import { Panel, PanelHeading } from '@/components/shared';
import { ReferenceMediaGallery } from '@/components/overview/dashboard-media';

export function CameraPreview() {
  return <Panel className="min-w-0">
    <PanelHeading title="Referensi kamera & thermal" eyebrow="Media lokal" />
    <div className="px-5 pb-5"><ReferenceMediaGallery compact /></div>
  </Panel>;
}
