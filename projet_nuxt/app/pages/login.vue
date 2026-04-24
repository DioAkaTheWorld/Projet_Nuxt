<script setup>
const username = ref('')
const password = ref('')
const errorMsg = ref('')

const { user } = useAuth() // On récupère notre outil global

const login = async () => {
  errorMsg.value = ''
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    
    if (res.success) {
      user.value = res.user // On met à jour l'état de l'application
      navigateTo('/')       // Retour à l'accueil !
    }
  } catch (e) {
    errorMsg.value = 'Identifiants incorrects. Veuillez réessayer.'
  }
}
</script>

<template>
  <v-container max-width="500" class="mt-10">
    <v-card class="pa-5" elevation="3">
      <v-card-title class="text-h5 font-weight-bold text-center mb-4">Connexion</v-card-title>
      
      <v-alert v-if="errorMsg" type="error" class="mb-4" density="compact">{{ errorMsg }}</v-alert>
      
      <v-form @submit.prevent="login">
        <v-text-field v-model="username" label="Nom d'utilisateur" prepend-inner-icon="mdi-account" variant="outlined" required></v-text-field>
        <v-text-field v-model="password" label="Mot de passe" prepend-inner-icon="mdi-lock" type="password" variant="outlined" required></v-text-field>
        
        <v-btn type="submit" color="primary" block size="large" class="mt-2">Se connecter</v-btn>
      </v-form>
      
      <v-card-actions class="justify-center mt-3">
        <v-btn variant="text" size="small" to="/register">Pas encore de compte ? S'inscrire</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>