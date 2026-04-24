<script setup>
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')

const { user } = useAuth() 

const register = async () => {
  errorMsg.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  try {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    
    if (res.success) {
      user.value = res.user
      navigateTo('/')
    }
  } catch (e) {
    errorMsg.value = e.data?.message || 'Une erreur est survenue.'
  }
}
</script>

<template>
  <v-container max-width="500" class="mt-10">
    <v-card class="pa-5" elevation="3">
      <v-card-title class="text-h5 font-weight-bold text-center mb-4">Créer un compte</v-card-title>
      
      <v-alert v-if="errorMsg" type="error" class="mb-4" density="compact">{{ errorMsg }}</v-alert>
      
      <v-form @submit.prevent="register">
        <v-text-field v-model="username" label="Choisissez un pseudo" prepend-inner-icon="mdi-account" variant="outlined" required></v-text-field>
        <v-text-field v-model="password" label="Mot de passe" prepend-inner-icon="mdi-lock" type="password" variant="outlined" required></v-text-field>
        <v-text-field v-model="confirmPassword" label="Confirmez le mot de passe" prepend-inner-icon="mdi-lock-check" type="password" variant="outlined" required></v-text-field>
        
        <v-btn type="submit" color="primary" block size="large" class="mt-2">S'inscrire</v-btn>
      </v-form>
      
      <v-card-actions class="justify-center mt-3">
        <v-btn variant="text" size="small" to="/login">Déjà un compte ? Se connecter</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>