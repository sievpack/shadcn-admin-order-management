type MessageHandler = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string = ''
  private token: string = ''
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectInterval: number = 3000
  private handlers: Set<MessageHandler> = new Set()
  private onStatusChange: ((connected: boolean) => void) | null = null
  private shouldReconnect: boolean = true
  private isIntentionallyDisconnected: boolean = false

  connect(url: string, token: string) {
    this.url = url
    this.token = token
    this.shouldReconnect = true
    this.isIntentionallyDisconnected = false
    this.createConnection()
  }

  private createConnection() {
    if (this.ws) {
      this.ws.close()
    }

    const fullUrl = `${this.url}?token=${this.token}`
    this.ws = new WebSocket(fullUrl)

    this.ws.onopen = () => {
      this.onStatusChange?.(true)
    }

    this.ws.onclose = () => {
      this.onStatusChange?.(false)
      if (!this.isIntentionallyDisconnected) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }

    this.ws.onmessage = (event) => {
      if (event.data === 'pong') {
        return
      }
      try {
        const data = JSON.parse(event.data)
        this.handlers.forEach((handler) => handler(data))
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) {
      return
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.reconnectTimer = setTimeout(() => {
      this.createConnection()
    }, this.reconnectInterval)
  }

  send(data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  setOnStatusChange(callback: (connected: boolean) => void) {
    this.onStatusChange = callback
  }

  disconnect() {
    this.isIntentionallyDisconnected = true
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsClient = new WebSocketClient()
