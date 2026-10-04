import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { registerSigningSurface } from "@/lib/signingOverlays";
import { Eraser, Check, Save, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  height?: number;
  label?: string;
}

/**
 * Signature is only handed to the parent after "Unterschrift speichern".
 * Lifting the finger never saves; saved signatures can be cleared and redone.
 */
export function SignaturePad({ onSignatureChange, height = 150, label = "Unterschrift des Kunden" }: SignaturePadProps) {
  useLayoutEffect(() => registerSigningSurface(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [saved, setSaved] = useState(false);

  const initCanvas = useCallback((force = false) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const containerWidth = container.clientWidth;
    // Mobile browsers fire resize when the address bar moves – keep the ink unless width changed.
    if (!force && containerWidth === widthRef.current) return;
    widthRef.current = containerWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    setHasInk(false);
    setSaved((wasSaved) => { if (wasSaved) onSignatureChange(null); return false; });
  }, [height, onSignatureChange]);

  useEffect(() => {
    initCanvas(true);
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (saved) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || saved) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };

  const stopDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasInk(false);
    setSaved(false);
    onSignatureChange(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    setSaved(true);
    onSignatureChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        ref={containerRef}
        className={`relative border-2 rounded-lg bg-white overflow-hidden touch-none ${saved ? "border-solid border-primary" : "border-dashed border-muted-foreground/30"}`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`block w-full ${saved ? "cursor-default" : "cursor-crosshair"}`}
          style={{ height: `${height}px` }}
        />
        {!hasInk && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm text-center px-4">Hier unterschreiben (Finger oder Stift)</p>
          </div>
        )}
        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 border-b border-muted-foreground/20 pointer-events-none" />
        <p className="absolute bottom-2 left-4 sm:left-8 text-[10px] text-muted-foreground pointer-events-none">Datum & Unterschrift</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {saved ? (
          <>
            <p className="text-xs text-green-600 flex items-center gap-1 mr-auto">
              <Check className="h-3 w-3" /> Unterschrift gespeichert
            </p>
            <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Löschen & neu unterschreiben
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mr-auto">
              {hasInk ? "Noch nicht gespeichert – bitte prüfen und speichern." : ""}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={clearSignature} disabled={!hasInk}>
              <Eraser className="h-3.5 w-3.5 mr-1" /> Löschen
            </Button>
            <Button type="button" size="sm" onClick={saveSignature} disabled={!hasInk}>
              <Save className="h-3.5 w-3.5 mr-1" /> Unterschrift speichern
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
