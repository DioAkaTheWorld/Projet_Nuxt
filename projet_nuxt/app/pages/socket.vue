<script setup>
import { ref } from 'vue'

let ws = null
const messages = ref([])

const connect = async () => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";
  
  if (ws) {
    ws.close();
  }
  
  console.log("Connexion à", url, "...");
  ws = new WebSocket(url);
  
  ws.addEventListener("message", (event) => {
    const message = event.data;
    console.log(message);
    messages.value.push(message);
  });
  
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  console.log("ws connecté!");
};

const ping = () => {
  console.log("ws envoi ping");
  ws.send("ping");
};
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <div class="text-h6 mb-4">Messages: {{ messages }}</div>
      <v-btn color="success" class="mr-2" @click="connect">Connecter</v-btn>
      <v-btn color="info" @click="ping">Ping</v-btn>
    </v-card>
  </v-container>
</template>