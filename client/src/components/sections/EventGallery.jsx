import { useState } from 'react';
import galleryImages from '../../config/galleryImages';
import GlassModal from '../ui/GlassModal';

export default function EventGallery() {
  const [lightbox, setLightbox] = useState(null); // { src, alt }
  const [failed, setFailed]     = useState(new Set());

  // Filter out broken images
  const visible = galleryImages.filter((img) => !failed.has(img.src));

  if (visible.length === 0) return null;

  return (
    <section>
      {/* Masonry-style responsive grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {visible.map((img) => (
          <div
            key={img.src}
            className={`break-inside-avoid cursor-zoom-in group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ${
              img.span === 'wide' ? 'sm:col-span-2' : ''
            }`}
            onClick={() => setLightbox(img)}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              onError={() => setFailed((s) => new Set([...s, img.src]))}
              className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-end p-3">
              <span className="text-white text-xs font-label font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                {img.alt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <GlassModal open={!!lightbox} onClose={() => setLightbox(null)}>
        {lightbox && (
          <div className="-m-6">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full max-h-[80vh] object-contain rounded-3xl"
            />
            {lightbox.alt && (
              <p className="text-center text-sm text-on-surface-variant px-6 pt-4 pb-2">{lightbox.alt}</p>
            )}
          </div>
        )}
      </GlassModal>
    </section>
  );
}
