import { ref } from 'vue'

const ws = ref<WebSocket | null>(null)

export const useSocket = () => {
  const connect = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) return
    
    const isSecure = location.protocol === "https:"
    const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws"
    
    ws.value = new WebSocket(url)
    
    ws.value.onopen = () => console.log("WebSocket connecté")
    ws.value.onclose = () => {
      console.log("WebSocket déconnecté, reconnexion dans 3s...")
      setTimeout(connect, 3000) // Reconnexion auto
    }
  }

  const sendSignal = (type: string, id: any) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type, id }))
    }
  }

  return { ws, connect, sendSignal }
}