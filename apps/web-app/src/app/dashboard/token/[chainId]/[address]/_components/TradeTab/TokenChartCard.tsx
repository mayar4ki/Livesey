'use client';

import { Card, CardContent } from '@acme/ui/card';

// TradingViewWidget.jsx
import { memo, useEffect, useRef } from 'react';

const TradingViewWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!container.current || !widgetContainer.current) return;

    // Prevent double initialization
    if (isInitialized.current) return;

    // Clear any existing content first
    widgetContainer.current.innerHTML = '';

    // Check if script already exists in this container
    const existingScript = container.current.querySelector('script[src*="embed-widget-advanced-chart"]');
    if (existingScript) {
      isInitialized.current = true;
      return;
    }

    isInitialized.current = true;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "en",
          "save_image": true,
          "style": "1",
          "symbol": "NASDAQ:AAPL",
          "theme": "dark",
          "timezone": "Etc/UTC",
          "backgroundColor": "#0F0F0F",
          "gridColor": "rgba(242, 242, 242, 0.06)",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;

    container.current.appendChild(script);

    return () => {
      isInitialized.current = false;
      if (widgetContainer.current) {
        widgetContainer.current.innerHTML = '';
      }
      if (container.current) {
        const scriptToRemove = container.current.querySelector('script[src*="embed-widget-advanced-chart"]');
        if (scriptToRemove && container.current.contains(scriptToRemove)) {
          container.current.removeChild(scriptToRemove);
        }
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" ref={widgetContainer} style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
    </div>
  );
});

export function TokenChartCard() {
  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="h-[412px] w-full">{/* <TradingViewWidget /> */}</div>
      </CardContent>
    </Card>
  );
}
