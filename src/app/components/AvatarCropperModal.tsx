import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

const CROP_SIZE = 280;
const OUTPUT_SIZE = 256;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampOffsets(params: {
  offsetX: number;
  offsetY: number;
  naturalWidth: number;
  naturalHeight: number;
  scale: number;
}) {
  const { offsetX, offsetY, naturalWidth, naturalHeight, scale } = params;
  const scaledW = naturalWidth * scale;
  const scaledH = naturalHeight * scale;

  const minX = (CROP_SIZE - scaledW) / 2;
  const maxX = (scaledW - CROP_SIZE) / 2;
  const minY = (CROP_SIZE - scaledH) / 2;
  const maxY = (scaledH - CROP_SIZE) / 2;

  return {
    x: clamp(offsetX, minX, maxX),
    y: clamp(offsetY, minY, maxY),
  };
}

async function cropToPng(params: {
  imageEl: HTMLImageElement;
  offsetX: number;
  offsetY: number;
  naturalWidth: number;
  naturalHeight: number;
  scale: number;
}) {
  const { imageEl, offsetX, offsetY, naturalWidth, naturalHeight, scale } = params;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scaledW = naturalWidth * scale;
  const scaledH = naturalHeight * scale;
  const imageLeft = CROP_SIZE / 2 - scaledW / 2 + offsetX;
  const imageTop = CROP_SIZE / 2 - scaledH / 2 + offsetY;

  const sourceX = (-imageLeft) / scale;
  const sourceY = (-imageTop) / scale;
  const sourceSize = CROP_SIZE / scale;

  ctx.drawImage(imageEl, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không tạo được ảnh"))), "image/jpeg", 0.85);
  });

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function AvatarCropperModal({
  open,
  file,
  onClose,
  onCropped,
}: {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onCropped: (file: File) => void | Promise<void>;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [naturalWidth, setNaturalWidth] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !file) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setError("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  const baseScale = useMemo(() => {
    return Math.max(CROP_SIZE / naturalWidth, CROP_SIZE / naturalHeight);
  }, [naturalWidth, naturalHeight]);

  const scale = baseScale * zoom;

  useEffect(() => {
    setOffset((prev) => clampOffsets({ offsetX: prev.x, offsetY: prev.y, naturalWidth, naturalHeight, scale }));
  }, [naturalWidth, naturalHeight, scale]);

  if (!open || !file) {
    return null;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (isSaving) {
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || isSaving) {
      return;
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    setDrag({ x: e.clientX, y: e.clientY });
    setOffset((prev) => {
      const next = clampOffsets({
        offsetX: prev.x + dx,
        offsetY: prev.y + dy,
        naturalWidth,
        naturalHeight,
        scale,
      });
      return next;
    });
  };

  const onPointerUp = () => setDrag(null);

  const handleConfirm = async () => {
    if (!imgRef.current) {
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const cropped = await cropToPng({
        imageEl: imgRef.current,
        offsetX: offset.x,
        offsetY: offset.y,
        naturalWidth,
        naturalHeight,
        scale,
      });
      await onCropped(cropped);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không cắt được ảnh.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Cắt ảnh đại diện</h3>
            <p className="text-xs text-gray-600">Kéo ảnh để căn giữa, dùng thanh trượt để phóng to/thu nhỏ.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}

          <div
            className="relative mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden"
            style={{ width: CROP_SIZE, height: CROP_SIZE, touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              ref={imgRef}
              src={objectUrl}
              alt="Avatar preview"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNaturalWidth(el.naturalWidth || 1);
                setNaturalHeight(el.naturalHeight || 1);
              }}
              className="absolute left-1/2 top-1/2 select-none"
              style={{
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                transformOrigin: "center",
                imageRendering: "auto",
              }}
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span>Zoom</span>
              <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              disabled={isSaving}
              onChange={(e) => {
                const nextZoom = Number(e.target.value);
                setZoom(nextZoom);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Đang xử lý..." : "Dùng ảnh này"}
          </button>
        </div>
      </div>
    </div>
  );
}
