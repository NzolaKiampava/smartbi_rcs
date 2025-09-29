// WebSocket client for performance updates with reconnection/backoff.
export class PerformanceWebSocket {
  ws: WebSocket | null = null;
  onData: ((data: any) => void) | null = null;
  onOpen: (() => void) | null = null;
  onClose: (() => void) | null = null;
  onError: ((err?: any) => void) | null = null;
  onReconnectAttempt: ((attempt: number) => void) | null = null;

  // Internal state for reconnection
  private url: string | null = null;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000; // 30s
  private reconnectTimer: any = null;

  /**
   * Connect to a WebSocket URL.
   * opts:
   *  - shouldReconnect: try reconnecting when closed
   *  - maxReconnectDelay: max backoff
   *  - authToken: optional token to authenticate
   *  - authAsQuery: if true, append token as ?token= to URL
   */
  connect(url: string, opts?: { shouldReconnect?: boolean; maxReconnectDelay?: number; authToken?: string; authAsQuery?: boolean }) {
    this.url = url;
    this.shouldReconnect = opts?.shouldReconnect ?? true;
    if (opts?.maxReconnectDelay) this.maxReconnectDelay = opts.maxReconnectDelay;
    if (opts?.authToken) this.authToken = opts.authToken;
    this.authAsQuery = !!opts?.authAsQuery;

    // create socket
    this.openSocket();
  }

  // optional auth token and whether to append it as query
  private authToken: string | null = null;
  private authAsQuery = false;

  private openSocket() {
    if (!this.url) return;

    try {
      let connectUrl = this.url;
      if (this.authToken && this.authAsQuery) {
        const sep = this.url!.includes('?') ? '&' : '?';
        connectUrl = `${this.url}${sep}token=${encodeURIComponent(this.authToken)}`;
      }

      this.ws = new WebSocket(connectUrl!);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        if (this.onOpen) this.onOpen();

        // If token provided and not sent via query, send auth message
        if (this.authToken && !this.authAsQuery) {
          try {
            this.ws!.send(JSON.stringify({ type: 'auth', token: this.authToken }));
          } catch (e) {
            // ignore
          }
        }
      };

      this.ws.onmessage = (event) => {
        if (this.onData) {
          try {
            const data = JSON.parse(event.data);
            this.onData(data);
          } catch (e) {
            // ignore parse errors
          }
        }
      };

      this.ws.onerror = (err) => {
        if (this.onError) this.onError(err);
      };

      this.ws.onclose = () => {
        if (this.onClose) this.onClose();
        // schedule reconnection
        if (this.shouldReconnect) this.scheduleReconnect();
      };
    } catch (e) {
      if (this.onError) this.onError(e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || !this.url) return;
    this.reconnectAttempts += 1;

    if (this.onReconnectAttempt) {
      try { this.onReconnectAttempt(this.reconnectAttempts); } catch (e) { /* ignore */ }
    }

    // exponential backoff with jitter
    const base = 1000; // 1s
    const exp = Math.min(base * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    const jitter = Math.floor(Math.random() * 1000);
    const delay = Math.min(exp + jitter, this.maxReconnectDelay);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, delay);
  }

  close() {
    // stop trying to reconnect
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
  }
}
