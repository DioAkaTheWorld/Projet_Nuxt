const peers = new Set<any>()

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer)
    console.log("[WS] Nouveau client connecté")
  },
  message(peer, message) {
    const data = message.text()
    console.log("[WS] Signal reçu:", data)

    peers.forEach(p => {
      if (p !== peer) {
        p.send(data)
      }
    })
  },
  close(peer) {
    peers.delete(peer)
    console.log("[WS] Client déconnecté")
  },
  error(peer, error) {
    peers.delete(peer)
  }
})