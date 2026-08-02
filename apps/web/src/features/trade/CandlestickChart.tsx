import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi, type ISeriesApi, type UTCTimestamp, type CandlestickData } from "lightweight-charts";
import type { Candle } from "@/lib/mock";

export default function CandlestickChart({ candles }: { candles: Candle[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevRef = useRef<Candle[] | null>(null);

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
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || candles.length === 0) return;
    const toBar = (c: Candle): CandlestickData => ({
      time: (c.time / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    });
    const prev = prevRef.current;
    const sameSeries = !!prev && prev.length > 0 && prev[0].time === candles[0].time;
    if (sameSeries && candles.length === prev!.length) {
      series.update(toBar(candles[candles.length - 1]));
    } else if (sameSeries && candles.length === prev!.length + 1) {
      series.update(toBar(candles[candles.length - 1]));
      chart.timeScale().fitContent();
    } else {
      series.setData(candles.map(toBar));
      chart.timeScale().fitContent();
    }
    prevRef.current = candles;
  }, [candles]);

  return <div ref={ref} className="w-full" />;
}
