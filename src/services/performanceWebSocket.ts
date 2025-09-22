// Simple WebSocket client for performance updates
export class PerformanceWebSocket {
  ws: WebSocket | null = null;
  onData: ((data: any) => void) | null = null;

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      // Optionally send a subscribe message
    };
    this.ws.onmessage = (event) => {
      if (this.onData) {
        try {
          const data = JSON.parse(event.data);
          this.onData(data);
        } catch (e) {
          // Ignore parse errors
        }
      }
    };
    this.ws.onerror = () => {};
    this.ws.onclose = () => {};
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
