import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/lib/mock";

export default function CandlestickChart({ candles }: { candles: Candle[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "#1b2230" },
      timeScale: { borderColor: "#1b2230", timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: 0,
        vertLine: { color: "#64748b", labelBackgroundColor: "#36425a" },
        horzLine: { color: "#64748b", labelBackgroundColor: "#36425a" },
      },
    });
    const series = chart.addCandlestickSeries({
      upColor: "#0ecb81",
      downColor: "#f6465d",
      borderVisible: false,
      wickUpColor: "#0ecb81",
      wickDownColor: "#f6465d",
    });
    chartRef.current = chart;
    seriesRef.current = series;
    chart.timeScale().fitContent();
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(
      candles.map((c) => ({
        time: (c.time / 1000) as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div ref={ref} className="w-full" />;
}
