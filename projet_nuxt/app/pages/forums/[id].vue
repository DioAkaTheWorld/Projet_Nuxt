<script setup>
const route = useRoute()
const forumId = route.params.id
const { user } = useAuth() 

const page = ref(1)

const { data, pending, refresh } = useFetch(() => `/api/forums/${forumId}?page=${page.value}`)

const dialog = ref(false)
const newTitle = ref('')
const newContent = ref('')
const submitError = ref('')
const isSubmitting = ref(false)
const { ws, connect, sendSignal } = useSocket()

const createSubject = async () => {
  if (!newTitle.value || !newContent.value) {
    submitError.value = "Veuillez remplir tous les champs."
    return
  }
  
  isSubmitting.value = true
  submitError.value = ''
  
  if (res.success) {
    sendSignal('update_forum', forumId)
    
    dialog.value = false
    refresh()
  }

  try {
    const res = await $fetch('/api/subjects/create', {
      method: 'POST',
      body: { forum_id: forumId, title: newTitle.value, content: newContent.value }
    })
    
    if (res.success) {
      dialog.value = false
      newTitle.value = ''
      newContent.value = ''
      page.value = 1       
      refresh()          
    }
  } catch (e) {
    submitError.value = e.data?.message || "Erreur lors de la création."
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  connect() 
  ws.value?.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'update_forum' && data.id == forumId) {
      refresh()
    }
  })
})

const formatDate = (dateString) => {
  if (!dateString) return 'Aucun message'
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}
</script>

<template>
  <v-container max-width="1000">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/" class="mb-4">Retour aux forums</v-btn>

    <v-card v-if="pending && !data" class="pa-5 text-center" elevation="0">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card>

    <div v-else-if="data">
      <v-row class="mb-4" align="center" justify="space-between">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary">{{ data.forum.title }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ data.forum.description }}</p>
        </v-col>
        
        <v-col cols="12" md="4" class="text-md-right text-left">
          <template v-if="user">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">Nouveau sujet</v-btn>
          </template>
          <template v-else>
            <v-alert type="info" variant="tonal" density="compact" class="text-caption">
              <NuxtLink to="/login" class="font-weight-bold">Connectez-vous</NuxtLink> pour créer un sujet.
            </v-alert>
          </template>
        </v-col>
      </v-row>

      <v-card elevation="2">
        <v-list lines="two">
          <v-list-item v-if="data.subjects.length === 0" class="text-center pa-4 text-grey">
            Aucun sujet dans ce forum. Soyez le premier !
          </v-list-item>

          <template v-for="(subject, index) in data.subjects" :key="subject.id">
            <v-list-item :to="`/subjects/${subject.id}`" hover>
              <template v-slot:prepend>
                <v-icon icon="mdi-message-text" color="primary" size="large" class="mr-4"></v-icon>
              </template>

              <v-list-item-title class="text-h6 font-weight-medium">{{ subject.title }}</v-list-item-title>
              <v-list-item-subtitle>
                Par <strong>{{ subject.author }}</strong> le {{ formatDate(subject.subject_date) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-right text-caption text-grey-darken-1" style="min-width: 150px;">
                  <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
                  Dernier message :<br>
                  <strong v-if="subject.last_message_author">{{ subject.last_message_author }}</strong>
                  <span v-else>Personne</span>
                  <br>
                  {{ formatDate(subject.last_message_date || subject.subject_date) }}
                </div>
              </template>
            </v-list-item>
            <v-divider v-if="index < data.subjects.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>

      <div class="text-center mt-4" v-if="data.totalPages > 1">
        <v-pagination v-model="page" :length="data.totalPages" color="primary"></v-pagination>
      </div>

      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 bg-primary text-white pa-4">Créer un nouveau sujet</v-card-title>
          <v-card-text class="pa-4">
            <v-alert v-if="submitError" type="error" density="compact" class="mb-4">{{ submitError }}</v-alert>
            
            <v-text-field v-model="newTitle" label="Titre du sujet" variant="outlined" required></v-text-field>
            <v-textarea v-model="newContent" label="Votre message" variant="outlined" rows="5" required></v-textarea>
          </v-card-text>
          
          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click="dialog = false" :disabled="isSubmitting">Annuler</v-btn>
            <v-btn color="primary" variant="flat" @click="createSubject" :loading="isSubmitting">Publier</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>