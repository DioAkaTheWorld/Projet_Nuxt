<script setup>
const route = useRoute()
const subjectId = route.params.id
const { user } = useAuth()

const page = ref(1)
const { data, pending, refresh } = useFetch(() => `/api/subjects/${subjectId}?page=${page.value}`)

const dialog = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)

const editDialog = ref(false)
const editMessageId = ref(null)
const editContent = ref('')

const sendReply = async () => {
  if (!replyContent.value) return
  isSubmitting.value = true
  try {
    await $fetch('/api/messages/create', {
      method: 'POST',
      body: { subject_id: subjectId, content: replyContent.value }
    })
    replyContent.value = ''
    dialog.value = false
    await refresh()
  } catch (e) {
    alert("Erreur")
  } finally {
    isSubmitting.value = false
  }
}

const openEdit = (msg) => {
  editMessageId.value = msg.id
  editContent.value = msg.content
  editDialog.value = true
}

const sendEdit = async () => {
  if (!editContent.value) return
  try {
    await $fetch('/api/messages/edit', {
      method: 'POST',
      body: { message_id: editMessageId.value, content: editContent.value }
    })
    editDialog.value = false
    await refresh()
  } catch(e) {
    alert("Erreur lors de la modification")
  }
}

const deleteMessage = async (msgId) => {
  if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return
  try {
    await $fetch('/api/messages/delete', { method: 'POST', body: { message_id: msgId } })
    await refresh()
  } catch(e) {
    alert("Erreur")
  }
}

const deleteSubject = async () => {
  if (!confirm("ATTENTION : Voulez-vous vraiment supprimer ce sujet ET tous ses messages ?")) return
  try {
    await $fetch('/api/subjects/delete', { method: 'POST', body: { subject_id: subjectId } })
    navigateTo('/') 
  } catch(e) {
    alert("Erreur")
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <v-container max-width="900">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()" class="mb-4">Retour</v-btn>

    <v-card v-if="pending && !data" class="pa-5 text-center" elevation="0">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card>

    <div v-else-if="data">
      <v-row class="mb-6" align="center">
        <v-col>
          <h1 class="text-h4 font-weight-bold">{{ data.subject.title }}</h1>
        </v-col>
        <v-col class="text-right d-flex justify-end gap-2">
          <v-btn v-if="user && user.role === 'admin'" color="error" variant="outlined" prepend-icon="mdi-delete" @click="deleteSubject" class="mr-2">
            Supprimer le sujet
          </v-btn>
          <v-btn v-if="user" color="primary" prepend-icon="mdi-reply" @click="dialog = true">Répondre</v-btn>
        </v-col>
      </v-row>

      <v-timeline side="end" align="start" density="compact" class="mb-6">
        <v-timeline-item v-for="msg in data.messages" :key="msg.id" dot-color="primary" size="small">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="d-flex justify-space-between bg-grey-lighten-4 py-2 px-4">
              <span class="text-subtitle-1 font-weight-bold">{{ msg.author }}</span>
              <span class="text-caption text-grey-darken-1">{{ formatDate(msg.created_at) }}</span>
            </v-card-title>
            
            <v-card-text class="pa-4 text-body-1" style="white-space: pre-wrap;">
              {{ msg.content }}
            </v-card-text>

            <v-divider v-if="user && (user.username === msg.author || user.role === 'admin')"></v-divider>
            <v-card-actions v-if="user && (user.username === msg.author || user.role === 'admin')" class="px-4 py-2 bg-grey-lighten-5">
              <v-spacer></v-spacer>
              
              <v-btn size="small" color="primary" variant="text" prepend-icon="mdi-pencil" @click="openEdit(msg)">Modifier</v-btn>
              
              <v-btn v-if="user.role === 'admin'" size="small" color="error" variant="text" prepend-icon="mdi-delete" @click="deleteMessage(msg.id)">Supprimer</v-btn>
            </v-card-actions>

          </v-card>
        </v-timeline-item>
      </v-timeline>

      <v-pagination v-if="data.totalPages > 1" v-model="page" :length="data.totalPages" color="primary" class="mt-4"></v-pagination>

      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title class="bg-primary text-white pa-4">Répondre au sujet</v-card-title>
          <v-card-text class="pa-4">
            <v-textarea v-model="replyContent" label="Votre message" variant="outlined" rows="6" auto-grow required></v-textarea>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
            <v-btn color="primary" variant="flat" @click="sendReply" :loading="isSubmitting">Envoyer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="editDialog" max-width="600">
        <v-card>
          <v-card-title class="bg-primary text-white pa-4">Modifier le message</v-card-title>
          <v-card-text class="pa-4">
            <v-textarea v-model="editContent" label="Message" variant="outlined" rows="6" auto-grow required></v-textarea>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="editDialog = false">Annuler</v-btn>
            <v-btn color="primary" variant="flat" @click="sendEdit">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  </v-container>
</template>