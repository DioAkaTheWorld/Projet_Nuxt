<script setup>
const { data: forums, pending } = useFetch('/api/forums')
const { user, logout } = useAuth() // On récupère l'utilisateur et la fonction déconnexion
</script>

<template>
  <v-container max-width="900">
    <v-row class="mb-5 mt-3" align="center" justify="space-between">
      <v-col>
        <h1 class="text-h3 font-weight-bold text-primary">Forums</h1>
      </v-col>
      <v-col class="text-right">
        <template v-if="user">
          <v-chip color="success" class="mr-3" prepend-icon="mdi-account-circle">
            Bonjour, {{ user.username }}
          </v-chip>
          <v-btn color="error" variant="outlined" @click="logout">Déconnexion</v-btn>
        </template>
        
        <template v-else>
          <v-btn color="primary" variant="outlined" class="mr-3" to="/login">Se connecter</v-btn>
          <v-btn color="primary" to="/register">S'inscrire</v-btn>
        </template>
      </v-col>
    </v-row>

    <v-card v-if="pending" class="pa-5 text-center" elevation="0">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card>

    <v-row v-else>
      <v-col v-for="forum in forums" :key="forum.id" cols="12">
        <v-card hover elevation="2" class="pa-2">
          <v-card-item>
            <template v-slot:title>
              <v-icon icon="mdi-forum" color="primary" class="mr-2"></v-icon>
              {{ forum.title }}
            </template>
            <template v-slot:subtitle>
              <div class="mt-1 ml-8">{{ forum.description }}</div>
            </template>
          </v-card-item>
          
          <v-card-text class="text-right pb-2">
            <v-chip color="info" size="small" prepend-icon="mdi-file-document-outline">
              {{ forum.subjects_count }} sujet(s)
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>